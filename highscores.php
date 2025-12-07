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
    return match($status) {
        "alive", "survived" => "#4CAF50",   // green
        "kia", "killed"     => "#e53935",   // red
        "captured"          => "#fdd835",   // yellow
        "missing"           => "#9e9e9e",   // gray
        default             => "#90caf9"    // fallback blue
    };
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
#modal-bg {
    display:none;
    position:fixed; top:0; left:0;
    width:100%; height:100%;
    background:rgba(0,0,0,0.6);
    z-index:1000;
}

#modal-box {
    display:none;
    position:fixed;
    top:50%; left:50%;
    transform:translate(-50%, -50%);
    width:600px;
    max-height:80%;
    overflow-y:auto;
    background:#222;
    border:1px solid #555;
    padding:20px;
    z-index:1001;
    border-radius:6px;
    color:#eee;
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
<tr onclick="loadDetails(<?= $row['id'] ?>)" style="cursor:pointer;">
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
<div id="modal-bg"></div>

<div id="modal-box">
    <h2 id="modal-title">Loading...</h2>
    <div id="modal-content">Please wait...</div>
    <button onclick="closeModal()" style="
        margin-top:20px;
        padding:8px 16px;
        background:#444;
        border:none;
        color:white;
        cursor:pointer;
    ">Close</button>
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

// Load play details via AJAX
function loadDetails(id) {
    openModal();

    document.getElementById("modal-title").innerText = "Loading...";
    document.getElementById("modal-content").innerHTML = "Fetching details...";

    fetch("api/get_play.php?id=" + id)
        .then(r => r.json())
        .then(data => {
            if (data.status !== "success") {
                document.getElementById("modal-title").innerText = "Error";
                document.getElementById("modal-content").innerText = data.message;
                return;
            }

            const g = data.game;

            document.getElementById("modal-title").innerText =
                g.captain_name + " (" + g.uboat_number + ")";

            document.getElementById("modal-content").innerHTML = `
                <b>Rank:</b> ${g.rank}<br>
                <b>U-Boat Type:</b> ${g.uboat_type}<br>
                <b>Previous U-Boats:</b> ${g.previous_uboats}<br><br>

                <b>Patrols:</b> ${g.patrols}<br>
                <b>Tonnage Sunk:</b> ${g.tonnage_sunk} GRT<br>
                <b>Ships Sunk:</b> ${g.ships_sunk}<br>
                <b>Warships Sunk:</b> ${g.warships_sunk}<br>
                <b>Planes Shot Down:</b> ${g.num_planes_shot_down}<br><br>

                <b>Survival Status:</b> ${g.survival_status}<br>
                <b>End Date:</b> ${g.end_month} ${g.end_year}<br>
                <b>Cause:</b> ${g.game_over_cause}<br><br>

                <b>Times Detected:</b> ${g.times_detected}<br>
                <b>Damage Done:</b> ${g.damage_done}<br>
                <b>Hits Taken:</b> ${g.hits_taken}<br>
                <b>Random Events:</b> ${g.random_events}<br>
                <b>Sailors Lost:</b> ${g.sailors_lost}<br><br>

                <b>Months at Sea:</b> ${g.months_at_sea}<br>
                <b>Months in Port:</b> ${g.months_in_port}<br>
                <b>Successful Patrols:</b> ${g.successful_patrols}<br>
                <b>Unsuccessful Patrols:</b> ${g.unsuccessful_patrols}<br><br>

                <b>Plane Encounters:</b> ${g.num_plane_encounters}<br>
                <b>Plane Attacks:</b> ${g.num_plane_attacks}<br><br>

                <b>Awards:</b><br>
                Knights Cross: ${g.knights_cross}<br>
                War Badge: ${g.war_badge}<br>
                Front Clasp: ${g.front_clasp}<br>
                Wound Badge: ${g.wound_badge}<br>
                German Cross: ${g.german_cross}<br>
            `;
        })
        .catch(err => {
            document.getElementById("modal-title").innerText = "Error";
            document.getElementById("modal-content").innerText = err;
        });
}
</script>

</body>
</html>
