<?php
header('Content-Type: application/json');

// Try loading DB connection
require_once __DIR__ . '/db.php';

// If we get here, $pdo connected successfully
echo json_encode([
    "status" => "success",
    "message" => "Database connection working!",
    "server_time" => date('Y-m-d H:i:s')
]);
