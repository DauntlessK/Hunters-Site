<?php
// start_play.php
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

// Read JSON from request
$input = file_get_contents("php://input");
$data  = json_decode($input, true);

if (!is_array($data)) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

$sql = "
    INSERT INTO plays (
        play_date,
        captain_name,
        uboat_number,
        uboat_type,
        ip_address,
        user_agent
    )
    VALUES (
        NOW(),
        :captain_name,
        :uboat_number,
        :uboat_type,
        :ip_address,
        :user_agent
    )
";

$stmt = $pdo->prepare($sql);
$stmt->execute([
    ':captain_name' => $data['captain_name'] ?? null,
    ':uboat_number' => $data['uboat_number'] ?? null,
    ':uboat_type'   => $data['uboat_type']   ?? null,
    ':ip_address'   => $_SERVER['REMOTE_ADDR'] ?? null,
    ':user_agent'   => $_SERVER['HTTP_USER_AGENT'] ?? null
]);

echo json_encode([
    "status"  => "success",
    "play_id" => $pdo->lastInsertId()
]);
