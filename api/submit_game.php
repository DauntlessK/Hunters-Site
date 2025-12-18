<?php
// submit_game.php
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

// Read JSON body
$input = file_get_contents("php://input");
$data  = json_decode($input, true);

if (!is_array($data)) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

if (!isset($data['play_id'])) {
    echo json_encode(["status" => "error", "message" => "Missing play_id"]);
    exit;
}

// Insert final game data
$sql = "
    INSERT INTO final_scores (
        id,                   -- FK to plays(id)
        play_date,
        rank,
        captain_name,
        uboat_number,
        uboat_type,
        previous_uboats,
        starting_uboat_type,
        patrols,
        tonnage_sunk,
        ships_sunk,
        warships_sunk,
        num_planes_shot_down,
        survival_status,
        end_month,
        end_year,
        game_over_encounter,
        game_over_cause,
        knights_cross,
        war_badge,
        front_clasp,
        wound_badge,
        german_cross,
        times_detected,
        damage_done,
        hits_taken,
        random_events,
        sailors_lost,
        months_at_sea,
        months_in_port,
        successful_patrols,
        unsuccessful_patrols,
        num_plane_encounters,
        num_plane_attacks
    )
    VALUES (
        :id,
        NOW(),
        :rank,
        :captain_name,
        :uboat_number,
        :uboat_type,
        :previous_uboats,
        :patrols,
        :tonnage_sunk,
        :ships_sunk,
        :warships_sunk,
        :num_planes_shot_down,
        :survival_status,
        :end_month,
        :end_year,
        :game_over_encounter,
        :game_over_cause,
        :knights_cross,
        :war_badge,
        :front_clasp,
        :wound_badge,
        :german_cross,
        :times_detected,
        :damage_done,
        :hits_taken,
        :random_events,
        :sailors_lost,
        :months_at_sea,
        :months_in_port,
        :successful_patrols,
        :unsuccessful_patrols,
        :num_plane_encounters,
        :num_plane_attacks
    )
";

$stmt = $pdo->prepare($sql);

$stmt->execute([
    ':id'                   => $data['play_id'],
    ':rank'                 => $data['rank'] ?? null,
    ':captain_name'         => $data['captain_name'] ?? null,
    ':uboat_number'         => $data['uboat_number'] ?? null,
    ':uboat_type'           => $data['uboat_type'] ?? null,
    ':previous_uboats'      => $data['previous_uboats'] ?? 0,
    ':starting_uboat_type'  => $data['starting_uboat_type'] ?? null,
    ':patrols'              => $data['patrols'] ?? 0,
    ':tonnage_sunk'         => $data['tonnage_sunk'] ?? 0,
    ':ships_sunk'           => $data['ships_sunk'] ?? 0,
    ':warships_sunk'        => $data['warships_sunk'] ?? 0,
    ':num_planes_shot_down' => $data['num_planes_shot_down'] ?? 0,
    ':survival_status'      => $data['survival_status'] ?? null,
    ':end_month'            => $data['end_month'] ?? null,
    ':end_year'             => $data['end_year'] ?? null,
    ':game_over_encounter'  => $data['game_over_encounter'] ?? null,
    ':game_over_cause'      => $data['game_over_cause'] ?? null,
    ':knights_cross'        => $data['knights_cross'] ?? 0,
    ':war_badge'            => $data['war_badge'] ?? 0,
    ':front_clasp'          => $data['front_clasp'] ?? 0,
    ':wound_badge'          => $data['wound_badge'] ?? 0,
    ':german_cross'         => $data['german_cross'] ?? 0,
    ':times_detected'       => $data['times_detected'] ?? 0,
    ':damage_done'          => $data['damage_done'] ?? 0,
    ':hits_taken'           => $data['hits_taken'] ?? 0,
    ':random_events'        => $data['random_events'] ?? 0,
    ':sailors_lost'         => $data['sailors_lost'] ?? 0,
    ':months_at_sea'        => $data['months_at_sea'] ?? 0,
    ':months_in_port'       => $data['months_in_port'] ?? 0,
    ':successful_patrols'   => $data['successful_patrols'] ?? 0,
    ':unsuccessful_patrols' => $data['unsuccessful_patrols'] ?? 0,
    ':num_plane_encounters' => $data['num_plane_encounters'] ?? 0,
    ':num_plane_attacks'    => $data['num_plane_attacks'] ?? 0
]);

echo json_encode([
    "status" => "success",
    "message" => "Game record saved",
    "play_id" => $data['play_id']
]);
