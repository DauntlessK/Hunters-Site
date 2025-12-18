<?php
require_once __DIR__ . '/api/db.php';

// --- SETTINGS ---
$resultsPerPage = 50;

// --- INPUTS ---
$page   = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
$search = isset($_GET['search']) ? trim($_GET['search']) : "";

// --- CALCULATE OFFSETS ---
$offset = ($page - 1) * $resultsPerPage;

// --- SEARCH FILTER ---
$whereClause = "";
$params = [];

if ($search !== "") {
    $whereClause = "WHERE captain_name LIKE :search";
    $params[':search'] = "%$search%";
}

// --- TOTAL COUNT ---
$countSql = "SELECT COUNT(*) FROM final_scores $whereClause";
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$totalResults = $countStmt->fetchColumn();

// --- MAIN QUERY ---
$sql = "
    SELECT 
        gp.id,
        gp.captain_name,
        gp.uboat_number,
        gp.uboat_type,
        gp.patrols,
        gp.tonnage_sunk,
        gp.ships_sunk,
        gp.end_month,
        gp.end_year,
        gp.survival_status,
        gp.game_over_cause
    FROM final_scores gp
    $whereClause
    ORDER BY gp.tonnage_sunk DESC
    LIMIT :offset, :limit
";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(':offset', (int)$offset, PDO::PARAM_INT);
$stmt->bindValue(':limit',  (int)$resultsPerPage, PDO::PARAM_INT);

foreach ($params as $key => $value) {
    $stmt->bindValue($key, $value);
}

$stmt->execute();
$rows = $stmt->fetchAll();

$totalPages = max(1, ceil($totalResults / $resultsPerPage));


// --- MONTH NAME HELPER ---
function monthName($num) {
    $months = [
        1=>"January",2=>"February",3=>"March",4=>"April",
        5=>"May",6=>"June",7=>"July",8=>"August",
        9=>"September",10=>"October",11=>"November",12=>"December"
    ];
    return $months[intval($num)] ?? "Unknown";
}

// --- SURVIVAL STATUS COLORING ---
function statusColor($status) {
    $status = strtolower($status);

    if ($status === "alive" || $status === "survived") {
        return "#4CAF50"; // green
    }
    if ($status === "kia" || $status === "killed") {
        return "#e53935"; // red
    }
    if ($status === "captured" || $status === "pow") {
        return "#fdd835"; // yellow
    }
    if ($status === "missing" || $status === "mia") {
        return "#b97106ff"; // orange
    }

    return "#90caf9"; // fallback blue
}


// --- TRUNCATE TEXT HELPER ---
function truncateText($text, $maxLen = 30) {
    if (strlen($text) <= $maxLen) return $text;
    return substr($text, 0, $maxLen) . "...";
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Hunters - High Scores</title>

<style>
body {
    background: #1a1a1a;
    color: #e7e7e7;
    font-family: Arial, sans-serif;
    padding: 20px;
}

table {
    width: 100%;
    border-collapse: collapse;
    background: #222;
    margin-top: 20px;
    table-layout: fixed; /* allows column width control */
}

table th, table td {
    padding: 10px;
    border: 1px solid #444;
    text-align: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

table th {
    background: #333;
}

/* Hover highlight */
table tr:hover {
    background-color: #333;
}

/* Column widths */
th.col-rank     { width: 5%; }
th.col-captain  { width: 18%; }
th.col-uboat    { width: 8%; }
th.col-type     { width: 8%; }
th.col-patrols  { width: 8%; }
th.col-tonnage  { width: 10%; }
th.col-ships    { width: 8%; }
th.col-enddate  { width: 12%; }
th.col-status   { width: 10%; }
th.col-cause    { width: 18%; }

.search-box {
    text-align: center;
    margin-bottom: 20px;
}
input[type="text"] {
    padding: 6px;
    width: 260px;
}
input[type="submit"] {
    padding: 6px 12px;
}

.cause-tooltip {
    cursor: help;
    color: #ccc;
    display: inline-block;
}

/* MODAL */
/* Modal overlay + box */
#modal-bg{
  display:none;
  position:fixed; inset:0;
  background:rgba(0,0,0,0.65);
  z-index:1000;
}
#modal-box{
  display:none;
  position:fixed;
  top:50%; left:50%;
  transform:translate(-50%,-50%);
  width:760px;
  max-width:92vw;
  max-height:84vh;
  background:#1f1f1f;
  border:1px solid #555;
  border-radius:10px;
  color:#eee;
  z-index:1001;
  overflow:hidden;
}

