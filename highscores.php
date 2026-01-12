<?php
require_once __DIR__ . '/api/db.php';

// ---------------- SETTINGS ----------------
$resultsPerPage = 50;

// ---------------- INPUTS ----------------
$page   = isset($_GET['page']) ? max(1, (int)$_GET['page']) : 1;
$q      = isset($_GET['q']) ? trim($_GET['q']) : "";
$range  = isset($_GET['range']) ? trim($_GET['range']) : "";     // "", 24h, 7d, 30d
$type   = isset($_GET['type']) ? trim($_GET['type']) : "";       // "", VIIA...
$status = isset($_GET['status']) ? trim($_GET['status']) : "";   // "", Alive/KIA/POW/MIA

// DEFAULT: show historical
$hist   = isset($_GET['hist']) ? trim($_GET['hist']) : "1";      // "0" hide, "1" show

$offset = ($page - 1) * $resultsPerPage;

// ---------------- HELPERS ----------------
function h($s) { return htmlspecialchars((string)$s, ENT_QUOTES, "UTF-8"); }

function monthName($num) {
    $months = array(
        1=>"January",2=>"February",3=>"March",4=>"April",
        5=>"May",6=>"June",7=>"July",8=>"August",
        9=>"September",10=>"October",11=>"November",12=>"December"
    );
    $n = (int)$num;
    return isset($months[$n]) ? $months[$n] : "Unknown";
}

function statusColor($status) {
    $status = strtolower((string)$status);
    if ($status === "alive" || $status === "survived") return "#4CAF50";
    if ($status === "kia" || $status === "killed") return "#e53935";
    if ($status === "captured" || $status === "pow") return "#fdd835";
    if ($status === "missing" || $status === "mia") return "#b97106ff";
    return "#90caf9";
}

function truncateText($text, $maxLen = 30) {
    $text = (string)$text;
    if (strlen($text) <= $maxLen) return $text;
    return substr($text, 0, $maxLen) . "...";
}

function url($overrides = array()) {
    $q = $_GET;
    foreach ($overrides as $k => $v) {
        if ($v === null) unset($q[$k]);
        else $q[$k] = $v;
    }
    $qs = http_build_query($q);
    return $qs ? ("?" . $qs) : "";
}

// ---------------- WHERE ----------------
$whereParts = array();
$params = array();

// Historical toggle (only filter out if explicitly hiding)
if ($hist !== "1") {
    $whereParts[] = "p.is_historical = 0";
}

// Search across multiple columns
if ($q !== "") {
    $whereParts[] = "(f.captain_name LIKE :q
                  OR f.uboat_number LIKE :q
                  OR f.uboat_type LIKE :q
                  OR f.rank LIKE :q
                  OR f.game_over_cause LIKE :q)";
    $params[":q"] = "%" . $q . "%";
}

// Time range filter uses plays.play_date (start time)
if ($range === "24h") {
    $whereParts[] = "p.play_date >= NOW() - INTERVAL 1 DAY";
} elseif ($range === "7d") {
    $whereParts[] = "p.play_date >= NOW() - INTERVAL 7 DAY";
} elseif ($range === "30d") {
    $whereParts[] = "p.play_date >= NOW() - INTERVAL 30 DAY";
}

// U-boat type filter
$validTypes = array("VIIA","VIIB","VIIC","VIID","IXA","IXB","IXC");
if ($type !== "" && in_array($type, $validTypes, true)) {
    $whereParts[] = "f.uboat_type = :type";
    $params[":type"] = $type;
}

// Status filter
$validStatuses = array("Alive","KIA","POW","MIA");
if ($status !== "" && in_array($status, $validStatuses, true)) {
    $whereParts[] = "f.survival_status = :status";
    $params[":status"] = $status;
}

$whereClause = "";
if (count($whereParts) > 0) {
    $whereClause = "WHERE " . implode(" AND ", $whereParts);
}

// ---------------- COUNT ----------------
$countSql = "
    SELECT COUNT(*)
    FROM final_scores f
    JOIN plays p ON p.id = f.id
    $whereClause
";
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$totalResults = (int)$countStmt->fetchColumn();
$totalPages = max(1, (int)ceil($totalResults / $resultsPerPage));

