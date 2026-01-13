-- =====================================================
-- Schema SQL pour Basketball Stats App
-- À exécuter dans l'éditeur SQL de Supabase
-- =====================================================

-- Activer l'extension UUID si pas déjà fait
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE: teams (Équipes)
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  logo_url TEXT,
  league VARCHAR(20) NOT NULL DEFAULT 'local' CHECK (league IN ('nba', 'local')),
  nba_team_id INTEGER, -- ID de l'API NBA si applicable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par ligue
CREATE INDEX IF NOT EXISTS idx_teams_league ON teams(league);

-- =====================================================
-- TABLE: players (Joueurs)
-- =====================================================
CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  first_name VARCHAR(50) NOT NULL,
  last_name VARCHAR(50) NOT NULL,
  jersey_number INTEGER,
  position VARCHAR(20) CHECK (position IN ('PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'C-F', 'G-F')),
  team_id TEXT REFERENCES teams(id) ON DELETE SET NULL,
  photo_url TEXT,
  league VARCHAR(20) NOT NULL DEFAULT 'local' CHECK (league IN ('nba', 'local')),
  nba_player_id INTEGER, -- ID de l'API NBA si applicable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche
CREATE INDEX IF NOT EXISTS idx_players_team ON players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_league ON players(league);

-- =====================================================
-- TABLE: matches (Matchs)
-- =====================================================
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  home_team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  away_team_id TEXT REFERENCES teams(id) ON DELETE CASCADE,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  home_score INTEGER DEFAULT 0,
  away_score INTEGER DEFAULT 0,
  league VARCHAR(20) NOT NULL DEFAULT 'local' CHECK (league IN ('nba', 'local')),
  nba_game_id INTEGER, -- ID de l'API NBA si applicable
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour recherche par date et statut
CREATE INDEX IF NOT EXISTS idx_matches_date ON matches(match_date);
CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_league ON matches(league);

-- =====================================================
-- TABLE: player_stats (Statistiques par match)
-- =====================================================
CREATE TABLE IF NOT EXISTS player_stats (
  id TEXT PRIMARY KEY,
  player_id TEXT REFERENCES players(id) ON DELETE CASCADE,
  match_id TEXT REFERENCES matches(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  rebounds INTEGER DEFAULT 0,
  assists INTEGER DEFAULT 0,
  steals INTEGER DEFAULT 0,
  blocks INTEGER DEFAULT 0,
  turnovers INTEGER DEFAULT 0,
  minutes_played DECIMAL(5,2) DEFAULT 0,
  field_goals_made INTEGER DEFAULT 0,
  field_goals_attempted INTEGER DEFAULT 0,
  three_pointers_made INTEGER DEFAULT 0,
  three_pointers_attempted INTEGER DEFAULT 0,
  free_throws_made INTEGER DEFAULT 0,
  free_throws_attempted INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(player_id, match_id)
);

-- Index pour les recherches
CREATE INDEX IF NOT EXISTS idx_player_stats_player ON player_stats(player_id);
CREATE INDEX IF NOT EXISTS idx_player_stats_match ON player_stats(match_id);

-- =====================================================
-- VUE: player_rankings (Classement agrégé)
-- =====================================================
CREATE OR REPLACE VIEW player_rankings AS
SELECT
  p.id,
  p.first_name,
  p.last_name,
  p.jersey_number,
  p.position,
  p.league,
  t.name as team_name,
  t.logo_url as team_logo,
  COUNT(ps.match_id) as games_played,
  COALESCE(SUM(ps.points), 0) as total_points,
  COALESCE(AVG(ps.points), 0) as avg_points,
  COALESCE(SUM(ps.rebounds), 0) as total_rebounds,
  COALESCE(AVG(ps.rebounds), 0) as avg_rebounds,
  COALESCE(SUM(ps.assists), 0) as total_assists,
  COALESCE(AVG(ps.assists), 0) as avg_assists,
  COALESCE(SUM(ps.steals), 0) as total_steals,
  COALESCE(AVG(ps.steals), 0) as avg_steals,
  COALESCE(SUM(ps.blocks), 0) as total_blocks,
  COALESCE(AVG(ps.blocks), 0) as avg_blocks
FROM players p
LEFT JOIN teams t ON p.team_id = t.id
LEFT JOIN player_stats ps ON p.id = ps.player_id
GROUP BY p.id, p.first_name, p.last_name, p.jersey_number, p.position, p.league, t.name, t.logo_url;

-- =====================================================
-- REALTIME: Activer les notifications en temps réel
-- =====================================================

-- Activer realtime sur les tables nécessaires
ALTER PUBLICATION supabase_realtime ADD TABLE player_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE teams;

-- =====================================================
-- RLS: Row Level Security (optionnel, pour production)
-- =====================================================

-- Activer RLS sur les tables
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique (tous peuvent lire)
CREATE POLICY "Lecture publique teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Lecture publique players" ON players FOR SELECT USING (true);
CREATE POLICY "Lecture publique matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Lecture publique player_stats" ON player_stats FOR SELECT USING (true);

-- Politique d'écriture (avec service role uniquement - géré par l'API)
CREATE POLICY "Écriture API teams" ON teams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Écriture API players" ON players FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Écriture API matches" ON matches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Écriture API player_stats" ON player_stats FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- DONNÉES DE TEST (optionnel)
-- =====================================================

-- Équipe locale de test
INSERT INTO teams (id, name, league) VALUES
  ('local-team-1', 'Paris Basket', 'local'),
  ('local-team-2', 'Lyon Basketball', 'local')
ON CONFLICT (id) DO NOTHING;

-- Joueurs de test
INSERT INTO players (id, first_name, last_name, jersey_number, position, team_id, league) VALUES
  ('local-player-1', 'Jean', 'Dupont', 23, 'PG', 'local-team-1', 'local'),
  ('local-player-2', 'Pierre', 'Martin', 7, 'SG', 'local-team-1', 'local'),
  ('local-player-3', 'Marc', 'Bernard', 11, 'SF', 'local-team-2', 'local'),
  ('local-player-4', 'Luc', 'Petit', 34, 'PF', 'local-team-2', 'local')
ON CONFLICT (id) DO NOTHING;

-- Match de test
INSERT INTO matches (id, home_team_id, away_team_id, match_date, status, home_score, away_score, league) VALUES
  ('local-match-1', 'local-team-1', 'local-team-2', NOW() - INTERVAL '1 day', 'completed', 85, 78, 'local')
ON CONFLICT (id) DO NOTHING;

-- Stats de test
INSERT INTO player_stats (id, player_id, match_id, points, rebounds, assists, steals, blocks) VALUES
  ('local-stat-1', 'local-player-1', 'local-match-1', 25, 5, 8, 2, 0),
  ('local-stat-2', 'local-player-2', 'local-match-1', 18, 3, 4, 1, 0),
  ('local-stat-3', 'local-player-3', 'local-match-1', 22, 8, 2, 3, 2),
  ('local-stat-4', 'local-player-4', 'local-match-1', 15, 12, 1, 0, 4)
ON CONFLICT (id) DO NOTHING;
