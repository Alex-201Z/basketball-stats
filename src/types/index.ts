// Types pour l'application de classement basketball

// Ligues disponibles
export type LeagueType = 'nba' | 'local' | 'all';

// Positions des joueurs
export type PlayerPosition = 'PG' | 'SG' | 'SF' | 'PF' | 'C';

// Statut d'un match
export type MatchStatus = 'scheduled' | 'in_progress' | 'completed';

// Catégories de classement
export type RankingCategory = 'points' | 'rebounds' | 'assists' | 'steals' | 'blocks' | 'global';

// Interface Équipe
export interface Team {
  id: string;
  name: string;
  logo_url?: string;
  league: LeagueType;
  created_at: string;
}

// Interface Joueur
export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  position?: PlayerPosition;
  team_id: string;
  photo_url?: string;
  league: LeagueType;
  nba_player_id?: number; // ID de l'API NBA si applicable
  created_at: string;
}

// Interface Joueur avec équipe (pour affichage)
export interface PlayerWithTeam extends Player {
  team: Team;
}

// Interface Match
export interface Match {
  id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  status: MatchStatus;
  home_score: number;
  away_score: number;
  league: LeagueType;
  nba_game_id?: number; // ID de l'API NBA si applicable
  created_at: string;
}

// Interface Match avec équipes (pour affichage)
export interface MatchWithTeams extends Match {
  home_team: Team;
  away_team: Team;
}

// Interface Statistiques d'un joueur pour un match
export interface PlayerStats {
  id: string;
  player_id: string;
  match_id: string;
  points: number;
  rebounds: number;
  assists: number;
  steals: number;
  blocks: number;
  turnovers: number;
  minutes_played: number;
  field_goals_made: number;
  field_goals_attempted: number;
  three_pointers_made: number;
  three_pointers_attempted: number;
  free_throws_made: number;
  free_throws_attempted: number;
  updated_at: string;
}

// Interface pour le classement d'un joueur
export interface PlayerRanking {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  position?: PlayerPosition;
  team_name: string;
  team_logo?: string;
  league: LeagueType;
  games_played: number;
  total_points: number;
  avg_points: number;
  total_rebounds: number;
  avg_rebounds: number;
  total_assists: number;
  avg_assists: number;
  total_steals: number;
  avg_steals: number;
  total_blocks: number;
  avg_blocks: number;
  // Score global (moyenne de toutes les stats normalisées)
  global_score?: number;
}

// Interface pour les filtres de classement
export interface RankingFilters {
  league: LeagueType;
  category: RankingCategory;
  limit: number;
  dateFrom?: string;
  dateTo?: string;
}

// Interface pour la réponse de l'API NBA (balldontlie)
export interface NBAApiPlayer {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height: string;
  weight: string;
  jersey_number: string;
  college: string;
  country: string;
  draft_year: number;
  draft_round: number;
  draft_number: number;
  team: NBAApiTeam;
}

export interface NBAApiTeam {
  id: number;
  conference: string;
  division: string;
  city: string;
  name: string;
  full_name: string;
  abbreviation: string;
}

export interface NBAApiGame {
  id: number;
  date: string;
  season: number;
  status: string;
  period: number;
  time: string;
  postseason: boolean;
  home_team: NBAApiTeam;
  home_team_score: number;
  visitor_team: NBAApiTeam;
  visitor_team_score: number;
}

export interface NBAApiStats {
  id: number;
  min: string;
  fgm: number;
  fga: number;
  fg_pct: number;
  fg3m: number;
  fg3a: number;
  fg3_pct: number;
  ftm: number;
  fta: number;
  ft_pct: number;
  oreb: number;
  dreb: number;
  reb: number;
  ast: number;
  stl: number;
  blk: number;
  turnover: number;
  pf: number;
  pts: number;
  player: NBAApiPlayer;
  team: NBAApiTeam;
  game: NBAApiGame;
}

// Interface pour le rapport hebdomadaire
export interface WeeklyReport {
  id: string;
  week_start: string;
  week_end: string;
  generated_at: string;
  total_matches: number;
  top_scorers: PlayerRanking[];
  top_rebounders: PlayerRanking[];
  top_assisters: PlayerRanking[];
  top_stealers: PlayerRanking[];
  top_blockers: PlayerRanking[];
  matches_summary: MatchWithTeams[];
}
