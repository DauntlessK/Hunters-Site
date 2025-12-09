<?php

$host = "kylebbcom.ipagemysql.com"; // ← real iPage value
$db   = "hunters_db";
$user = "hunters_user";
$pass = "RedWings1!";

$dsn = "mysql:host=$host;dbname=$db;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
} catch (PDOException $e) {
    echo json_encode(["status" => "db_error", "message" => $e->getMessage()]);
    exit;
}
