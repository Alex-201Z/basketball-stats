import { prisma } from '@/lib/prisma';
import type { PlayerRanking, RankingCategory, MatchWithTeams, Team } from '@/types';

export async function getDashboardStats() {
  const [
    totalPlayers,
    totalTeams,
    completedMatches,
    matchesInProgress
  ] = await Promise.all([
    prisma.player.count(),
    prisma.team.count(),
    prisma.match.count({ where: { status: 'completed' } }),
    prisma.match.count({ where: { status: 'in_progress' } }),
  ]);

  return {
    totalPlayers,
    totalTeams,
    totalMatches: completedMatches,
    matchesInProgress,
  };
}

export async function getRecentMatches(): Promise<MatchWithTeams[]> {
  const matches = await prisma.match.findMany({
    where: { league: 'local' },
    orderBy: { matchDate: 'desc' },
    take: 5,
    include: {
      homeTeam: true,
      awayTeam: true,
    },
  });

  return matches.map(m => ({
    id: m.id,
    home_team_id: m.homeTeamId,
    away_team_id: m.awayTeamId,
    match_date: m.matchDate.toISOString(),
    status: m.status,
    home_score: m.homeScore,
    away_score: m.awayScore,
    league: m.league,
    nba_game_id: m.nbaGameId || undefined,
    created_at: m.createdAt.toISOString(),
    home_team: {
        id: m.homeTeam.id,
        name: m.homeTeam.name,
        logo_url: m.homeTeam.logoUrl || undefined,
        league: m.homeTeam.league,
        created_at: m.homeTeam.createdAt.toISOString(),
    },
    away_team: {
        id: m.awayTeam.id,
        name: m.awayTeam.name,
        logo_url: m.awayTeam.logoUrl || undefined,
        league: m.awayTeam.league,
        created_at: m.awayTeam.createdAt.toISOString(),
    },
  }));
}

export async function getRankings(category: RankingCategory, limit = 10): Promise<PlayerRanking[]> {
    // Note: Complex aggregation logic should ideally be shared with the API route
    // For now, we are calling the DB directly to get top points as default

    // Using a simplified query for initial load (Points)
    // In a real refactor, we would move the SQL logic from /api/rankings/route.ts to a shared lib function

    // Using raw query for consistent ranking logic with API
    // This is a simplified version of what's in api/rankings/route.ts
    const result = await prisma.$queryRaw`
      SELECT
        p.id,
        p.first_name,
        p.last_name,
        p.jersey_number,
        p.position,
        t.name as team_name,
        t.logo_url as team_logo,
        p.league,
        CAST(COUNT(ps.id) AS SIGNED) as games_played,
        CAST(SUM(ps.points) AS SIGNED) as total_points,
        CAST(SUM(ps.rebounds) AS SIGNED) as total_rebounds,
        CAST(SUM(ps.assists) AS SIGNED) as total_assists,
        CAST(SUM(ps.steals) AS SIGNED) as total_steals,
        CAST(SUM(ps.blocks) AS SIGNED) as total_blocks,
        AVG(ps.points) as avg_points,
        AVG(ps.rebounds) as avg_rebounds,
        AVG(ps.assists) as avg_assists,
        AVG(ps.steals) as avg_steals,
        AVG(ps.blocks) as avg_blocks
      FROM players p
      JOIN teams t ON p.team_id = t.id
      LEFT JOIN player_stats ps ON p.id = ps.player_id
      WHERE p.league = 'local'
      GROUP BY p.id
      HAVING games_played > 0
      ORDER BY avg_points DESC
      LIMIT ${limit}
    `;

    return (result as any[]).map((row) => ({
      ...row,
      // Ensure numbers are numbers (BigInt handling)
      games_played: Number(row.games_played),
      total_points: Number(row.total_points),
      total_rebounds: Number(row.total_rebounds),
      total_assists: Number(row.total_assists),
      total_steals: Number(row.total_steals),
      total_blocks: Number(row.total_blocks),
      avg_points: Number(row.avg_points),
      avg_rebounds: Number(row.avg_rebounds),
      avg_assists: Number(row.avg_assists),
      avg_steals: Number(row.avg_steals),
      avg_blocks: Number(row.avg_blocks),
    }));
}
