<?php
header("Content-Type: application/json");
require_once __DIR__ . '/db.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["status" => "error", "message" => "Missing id"]);
    exit;
}

$sql = "SELECT * FROM final_scores WHERE id = :id LIMIT 1";
$stmt = $pdo->prepare($sql);
$stmt->execute([':id' => $id]);
$game = $stmt->fetch();

if (!$game) {
    echo json_encode(["status" => "error", "message" => "Not found"]);
    exit;
}

echo json_encode(["status" => "success", "game" => $game]);
