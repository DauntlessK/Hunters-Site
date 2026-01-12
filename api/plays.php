<?php
// plays.php (PHP 7.2 compatible)
// Admin page to browse all non-historical plays, with filters + summary + completion trend + uboat type trend + error flag.

require_once __DIR__ . "/db.php"; // IMPORTANT: plays.php is in /api, so db.php is in the same folder

// ---------------- SETTINGS ----------------
$resultsPerPage   = 50;
$maxUserAgentLen  = 70;

// ---------------- INPUTS ----------------
$page     = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$q        = isset($_GET['q']) ? trim($_GET['q']) : "";
$finished = isset($_GET['finished']) ? trim($_GET['finished']) : ""; // "", "1", "0"
$status   = isset($_GET['status']) ? trim($_GET['status']) : "";     // "", Alive/KIA/POW/MIA
$range    = isset($_GET['range']) ? trim($_GET['range']) : "";       // "", 24h, 7d, 30d

$offset = ($page - 1) * $resultsPerPage;

// ---------------- HELPERS ----------------
function h($s) {
    return htmlspecialchars((string)$s, ENT_QUOTES, "UTF-8");
}

function monthName($num) {
    $months = array(
        1=>"Jan",2=>"Feb",3=>"Mar",4=>"Apr",5=>"May",6=>"Jun",
        7=>"Jul",8=>"Aug",9=>"Sep",10=>"Oct",11=>"Nov",12=>"Dec"
    );
    $n = (int)$num;
    return isset($months[$n]) ? $months[$n] : "—";
}

function badgeClass($status) {
    switch ($status) {
        case "Alive": return "b-alive";
        case "KIA":   return "b-kia";
        case "POW":   return "b-pow";
        case "MIA":   return "b-mia";
        default:      return "b-unk";
    }
}

function url($overrides = array()) {
    $q = $_GET;

    foreach ($overrides as $k => $v) {
        if ($v === null) {
            unset($q[$k]);
        } else {
            $q[$k] = $v;
        }
    }

    $qs = http_build_query($q);
    return $qs ? ("?" . $qs) : "";
}

// ---------------- WHERE (NON-HISTORICAL ONLY) ----------------
$whereParts = array();
$params     = array();

// Always exclude historical
$whereParts[] = "p.is_historical = 0";

// Search (captain / uboat / IP)
if ($q !== "") {
    $whereParts[] = "(p.captain_name LIKE :q OR p.uboat_number LIKE :q OR p.uboat_type LIKE :q OR p.ip_address LIKE :q)";
    $params[":q"] = "%" . $q . "%";
}

// Finished filter based on presence of final_scores row
if ($finished === "1") {
    $whereParts[] = "fs.id IS NOT NULL";
} elseif ($finished === "0") {
    $whereParts[] = "fs.id IS NULL";
}

// Survival status filter
$validStatuses = array("Alive","KIA","POW","MIA");
if ($status !== "" && in_array($status, $validStatuses, true)) {
    $whereParts[] = "fs.survival_status = :status";
    $params[":status"] = $status;
}

// Time range filter
if ($range === "24h") {
    $whereParts[] = "p.play_date >= NOW() - INTERVAL 1 DAY";
} elseif ($range === "7d") {
    $whereParts[] = "p.play_date >= NOW() - INTERVAL 7 DAY";
} elseif ($range === "30d") {
    $whereParts[] = "p.play_date >= NOW() - INTERVAL 30 DAY";
}

$whereClause = "WHERE " . implode(" AND ", $whereParts);

// ---------------- DERIVED TABLE: one row per play that has at least one error ----------------
// NOTE: This prevents row-multiplication if a play has many errors.
$errorsDerivedSql = "(SELECT play_id FROM client_errors GROUP BY play_id)";

// ---------------- SUMMARY (GLOBAL, NON-HISTORICAL ONLY) ----------------
$summarySql = "
    SELECT
      COUNT(*) AS total_plays,
      COUNT(DISTINCT p.captain_name) AS unique_captains,
      COUNT(DISTINCT p.ip_address) AS unique_players,
      SUM(CASE WHEN fs.id IS NOT NULL THEN 1 ELSE 0 END) AS finished_plays,
      SUM(CASE WHEN fs.id IS NOT NULL AND fs.survival_status = 'Alive' THEN 1 ELSE 0 END) AS alive_finished,
      SUM(CASE WHEN e.play_id IS NOT NULL THEN 1 ELSE 0 END) AS plays_with_errors
    FROM plays p
    LEFT JOIN final_scores fs ON fs.id = p.id
    LEFT JOIN $errorsDerivedSql e ON e.play_id = p.id
    WHERE p.is_historical = 0