// Clamp page if too high
if ($page > $totalPages) {
    $page = $totalPages;
    $offset = ($page - 1) * $resultsPerPage;
}

// ---------------- MAIN QUERY ----------------
$sql = "
    SELECT
        f.id,
        f.rank,
        f.captain_name,
        f.uboat_number,
        f.uboat_type,
        f.patrols,
        f.tonnage_sunk,
        f.ships_sunk,
        f.end_month,
        f.end_year,
        f.survival_status,
        f.game_over_cause,
        p.is_historical
    FROM final_scores f
    JOIN plays p ON p.id = f.id
    $whereClause
    ORDER BY f.tonnage_sunk DESC
    LIMIT :offset, :limit
";
$stmt = $pdo->prepare($sql);
$stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
$stmt->bindValue(':limit',  (int)$resultsPerPage, PDO::PARAM_INT);
foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}
$stmt->execute();
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Hunters - High Scores</title>

<style>
/* Slightly larger overall */
body { font-family: Arial, sans-serif; background:#111; color:#eee; margin:0; padding:18px; font-size:16px; }
.wrap { max-width: 1320px; margin: 0 auto; }
h1 { margin: 0 0 12px 0; font-size: 26px; }

.filters { background:#1b1b1b; border:1px solid #333; border-radius:12px; padding:14px 16px; margin-bottom:16px; }
.filters form { display:flex; gap:12px; flex-wrap:wrap; align-items:center; }
input, select { background:#121212; border:1px solid #444; color:#eee; padding:10px 12px; border-radius:10px; font-size:15px; }
button { background:#2f2f2f; border:1px solid #555; color:#eee; padding:10px 14px; border-radius:10px; cursor:pointer; font-size:15px; }
button:hover { background:#3a3a3a; }
a.linkbtn { text-decoration:none; }

table { width:100%; border-collapse:collapse; background:#161616; border:1px solid #333; border-radius:12px; overflow:hidden; table-layout:fixed; }
th, td { padding:12px 10px; border-bottom:1px solid #2b2b2b; font-size:15px; vertical-align:top; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
th { color:#9aa6b2; background:#151515; position:sticky; top:0; z-index:2; text-align:center; }
tr:hover { background:#1e1e1e; cursor:pointer; }

.muted { color:#aaa; }
.mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; }

.cause-tooltip { cursor: help; color:#ccc; display:inline-block; }

/* Column widths */
th.col-rank     { width: 6%; }
th.col-captain  { width: 18%; text-align:left; }
th.col-uboat    { width: 9%; }
th.col-type     { width: 7%; }
th.col-patrols  { width: 7%; }
th.col-tonnage  { width: 12%; }
th.col-ships    { width: 7%; }
th.col-enddate  { width: 12%; }
th.col-status   { width: 9%; }
th.col-cause    { width: 13%; text-align:left; }
td.left { text-align:left; }

.pager { display:flex; gap:10px; align-items:center; justify-content:flex-end; margin-top:14px; }
.pager a { color:#eee; text-decoration:none; border:1px solid #444; padding:9px 12px; border-radius:10px; background:#1b1b1b; font-size:15px; }
.pager a:hover { background:#2a2a2a; }
.pager .disabled { opacity:0.45; pointer-events:none; }

/* Historical styling */
tr.historical { font-style: italic; color: #c8c8c8; }
tr.historical td:first-child::after { content: "†"; font-size: 12px; margin-left: 4px; color: #9aa6b2; }

/* Modal (unchanged, but slightly larger text) */
#modal-bg{ display:none; position:fixed; inset:0; background:rgba(0,0,0,0.65); z-index:1000; }
#modal-box{
  display:none; position:fixed; top:50%; left:50%;
  transform:translate(-50%,-50%);
  width:780px; max-width:92vw; max-height:84vh;
  background:#1f1f1f; border:1px solid #555; border-radius:12px;
  color:#eee; z-index:1001; overflow:hidden;
}
.modal-top{ display:flex; gap:14px; padding:16px; border-bottom:1px solid #333; background:#202020; }
.portrait{ width:74px; height:74px; border-radius:50%; background:#2e2e2e; border:1px solid #444; flex:0 0 auto; }
.top-main{ flex:1; min-width:0; }
.cmdr-name{ font-size:19px; font-weight:bold; margin-bottom:4px; }
.cmdr-sub{ color:#bdbdbd; font-size:14px; margin-bottom:10px; }
.top-stats{ display:grid; grid-template-columns: 1fr 1fr; gap:7px 16px; font-size:14px; }
.top-stats .wide{ grid-column:1 / -1; }
.label{ color:#9aa6b2; }

.tabs{ display:flex; gap:8px; padding:10px 16px; border-bottom:1px solid #333; background:#1d1d1d; }
.tab{ background:#2a2a2a; color:#eee; border:1px solid #444; padding:8px 11px; border-radius:9px; cursor:pointer; font-size:14px; }
.tab.active{ background:#3a3a3a; border-color:#666; }

.panel-wrap{ padding:12px 16px 16px 16px; overflow:auto; max-height: calc(84vh - 72px - 52px - 54px); }
.panel{ display:none; }
.panel.active{ display:block; }

.grid{ display:grid; grid-template-columns: 1fr 1fr; gap:10px 18px; }
.item{ background:#222; border:1px solid #333; border-radius:10px; padding:11px; font-size:14px; }
.item .k{ color:#9aa6b2; font-size:12px; margin-bottom:4px; }
.item .v{ font-size:15px; }

.modal-actions{ padding:10px 16px; border-top:1px solid #333; display:flex; justify-content:flex-end; background:#1d1d1d; }
.btn{ padding:9px 16px; background:#444; border:none; color:#fff; cursor:pointer; border-radius:9px; font-size:14px; }
</style>
</head>

<body>
<div class="wrap">
  <h1>Hunters - High Scores</h1>

  <!-- FILTERS -->
  <div class="filters">
    <form method="GET" action="highscores.php">
      <input type="text" name="q" value="<?php echo h($q); ?>" placeholder="Search captain / u-boat / type / rank / cause..." style="min-width:360px;" />

      <select name="range">
        <option value="" <?php echo ($range==="") ? "selected" : ""; ?>>All time</option>
        <option value="24h" <?php echo ($range==="24h") ? "selected" : ""; ?>>Last 24h</option>
        <option value="7d"  <?php echo ($range==="7d")  ? "selected" : ""; ?>>Last 7 days</option>
        <option value="30d" <?php echo ($range==="30d") ? "selected" : ""; ?>>Last 30 days</option>
      </select>

      <select name="type">
        <option value="" <?php echo ($type==="") ? "selected" : ""; ?>>All U-Boat types</option>
        <?php foreach ($validTypes as $t): ?>
          <option value="<?php echo h($t); ?>" <?php echo ($type===$t) ? "selected" : ""; ?>><?php echo h($t); ?></option>
        <?php endforeach; ?>
      </select>

      <select name="status">
        <option value="" <?php echo ($status==="") ? "selected" : ""; ?>>Any status</option>
        <?php foreach ($validStatuses as $s): ?>
          <option value="<?php echo h($s); ?>" <?php echo ($status===$s) ? "selected" : ""; ?>><?php echo h($s); ?></option>
        <?php endforeach; ?>
      </select>

      <!-- Default show historical -->
      <select name="hist" title="Include historical commanders">
        <option value="1" <?php echo ($hist==="1") ? "selected" : ""; ?>>Show historical</option>
        <option value="0" <?php echo ($hist!=="1") ? "selected" : ""; ?>>Hide historical</option>
      </select>

      <button type="submit">Apply</button>

      <a class="linkbtn" href="<?php echo h(url(array("page"=>1,"q"=>null,"range"=>null,"type"=>null,"status"=>null,"hist"=>"1"))); ?>">
        <button type="button">Reset</button>
      </a>

      <span class="muted" style="margin-left:auto;">
        Showing <?php echo number_format($totalResults); ?> result(s)
      </span>
    </form>
  </div>

  <!-- TABLE -->
  <table>
    <tr>
      <th class="col-rank">Rank</th>
      <th class="col-captain">Captain</th>
      <th class="col-uboat">U-Boat</th>
      <th class="col-type">Type</th>
      <th class="col-patrols">Patrols</th>
      <th class="col-tonnage">Tonnage (GRT)</th>
      <th class="col-ships">Ships Sunk</th>
      <th class="col-enddate">End Date</th>
      <th class="col-status">Status</th>
      <th class="col-cause">Cause</th>
    </tr>

    <?php
      $rankNumber = $offset + 1;
      foreach ($rows as $row):
        $statusCol = statusColor($row['survival_status']);
        $fullCause = h($row['game_over_cause']);
        $isHist = (int)$row['is_historical'] === 1;
    ?>
      <tr class="<?php echo $isHist ? "historical" : ""; ?>"
          onclick="loadDetails(<?php echo (int)$row['id']; ?>, <?php echo (int)$rankNumber; ?>)">
        <td><?php echo (int)$rankNumber++; ?></td>
        <td class="left"><?php echo h($row['captain_name']); ?></td>
        <td class="mono"><?php echo h($row['uboat_number']); ?></td>
        <td class="mono"><?php echo h($row['uboat_type']); ?></td>
        <td><?php echo (int)$row['patrols']; ?></td>
        <td class="mono"><?php echo number_format((int)$row['tonnage_sunk']); ?></td>
        <td><?php echo (int)$row['ships_sunk']; ?></td>
        <td><?php echo monthName($row['end_month']) . " " . h($row['end_year']); ?></td>
        <td style="color: <?php echo h($statusCol); ?>;">
          <?php echo h($row['survival_status']); ?>
        </td>
        <td class="left">
          <span class="cause-tooltip" title="<?php echo $fullCause; ?>">
            <?php echo h(truncateText($row['game_over_cause'], 30)); ?>
          </span>
        </td>
      </tr>
    <?php endforeach; ?>
  </table>

  <!-- PAGER -->
  <div class="pager">
    <?php $prevDisabled = ($page <= 1); $nextDisabled = ($page >= $totalPages); ?>
    <a class="<?php echo $prevDisabled ? "disabled" : ""; ?>" href="<?php echo h(url(array("page"=>$page-1))); ?>">&laquo; Prev</a>
    <span class="muted">Page <?php echo (int)$page; ?> / <?php echo (int)$totalPages; ?></span>
    <a class="<?php echo $nextDisabled ? "disabled" : ""; ?>" href="<?php echo h(url(array("page"=>$page+1))); ?>">Next &raquo;</a>
  </div>

</div>

<!-- MODAL ELEMENTS + JS: keep your existing ones below (unchanged) -->
<div id="modal-bg" onclick="closeModal()"></div>

<div id="modal-box">
  <div class="modal-top">
    <div class="portrait" id="cmdr-portrait" aria-hidden="true"></div>

    <div class="top-main">
      <div class="cmdr-name" id="cmdr-name">Loading...</div>
      <div class="cmdr-sub" id="cmdr-subline"></div>

      <div class="top-stats">
        <div><span class="label">Status:</span> <span id="cmdr-status"></span></div>
        <div><span class="label">Leaderboard:</span> <span id="cmdr-rankpos"></span></div>
        <div><span class="label">Tonnage:</span> <span id="cmdr-tonnage"></span></div>
        <div><span class="label">End:</span> <span id="cmdr-enddate"></span></div>
        <div class="wide"><span class="label">Cause:</span> <span id="cmdr-cause"></span></div>
      </div>
    </div>
  </div>

  <div class="tabs">
    <button class="tab active" data-tab="patrols" onclick="setTab('patrols')">Patrols</button>
    <button class="tab" data-tab="sub" onclick="setTab('sub')">Sub</button>
    <button class="tab" data-tab="combat" onclick="setTab('combat')">Combat</button>
    <button class="tab" data-tab="awards" onclick="setTab('awards')">Awards</button>
  </div>

  <div class="panel-wrap">
    <div class="panel active" id="panel-patrols"></div>
    <div class="panel" id="panel-sub"></div>
    <div class="panel" id="panel-combat"></div>
    <div class="panel" id="panel-awards"></div>
  </div>

  <div class="modal-actions">
    <button class="btn" onclick="closeModal()">Close</button>
  </div>
</div>

<script>
// (your existing JS unchanged)
<?php /* Keep the JS exactly as you had it */ ?>
</script>

</body>
</html>