/* Top summary */
.modal-top{
  display:flex;
  gap:14px;
  padding:16px;
  border-bottom:1px solid #333;
  background:#202020;
}
.portrait{
  width:72px;
  height:72px;
  border-radius:50%;
  background:#2e2e2e;
  border:1px solid #444;
  flex:0 0 auto;
}
.top-main{ flex:1; min-width:0; }
.cmdr-name{
  font-size:18px;
  font-weight:bold;
  margin-bottom:4px;
}
.cmdr-sub{
  color:#bdbdbd;
  font-size:13px;
  margin-bottom:10px;
}
.top-stats{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:6px 16px;
  font-size:13px;
}
.top-stats .wide{ grid-column:1 / -1; }
.label{ color:#9aa6b2; }

/* Tabs */
.tabs{
  display:flex;
  gap:8px;
  padding:10px 16px;
  border-bottom:1px solid #333;
  background:#1d1d1d;
}
.tab{
  background:#2a2a2a;
  color:#eee;
  border:1px solid #444;
  padding:7px 10px;
  border-radius:7px;
  cursor:pointer;
  font-size:13px;
}
.tab.active{
  background:#3a3a3a;
  border-color:#666;
}

/* Panels */
.panel-wrap{
  padding:12px 16px 16px 16px;
  overflow:auto;
  max-height: calc(84vh - 72px - 52px - 54px); /* top + tabs + actions */
}
.panel{ display:none; }
.panel.active{ display:block; }

.grid{
  display:grid;
  grid-template-columns: 1fr 1fr;
  gap:10px 18px;
}
.item{
  background:#222;
  border:1px solid #333;
  border-radius:8px;
  padding:10px;
  font-size:13px;
}
.item .k{ color:#9aa6b2; font-size:12px; margin-bottom:4px; }
.item .v{ font-size:14px; }

/* Actions */
.modal-actions{
  padding:10px 16px;
  border-top:1px solid #333;
  display:flex;
  justify-content:flex-end;
  background:#1d1d1d;
}
.btn{
  padding:8px 14px;
  background:#444;
  border:none;
  color:#fff;
  cursor:pointer;
  border-radius:7px;
}

</style>
</head>

<body>

<h1>Hunters - High Scores</h1>

<!-- SEARCH FORM -->
<div class="search-box">
    <form action="highscores.php" method="GET">
        <input type="text" name="search" value="<?= htmlspecialchars($search) ?>" placeholder="Search Captain Name...">
        <input type="submit" value="Search">
    </form>
</div>

<!-- RESULTS TABLE -->
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
    $statusColor = statusColor($row['survival_status']);
    $fullCause   = htmlspecialchars($row['game_over_cause']);
?>
<tr onclick="loadDetails(<?= $row['id'] ?>, <?= $rankNumber ?>)" style="cursor:pointer;">
    <td><?= $rankNumber++ ?></td>
    <td><?= htmlspecialchars($row['captain_name']) ?></td>
    <td><?= htmlspecialchars($row['uboat_number']) ?></td>
    <td><?= htmlspecialchars($row['uboat_type']) ?></td>
    <td><?= $row['patrols'] ?></td>
    <td><?= number_format($row['tonnage_sunk']) ?></td>
    <td><?= $row['ships_sunk'] ?></td>
    <td><?= monthName($row['end_month']) . " " . htmlspecialchars($row['end_year']) ?></td>
    <td style="color: <?= $statusColor ?>;">
        <?= htmlspecialchars($row['survival_status']) ?>
    </td>
    <td>
        <span class="cause-tooltip" title="<?= $fullCause ?>">
            <?= htmlspecialchars(truncateText($row['game_over_cause'], 30)) ?>
        </span>
    </td>
</tr>
<?php endforeach; ?>
</table>


<!-- PAGINATION -->
<div class="pagination" style="text-align:center; margin-top:20px;">
    <?php if ($page > 1): ?>
        <a href="?page=<?= $page - 1 ?>&search=<?= urlencode($search) ?>">&laquo; Prev</a>
    <?php endif; ?>

    Page <?= $page ?> of <?= $totalPages ?>

    <?php if ($page < $totalPages): ?>
        <a href="?page=<?= $page + 1 ?>&search=<?= urlencode($search) ?>">Next &raquo;</a>
    <?php endif; ?>
</div>



<!-- MODAL ELEMENTS -->
<div id="modal-bg" onclick="closeModal()"></div>

<div id="modal-box">
  <!-- Top summary -->
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

  <!-- Tabs -->
  <div class="tabs">
    <button class="tab active" data-tab="patrols" onclick="setTab('patrols')">Patrols</button>
    <button class="tab" data-tab="sub" onclick="setTab('sub')">Sub</button>
    <button class="tab" data-tab="combat" onclick="setTab('combat')">Combat</button>
    <button class="tab" data-tab="awards" onclick="setTab('awards')">Awards</button>
  </div>

  <!-- Panels -->
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



<!-- MODAL JS -->
<script>

function openModal() {
  document.getElementById("modal-bg").style.display = "block";
  document.getElementById("modal-box").style.display = "block";
}
function closeModal() {
  document.getElementById("modal-bg").style.display = "none";
  document.getElementById("modal-box").style.display = "none";
}

function setTab(name) {
  document.querySelectorAll(".tab").forEach(b => b.classList.toggle("active", b.dataset.tab === name));
  document.querySelectorAll(".panel").forEach(p => p.classList.remove("active"));
  document.getElementById("panel-" + name).classList.add("active");
}

function monthName(num) {
  const months = {
    1:"January",2:"February",3:"March",4:"April",5:"May",6:"June",
    7:"July",8:"August",9:"September",10:"October",11:"November",12:"December"
  };
  return months[parseInt(num,10)] || "Unknown";
}

function fmtInt(n) {
  const x = parseInt(n, 10);
  if (isNaN(x)) return "0";
  return x.toLocaleString();
}

// --- Award helpers (JS) ---
function knightsCross(level) {
  switch (parseInt(level, 10)) {
    case 1: return "Knight's Cross";
    case 2: return "Knight's Cross with Oak Leaves";
    case 3: return "Knight's Cross with Oak Leaves and Swords";
    case 4: return "Knight's Cross with Oak Leaves, Swords, and Diamonds";
    case 5: return "Golden Knight's Cross with Oak Leaves, Swords, and Diamonds";
    default: return "No Award";
  }
}
function warBadge(level) {
  switch (parseInt(level, 10)) {
    case 1: return "U-Boat War Badge";
    case 2: return "U-Boat War Badge with Diamonds";
    default: return "No Award";
  }
}
function frontClasp(level) {
  switch (parseInt(level, 10)) {
    case 1: return "Front Clasp (Black)";
    case 2: return "Front Clasp (Silver)";
    case 3: return "Front Clasp (Gold)";
    default: return "No Award";
  }
}
function woundBadge(level) {
  switch (parseInt(level, 10)) {
    case 1: return "Wound Badge (Black)";
    case 2: return "Wound Badge (Silver)";
    case 3: return "Wound Badge (Gold)";
    default: return "No Award";
  }
}
function germanCross(level) {
  switch (parseInt(level, 10)) {
    case 1: return "German Cross (Black)";
    case 2: return "German Cross (Silver)";
    case 3: return "German Cross (Gold)";
    default: return "No Award";
  }
}

function renderGrid(items) {
  return `<div class="grid">` + items.map(it => `
    <div class="item">
      <div class="k">${it.k}</div>
      <div class="v">${it.v}</div>
    </div>
  `).join("") + `</div>`;
}

function loadDetails(id, leaderboardPos) {
  openModal();
  setTab("patrols");

  // Loading state
  document.getElementById("cmdr-name").innerText = "Loading...";
  document.getElementById("cmdr-subline").innerText = "";
  document.getElementById("cmdr-status").innerText = "";
  document.getElementById("cmdr-rankpos").innerText = "";
  document.getElementById("cmdr-tonnage").innerText = "";
  document.getElementById("cmdr-enddate").innerText = "";
  document.getElementById("cmdr-cause").innerText = "";

  document.getElementById("panel-patrols").innerHTML = "Fetching details...";
  document.getElementById("panel-sub").innerHTML = "";
  document.getElementById("panel-combat").innerHTML = "";
  document.getElementById("panel-awards").innerHTML = "";

  fetch("/Hunters_beta/api/get_play.php?id=" + encodeURIComponent(id))
    .then(r => r.json())
    .then(data => {
      if (data.status !== "success") {
        document.getElementById("panel-patrols").innerHTML = `<b>Error:</b> ${data.message}`;
        return;
      }

      const g = data.game;

      // --- Top summary ---
      const endDate = `${monthName(g.end_month)} ${g.end_year ?? ""}`.trim();

      document.getElementById("cmdr-name").innerText = `${g.captain_name} (${g.uboat_number})`;
      document.getElementById("cmdr-subline").innerText = `${g.rank || ""} • ${g.uboat_type || ""}`.replace(/^ • | • $/g, "");
      document.getElementById("cmdr-status").innerText = g.survival_status || "Unknown";
      document.getElementById("cmdr-rankpos").innerText = leaderboardPos ? `#${leaderboardPos}` : "—";
      document.getElementById("cmdr-tonnage").innerText = `${fmtInt(g.tonnage_sunk)} GRT`;
      document.getElementById("cmdr-enddate").innerText = endDate || "Unknown";
      document.getElementById("cmdr-cause").innerText = g.game_over_cause || "N/A";

      // --- Tab 1: Patrols ---
      document.getElementById("panel-patrols").innerHTML = renderGrid([
        { k: "Patrols", v: fmtInt(g.patrols) },
        { k: "Random Events", v: fmtInt(g.random_events) },
        { k: "Successful Patrols", v: fmtInt(g.successful_patrols) },
        { k: "Unsuccessful Patrols", v: fmtInt(g.unsuccessful_patrols) },
        { k: "Months at Sea", v: fmtInt(g.months_at_sea) },
        { k: "Months in Port", v: fmtInt(g.months_in_port) }
      ]);

      // --- Tab 2: Sub ---
        document.getElementById("panel-sub").innerHTML = renderGrid([
        { k: "U-Boat ID", v: g.uboat_number || "—" },
        { k: "U-Boat Type", v: g.uboat_type || "—" },
        { k: "Starting U-Boat Type", v: g.starting_uboat_type || "—" },
        { k: "Previous U-Boats", v: fmtInt(g.previous_uboats) }
        ]);


      // --- Tab 3: Combat ---
      document.getElementById("panel-combat").innerHTML = renderGrid([
        { k: "Ships Sunk", v: fmtInt(g.ships_sunk) },
        { k: "Tonnage Sunk", v: `${fmtInt(g.tonnage_sunk)} GRT` },
        { k: "Warships Sunk", v: fmtInt(g.warships_sunk) },
        { k: "Planes Shot Down", v: fmtInt(g.num_planes_shot_down) },
        { k: "Times Detected", v: fmtInt(g.times_detected) },
        { k: "Damage Done", v: fmtInt(g.damage_done) },
        { k: "Hits Taken", v: fmtInt(g.hits_taken) },
        { k: "Sailors Lost", v: fmtInt(g.sailors_lost) },
        { k: "Plane Encounters", v: fmtInt(g.num_plane_encounters) },
        { k: "Plane Attacks", v: fmtInt(g.num_plane_attacks) }
      ]);

      // --- Tab 4: Awards ---
      document.getElementById("panel-awards").innerHTML = renderGrid([
        { k: "Knight's Cross", v: knightsCross(g.knights_cross) },
        { k: "War Badge", v: warBadge(g.war_badge) },
        { k: "Front Clasp", v: frontClasp(g.front_clasp) },
        { k: "Wound Badge", v: woundBadge(g.wound_badge) },
        { k: "German Cross", v: germanCross(g.german_cross) }
      ]);
    })
    .catch(err => {
      document.getElementById("panel-patrols").innerHTML = `<b>Error:</b> ${String(err)}`;
    });
}

</script>

</body>
</html>
