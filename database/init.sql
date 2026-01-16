-- ===========================================
-- BASKETBALL STATS - SCRIPT D'INITIALISATION BDD
-- ===========================================
-- Importez ce fichier dans phpMyAdmin sur Hostinger
-- Bases de donnees > phpMyAdmin > Importer

-- Configuration du charset
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- ===========================================
-- SUPPRESSION DES TABLES EXISTANTES (si elles existent)
-- ===========================================
DROP TABLE IF EXISTS `player_stats`;
DROP TABLE IF EXISTS `players`;
DROP TABLE IF EXISTS `matches`;
DROP TABLE IF EXISTS `teams`;
DROP TABLE IF EXISTS `users`;

-- ===========================================
-- TABLE: users (Utilisateurs)
-- ===========================================
CREATE TABLE `users` (
    `id` VARCHAR(30) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `name` VARCHAR(100) NULL,
    `role` ENUM('admin', 'scorer', 'viewer') NOT NULL DEFAULT 'viewer',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: teams (Equipes)
-- ===========================================
CREATE TABLE `teams` (
    `id` VARCHAR(30) NOT NULL,
    `name` VARCHAR(100) NOT NULL,
    `logo_url` TEXT NULL,
    `league` ENUM('nba', 'local') NOT NULL DEFAULT 'local',
    `nba_team_id` INT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    KEY `teams_league_idx` (`league`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: players (Joueurs)
-- ===========================================
CREATE TABLE `players` (
    `id` VARCHAR(30) NOT NULL,
    `first_name` VARCHAR(50) NOT NULL,
    `last_name` VARCHAR(50) NOT NULL,
    `jersey_number` INT NULL,
    `position` ENUM('PG', 'SG', 'SF', 'PF', 'C') NULL,
    `team_id` VARCHAR(30) NULL,
    `photo_url` TEXT NULL,
    `league` ENUM('nba', 'local') NOT NULL DEFAULT 'local',
    `nba_player_id` INT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    KEY `players_team_id_idx` (`team_id`),
    KEY `players_league_idx` (`league`),
    CONSTRAINT `players_team_id_fkey` FOREIGN KEY (`team_id`) REFERENCES `teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: matches (Matchs)
-- ===========================================
CREATE TABLE `matches` (
    `id` VARCHAR(30) NOT NULL,
    `home_team_id` VARCHAR(30) NOT NULL,
    `away_team_id` VARCHAR(30) NOT NULL,
    `match_date` DATETIME(3) NOT NULL,
    `status` ENUM('scheduled', 'in_progress', 'completed') NOT NULL DEFAULT 'scheduled',
    `home_score` INT NOT NULL DEFAULT 0,
    `away_score` INT NOT NULL DEFAULT 0,
    `league` ENUM('nba', 'local') NOT NULL DEFAULT 'local',
    `nba_game_id` INT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    KEY `matches_match_date_idx` (`match_date`),
    KEY `matches_status_idx` (`status`),
    KEY `matches_league_idx` (`league`),
    CONSTRAINT `matches_home_team_id_fkey` FOREIGN KEY (`home_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `matches_away_team_id_fkey` FOREIGN KEY (`away_team_id`) REFERENCES `teams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- TABLE: player_stats (Statistiques par match)
-- ===========================================
CREATE TABLE `player_stats` (
    `id` VARCHAR(30) NOT NULL,
    `player_id` VARCHAR(30) NOT NULL,
    `match_id` VARCHAR(30) NOT NULL,
    `points` INT NOT NULL DEFAULT 0,
    `rebounds` INT NOT NULL DEFAULT 0,
    `assists` INT NOT NULL DEFAULT 0,
    `steals` INT NOT NULL DEFAULT 0,
    `blocks` INT NOT NULL DEFAULT 0,
    `turnovers` INT NOT NULL DEFAULT 0,
    `minutes_played` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `field_goals_made` INT NOT NULL DEFAULT 0,
    `field_goals_attempted` INT NOT NULL DEFAULT 0,
    `three_pointers_made` INT NOT NULL DEFAULT 0,
    `three_pointers_attempted` INT NOT NULL DEFAULT 0,
    `free_throws_made` INT NOT NULL DEFAULT 0,
    `free_throws_attempted` INT NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    UNIQUE KEY `player_stats_player_id_match_id_key` (`player_id`, `match_id`),
    KEY `player_stats_player_id_idx` (`player_id`),
    KEY `player_stats_match_id_idx` (`match_id`),
    CONSTRAINT `player_stats_player_id_fkey` FOREIGN KEY (`player_id`) REFERENCES `players` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `player_stats_match_id_fkey` FOREIGN KEY (`match_id`) REFERENCES `matches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================
-- UTILISATEUR ADMIN PAR DEFAUT
-- ===========================================
-- Email: admin@basketball.com
-- Mot de passe: Admin123!
-- (hash bcrypt du mot de passe)
INSERT INTO `users` (`id`, `email`, `password`, `name`, `role`) VALUES
('admin001', 'admin@basketball.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqHq7F1yvWGJKo/pvPGIHRuqR6m', 'Administrateur', 'admin');

-- ===========================================
-- DONNEES DE DEMONSTRATION (Optionnel)
-- ===========================================

-- Equipes de demonstration
INSERT INTO `teams` (`id`, `name`, `league`) VALUES
('team-local-001', 'Lions de Paris', 'local'),
('team-local-002', 'Tigres de Lyon', 'local'),
('team-local-003', 'Aigles de Marseille', 'local'),
('team-local-004', 'Wolves de Bordeaux', 'local');

-- Joueurs de demonstration
INSERT INTO `players` (`id`, `first_name`, `last_name`, `jersey_number`, `position`, `team_id`, `league`) VALUES
('player-001', 'Lucas', 'Martin', 23, 'PG', 'team-local-001', 'local'),
('player-002', 'Thomas', 'Bernard', 7, 'SG', 'team-local-001', 'local'),
('player-003', 'Hugo', 'Dubois', 15, 'SF', 'team-local-001', 'local'),
('player-004', 'Nathan', 'Robert', 32, 'PF', 'team-local-001', 'local'),
('player-005', 'Leo', 'Richard', 44, 'C', 'team-local-001', 'local'),
('player-006', 'Antoine', 'Petit', 11, 'PG', 'team-local-002', 'local'),
('player-007', 'Maxime', 'Durand', 3, 'SG', 'team-local-002', 'local'),
('player-008', 'Alexandre', 'Leroy', 21, 'SF', 'team-local-002', 'local'),
('player-009', 'Julien', 'Moreau', 5, 'PF', 'team-local-002', 'local'),
('player-010', 'Clement', 'Simon', 50, 'C', 'team-local-002', 'local');

-- Match de demonstration
INSERT INTO `matches` (`id`, `home_team_id`, `away_team_id`, `match_date`, `status`, `home_score`, `away_score`, `league`) VALUES
('match-001', 'team-local-001', 'team-local-002', '2026-01-20 20:00:00', 'scheduled', 0, 0, 'local'),
('match-002', 'team-local-003', 'team-local-004', '2026-01-21 19:30:00', 'scheduled', 0, 0, 'local');

-- ===========================================
-- FIN DU SCRIPT
-- ===========================================
SELECT 'Base de donnees initialisee avec succes!' AS message;
