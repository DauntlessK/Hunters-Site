CREATE TABLE game_plays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    play_date DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Player Info
    rank VARCHAR(20),
    captain_name VARCHAR(50),
    uboat_number VARCHAR(10),
    uboat_type VARCHAR(4),   -- Only VII, VIIC, IXC, etc.
    previous_uboats INT, -- simple count of # of previous uboats commanded

    -- Career Stats
    patrols INT,
    tonnage_sunk INT,
    ships_sunk INT,
    warships_sunk INT,
    num_planes_shot_down INT,

    -- Ending Conditions
    survival_status VARCHAR(20),
    end_month VARCHAR(20),
    end_year INT,
    game_over_encounter VARCHAR(200),
    game_over_cause VARCHAR(200),

    -- Awards (levels stored as INT, 0 = none)
    knights_cross TINYINT UNSIGNED DEFAULT 0,
    war_badge TINYINT UNSIGNED DEFAULT 0,
    front_clasp TINYINT UNSIGNED DEFAULT 0,
    wound_badge TINYINT UNSIGNED DEFAULT 0,
    german_cross TINYINT UNSIGNED DEFAULT 0,

    -- Additional Stats
    times_detected INT,
    damage_done INT,
    hits_taken INT,
    random_events INT,
    sailors_lost INT,
    months_at_sea INT,
    months_in_port INT,
    successful_patrols INT,
    unsuccessful_patrols INT,
    num_plane_encounters INT,
    num_plane_attacks INT,

    -- Add more fields as needed
    ip_address VARCHAR(45),
    user_agent TEXT
);