";
$summaryStmt = $pdo->prepare($summarySql);
$summaryStmt->execute();
$summary = $summaryStmt->fetch(PDO::FETCH_ASSOC);

$totalPlays      = $summary ? (int)$summary["total_plays"] : 0;
$uniqueCaptains  = $summary ? (int)$summary["unique_captains"] : 0;
$uniquePlayers   = $summary ? (int)$summary["unique_players"] : 0;
$finishedPlays   = $summary ? (int)$summary["finished_plays"] : 0;
$aliveFinished   = $summary ? (int)$summary["alive_finished"] : 0;
$playsWithErrors = $summary ? (int)$summary["plays_with_errors"] : 0;

$percentFinished = $totalPlays > 0 ? round(($finishedPlays / $totalPlays) * 100, 1) : 0.0;
$percentAlive    = $finishedPlays > 0 ? round(($aliveFinished / $finishedPlays) * 100, 1) : 0.0;

// ---------------- COUNT (FILTERED) ----------------
$countSql = "
    SELECT COUNT(*)
    FROM plays p
    LEFT JOIN final_scores fs ON fs.id = p.id
    LEFT JOIN $errorsDerivedSql e ON e.play_id = p.id
    $whereClause
";
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$totalResults = (int)$countStmt->fetchColumn();
$totalPages   = max(1, (int)ceil($totalResults / $resultsPerPage));

// Clamp page if too high
if ($page > $totalPages) {
    $page = $totalPages;
    $offset = ($page - 1) * $resultsPerPage;
}

// ---------------- MAIN QUERY (FILTERED) ----------------
$sql = "
    SELECT
      p.id,
      p.play_date,
      p.captain_name,
      p.uboat_number,
      p.uboat_type,
      p.ip_address,
      p.user_agent,
      fs.tonnage_sunk,
      fs.survival_status,
      fs.end_month,
      fs.end_year,
      CASE WHEN e.play_id IS NULL THEN 0 ELSE 1 END AS has_error
    FROM plays p
    LEFT JOIN final_scores fs ON fs.id = p.id
    LEFT JOIN $errorsDerivedSql e ON e.play_id = p.id
    $whereClause
    ORDER BY p.play_date DESC
    LIMIT :offset, :limit
";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(":offset", (int)$offset, PDO::PARAM_INT);
$stmt->bindValue(":limit",  (int)$resultsPerPage, PDO::PARAM_INT);
foreach ($params as $k => $v) {
    $stmt->bindValue($k, $v);
}
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// ---------------- TREND 1: Completion rate (last 14 days, non-historical) ----------------
$trendSql = "
    SELECT
      DATE(p.play_date) AS d,
      COUNT(*) AS plays,
      SUM(CASE WHEN fs.id IS NOT NULL THEN 1 ELSE 0 END) AS finished
    FROM plays p
    LEFT JOIN final_scores fs ON fs.id = p.id
    WHERE p.is_historical = 0
      AND p.play_date >= NOW() - INTERVAL 14 DAY
    GROUP BY DATE(p.play_date)
    ORDER BY d DESC
";
$trendStmt = $pdo->prepare($trendSql);
$trendStmt->execute();
$trend = $trendStmt->fetchAll(PDO::FETCH_ASSOC);

// ---------------- TREND 2: U-Boat chosen distribution (last 14 days, non-historical) ----------------
$uboatTypesWanted = array("VIIA","VIIB","VIIC","VIID","IXA","IXB","IXC");

// Build placeholders for IN (...)
$inParts = array();
$inParams = array();
for ($i = 0; $i < count($uboatTypesWanted); $i++) {
    $ph = ":t" . $i;
    $inParts[] = $ph;
    $inParams[$ph] = $uboatTypesWanted[$i];
}
$inClause = implode(",", $inParts);

$uboatTrendSql = "
    SELECT p.uboat_type, COUNT(*) AS cnt
    FROM plays p
    WHERE p.is_historical = 0
      AND p.uboat_type IN ($inClause)
    GROUP BY p.uboat_type
    ORDER BY cnt DESC
