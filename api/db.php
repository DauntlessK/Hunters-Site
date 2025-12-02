<?php
// db.php

// --- LOCAL DEVELOPMENT SETTINGS (XAMPP) ---
$DB_HOST = 'localhost';
$DB_NAME = 'hunters_game';
$DB_USER = 'root';
$DB_PASS = '';   // XAMPP default is empty password

// If you want to switch to your hosting later,
// you will update only these four lines.

$dsn = "mysql:host=$DB_HOST;dbname=$DB_NAME;charset=utf8mb4";

try {
    $pdo = new PDO($dsn, $DB_USER, $DB_PASS, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,  // throw errors as exceptions
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,        // fetch arrays by default
        PDO::ATTR_EMULATE_PREPARES   => false                    // use real prepared statements
    ]);
} catch (PDOException $e) {
    // If something goes wrong, return a JSON error and stop
    http_response_code(500);
    echo json_encode([
        "status"  => "error",
        "message" => "Database connection failed.",
        "error"   => $e->getMessage()
    ]);
    exit;
}