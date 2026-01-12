<?php
// /api/log_error.php
header("Content-Type: application/json; charset=utf-8");

require_once __DIR__ . "/db.php";

// Always return JSON (even if something fails)
function respond($arr) {
  echo json_encode($arr);
  exit;
}

try {
  $raw = file_get_contents("php://input");
  $data = json_decode($raw, true);

  if (!is_array($data)) {
    respond(["status"=>"bad_request","message"=>"Invalid JSON"]);
  }

  // Basic truncation helpers
  $truncate = function($s, $n) {
    $s = (string)$s;
    if (strlen($s) <= $n) return $s;
    return substr($s, 0, $n);
  };

  $playId      = isset($data["play_id"]) ? (int)$data["play_id"] : null;
  $env         = $truncate($data["env"] ?? "", 10);
  $pageUrl     = $truncate($data["page_url"] ?? "", 255);
  $ua          = $truncate($data["user_agent"] ?? "", 255);
  $ip          = $truncate($data["ip_address"] ?? "", 45); // optional; you can also derive from $_SERVER
  $captain     = $truncate($data["captain_name"] ?? "", 50);
  $uboat       = $truncate($data["uboat_number"] ?? "", 10);

  $type        = $truncate($data["type"] ?? "Error", 60);
  $message     = $truncate($data["message"] ?? "Unknown error", 500);
  $stack       = $data["stack"] ?? null;

  $gameMonth   = isset($data["game_month"]) ? (int)$data["game_month"] : null;
  $gameYear    = isset($data["game_year"]) ? (int)$data["game_year"] : null;

  $extra       = isset($data["extra"]) ? json_encode($data["extra"]) : null;

  // Optional: use server-derived IP instead (recommended)
  if ($ip === "") {
    $ip = $truncate($_SERVER["REMOTE_ADDR"] ?? "", 45);
  }

  $sql = "
    INSERT INTO client_errors
      (play_id, env, page_url, user_agent, ip_address, captain_name, uboat_number,
       error_type, message, stack, game_month, game_year, extra)
    VALUES
      (:play_id, :env, :page_url, :user_agent, :ip_address, :captain_name, :uboat_number,
       :error_type, :message, :stack, :game_month, :game_year, :extra)
  ";

  $stmt = $pdo->prepare($sql);
  $stmt->execute([
    ":play_id" => $playId ?: null,
    ":env" => $env ?: null,
    ":page_url" => $pageUrl ?: null,
    ":user_agent" => $ua ?: null,
    ":ip_address" => $ip ?: null,
    ":captain_name" => $captain ?: null,
    ":uboat_number" => $uboat ?: null,
    ":error_type" => $type,
    ":message" => $message,
    ":stack" => $stack,
    ":game_month" => $gameMonth,
    ":game_year" => $gameYear,
    ":extra" => $extra,
  ]);

  respond(["status"=>"ok"]);
} catch (Throwable $e) {
  // Don't leak details to client
  respond(["status"=>"server_error"]);
}