";

$uboatTrendStmt = $pdo->prepare($uboatTrendSql);
foreach ($inParams as $k => $v) {
    $uboatTrendStmt->bindValue($k, $v);
}
$uboatTrendStmt->execute();
$uboatCountsRaw = $uboatTrendStmt->fetchAll(PDO::FETCH_ASSOC);

// Normalize to include all types (even if 0)
$uboatCounts = array();
$maxUboatCnt = 0;
foreach ($uboatTypesWanted as $t) {
    $uboatCounts[$t] = 0;
}
foreach ($uboatCountsRaw as $r) {
    $t = (string)$r["uboat_type"];
    $c = (int)$r["cnt"];
    $uboatCounts[$t] = $c;
    if ($c > $maxUboatCnt) $maxUboatCnt = $c;
}
?>
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Hunters - Plays</title>
  <style>
    body { font-family: Arial, sans-serif; background:#111; color:#eee; margin:0; padding:16px; }
    .wrap { max-width: 1280px; margin: 0 auto; }
    h1 { margin: 0 0 10px 0; font-size: 22px; }
    .summary { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
    .card { background:#1b1b1b; border:1px solid #333; border-radius:10px; padding:12px 14px; min-width: 190px; }
    .card .k { color:#9aa6b2; font-size:12px; margin-bottom:6px; }
    .card .v { font-size:18px; font-weight:bold; }

    .filters { background:#1b1b1b; border:1px solid #333; border-radius:10px; padding:12px 14px; margin-bottom:14px; }
    .filters form { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
    input, select { background:#121212; border:1px solid #444; color:#eee; padding:8px 10px; border-radius:8px; }
    button { background:#2f2f2f; border:1px solid #555; color:#eee; padding:8px 12px; border-radius:8px; cursor:pointer; }
    button:hover { background:#3a3a3a; }
    a.linkbtn { text-decoration:none; }

    table { width:100%; border-collapse:collapse; background:#161616; border:1px solid #333; border-radius:10px; overflow:hidden; }
    th, td { padding:10px 10px; border-bottom:1px solid #2b2b2b; font-size:13px; vertical-align:top; }
    th { text-align:left; color:#9aa6b2; background:#151515; position:sticky; top:0; z-index:2; }
    tr:hover { background:#1e1e1e; }
    .muted { color:#aaa; }
    .mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

    .badge { display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; border:1px solid #444; }
    .b-alive { background: rgba(76,175,80,0.15); border-color: rgba(76,175,80,0.4); }
    .b-kia   { background: rgba(229,57,53,0.15); border-color: rgba(229,57,53,0.4); }
    .b-pow   { background: rgba(253,216,53,0.15); border-color: rgba(253,216,53,0.4); }
    .b-mia   { background: rgba(255,152,0,0.15); border-color: rgba(255,152,0,0.4); }
    .b-unk   { background: rgba(144,202,249,0.12); border-color: rgba(144,202,249,0.35); }

    .b-yes   { background: rgba(229,57,53,0.12); border-color: rgba(229,57,53,0.35); }
    .b-no    { background: rgba(76,175,80,0.10); border-color: rgba(76,175,80,0.25); }

    .charts { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
    .chart { flex:1 1 520px; background:#1b1b1b; border:1px solid #333; border-radius:10px; padding:12px 14px; }
    .chart .k { color:#9aa6b2; font-size:12px; margin-bottom:8px; }

    .pager { display:flex; gap:8px; align-items:center; justify-content:flex-end; margin-top:12px; }
    .pager a { color:#eee; text-decoration:none; border:1px solid #444; padding:7px 10px; border-radius:8px; background:#1b1b1b; }
    .pager a:hover { background:#2a2a2a; }
    .pager .disabled { opacity:0.45; pointer-events:none; }
  </style>
</head>
<body>
<div class="wrap">
  <h1>Plays (non-historical)</h1>

  <div class="summary">
    <div class="card"><div class="k">Total plays</div><div class="v"><?php echo number_format($totalPlays); ?></div></div>
    <div class="card"><div class="k">Games finished</div><div class="v"><?php echo number_format($finishedPlays); ?></div></div>
    <div class="card"><div class="k">% finished</div><div class="v"><?php echo h($percentFinished); ?>%</div></div>
    <div class="card"><div class="k">% Alive (finished)</div><div class="v"><?php echo h($percentAlive); ?>%</div></div>
    <div class="card"><div class="k">Unique captains</div><div class="v"><?php echo number_format($uniqueCaptains); ?></div></div>
    <div class="card"><div class="k">Unique players (IP)</div><div class="v"><?php echo number_format($uniquePlayers); ?></div></div>
    <div class="card"><div class="k">Plays w/ error</div><div class="v"><?php echo number_format($playsWithErrors); ?></div></div>
  </div>

  <div class="charts">
    <!-- Chart 1: Completion rate -->
    <div class="chart">
      <div class="k">Completion rate (last 14 days)</div>
      <?php if (!$trend): ?>
        <div class="muted">No data.</div>
      <?php else: ?>
        <?php foreach ($trend as $t): ?>
          <?php
            $plays = (int)$t["plays"];
            $fin   = (int)$t["finished"];
            $rate  = $plays > 0 ? (int)round(($fin / $plays) * 100) : 0;
          ?>
          <div style="display:flex; align-items:center; gap:10px; margin:6px 0;">
            <div class="mono" style="width:90px;"><?php echo h($t["d"]); ?></div>
            <div style="flex:1; background:#222; border-radius:6px; overflow:hidden;">
              <div style="width: <?php echo $rate; ?>%; background:#4caf50; padding:4px 6px; font-size:12px;">
                <?php echo $rate; ?>%
              </div>
            </div>
            <div class="mono" style="width:90px; text-align:right;">
              <?php echo $fin; ?>/<?php echo $plays; ?>
            </div>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>

    <!-- Chart 2: U-Boat chosen -->
    <div class="chart">
      <div class="k">U-Boat chosen (All Time)</div>
      <?php if ($maxUboatCnt <= 0): ?>
        <div class="muted">No data.</div>
      <?php else: ?>
        <?php foreach ($uboatTypesWanted as $t): ?>
          <?php
            $cnt = (int)$uboatCounts[$t];
            $pct = $maxUboatCnt > 0 ? (int)round(($cnt / $maxUboatCnt) * 100) : 0;
          ?>
          <div style="display:flex; align-items:center; gap:10px; margin:6px 0;">
            <div class="mono" style="width:60px;"><?php echo h($t); ?></div>
            <div style="flex:1; background:#222; border-radius:6px; overflow:hidden;">
              <div style="width: <?php echo $pct; ?>%; background:#90caf9; padding:4px 6px; font-size:12px; color:#111;">
                <?php echo $cnt; ?>
              </div>
            </div>
            <div class="mono" style="width:40px; text-align:right;"><?php echo $cnt; ?></div>
          </div>
        <?php endforeach; ?>
      <?php endif; ?>
    </div>
  </div>

  <div class="filters">
    <form method="GET">
      <input type="text" name="q" value="<?php echo h($q); ?>" placeholder="Search captain / uboat / IP..." style="min-width:260px;" />

      <select name="range">
        <option value="" <?php echo ($range==="") ? "selected" : ""; ?>>All time</option>
        <option value="24h" <?php echo ($range==="24h") ? "selected" : ""; ?>>Last 24h</option>
        <option value="7d"  <?php echo ($range==="7d")  ? "selected" : ""; ?>>Last 7 days</option>
        <option value="30d" <?php echo ($range==="30d") ? "selected" : ""; ?>>Last 30 days</option>
      </select>

      <select name="finished">
        <option value=""  <?php echo ($finished==="") ? "selected" : ""; ?>>All</option>
        <option value="1" <?php echo ($finished==="1") ? "selected" : ""; ?>>Finished only</option>
        <option value="0" <?php echo ($finished==="0") ? "selected" : ""; ?>>Unfinished only</option>
      </select>

      <select name="status">
        <option value="" <?php echo ($status==="") ? "selected" : ""; ?>>Any status</option>
        <option value="Alive" <?php echo ($status==="Alive") ? "selected" : ""; ?>>Alive</option>
        <option value="KIA"   <?php echo ($status==="KIA")   ? "selected" : ""; ?>>KIA</option>
        <option value="POW"   <?php echo ($status==="POW")   ? "selected" : ""; ?>>POW</option>
        <option value="MIA"   <?php echo ($status==="MIA")   ? "selected" : ""; ?>>MIA</option>
      </select>

      <button type="submit">Apply</button>

      <a class="linkbtn" href="<?php echo h(url(array("page"=>1,"q"=>null,"finished"=>null,"status"=>null,"range"=>null))); ?>">
        <button type="button">Reset</button>
      </a>

      <span class="muted" style="margin-left:auto;">
        Showing <?php echo number_format($totalResults); ?> result(s)
      </span>
    </form>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width:70px;">ID</th>
        <th style="width:170px;">Play Date</th>
        <th style="width:220px;">Captain</th>
        <th style="width:120px;">U-Boat</th>
        <th style="width:80px;">Type</th>
        <th style="width:80px;">Error</th>
        <th style="width:110px;">Finished</th>
        <th style="width:120px;">Tonnage</th>
        <th style="width:120px;">Status</th>
        <th style="width:110px;">End</th>
        <th>IP / User Agent</th>
      </tr>
    </thead>
    <tbody>
      <?php if (!$rows): ?>
        <tr><td colspan="11" class="muted">No results.</td></tr>
      <?php else: ?>
        <?php foreach ($rows as $r): ?>
          <?php
            $isFinished = ($r["tonnage_sunk"] !== null);
            $end = ($isFinished && $r["end_month"] && $r["end_year"])
                ? (monthName($r["end_month"]) . " " . $r["end_year"])
                : "—";

            $uaFull = isset($r["user_agent"]) ? (string)$r["user_agent"] : "";
            $uaShow = $uaFull;
            if (strlen($uaShow) > $maxUserAgentLen) {
                $uaShow = substr($uaShow, 0, $maxUserAgentLen) . "…";
            }

            $ip = (isset($r["ip_address"]) && $r["ip_address"] !== "") ? $r["ip_address"] : "—";
            $statusVal = isset($r["survival_status"]) ? (string)$r["survival_status"] : "";
            $hasError = isset($r["has_error"]) ? (int)$r["has_error"] : 0;
          ?>
          <tr>
            <td class="mono"><?php echo h($r["id"]); ?></td>
            <td class="mono"><?php echo h($r["play_date"]); ?></td>
            <td><?php echo h($r["captain_name"]); ?></td>
            <td class="mono"><?php echo h($r["uboat_number"]); ?></td>
            <td class="mono"><?php echo h($r["uboat_type"]); ?></td>

            <td>
              <?php if ($hasError): ?>
                <span class="badge b-yes">Yes</span>
              <?php else: ?>
                <span class="badge b-no">No</span>
              <?php endif; ?>
            </td>

            <td>
              <?php if ($isFinished): ?>
                <span class="badge">Yes</span>
              <?php else: ?>
                <span class="badge b-unk">No</span>
              <?php endif; ?>
            </td>

            <td class="mono"><?php echo $isFinished ? number_format((int)$r["tonnage_sunk"]) : "—"; ?></td>

            <td>
              <?php if ($isFinished): ?>
                <span class="badge <?php echo h(badgeClass($statusVal)); ?>">
                  <?php echo h($statusVal !== "" ? $statusVal : "—"); ?>
                </span>
              <?php else: ?>
                <span class="muted">—</span>
              <?php endif; ?>
            </td>

            <td class="mono"><?php echo h($end); ?></td>

            <td class="muted">
              <div class="mono"><?php echo h($ip); ?></div>
              <div title="<?php echo h($uaFull); ?>"><?php echo h($uaShow !== "" ? $uaShow : "—"); ?></div>
            </td>
          </tr>
        <?php endforeach; ?>
      <?php endif; ?>
    </tbody>
  </table>

  <div class="pager">
    <?php
      $prevDisabled = ($page <= 1);
      $nextDisabled = ($page >= $totalPages);
    ?>
    <a class="<?php echo $prevDisabled ? "disabled" : ""; ?>" href="<?php echo h(url(array("page"=>$page-1))); ?>">Prev</a>
    <span class="muted">Page <?php echo h($page); ?> / <?php echo h($totalPages); ?></span>
    <a class="<?php echo $nextDisabled ? "disabled" : ""; ?>" href="<?php echo h(url(array("page"=>$page+1))); ?>">Next</a>
  </div>

</div>
</body>
</html>
