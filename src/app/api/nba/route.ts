import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { NBAApiGame, NBAApiStats } from '@/types';

const NBA_API_BASE = 'https://api.balldontlie.io/v1';

// Headers pour l'API
const getHeaders = () => ({
  'Authorization': process.env.NBA_API_KEY || '',
});

// Synchroniser les matchs NBA récents
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action') || 'games';

  try {
    switch (action) {
      case 'games':
        return await syncGames();
      case 'stats':
        const gameId = searchParams.get('game_id');
        if (!gameId) {
          return NextResponse.json({ error: 'game_id requis' }, { status: 400 });
        }
        return await syncGameStats(gameId);
      case 'teams':
        return await syncTeams();
      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }
  } catch (error) {
    console.error('Erreur sync NBA:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}

// POST pour déclencher une synchronisation complète
export async function POST() {
  try {
    // 1. Synchroniser les équipes
    await syncTeamsToDatabase();

    // 2. Synchroniser les matchs récents
    await syncGamesToDatabase();

    return NextResponse.json({
      success: true,
      message: 'Synchronisation NBA effectuée',
    });
  } catch (error) {
    console.error('Erreur sync NBA complète:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la synchronisation' },
      { status: 500 }
    );
  }
}

// Récupérer les matchs de l'API NBA
async function syncGames() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const response = await fetch(
    `${NBA_API_BASE}/games?start_date=${startDate}&end_date=${endDate}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error(`Erreur API NBA: ${response.status}`);
  }

  const data = await response.json();
  return NextResponse.json({
    success: true,
    data: data.data as NBAApiGame[],
    meta: data.meta,
  });
}

// Récupérer les stats d'un match spécifique
async function syncGameStats(gameId: string) {
  const response = await fetch(
    `${NBA_API_BASE}/stats?game_ids[]=${gameId}`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error(`Erreur API NBA: ${response.status}`);
  }

  const data = await response.json();
  return NextResponse.json({
    success: true,
    data: data.data as NBAApiStats[],
    meta: data.meta,
  });
}

// Récupérer les équipes NBA
async function syncTeams() {
  const response = await fetch(
    `${NBA_API_BASE}/teams`,
    { headers: getHeaders() }
  );

  if (!response.ok) {
    throw new Error(`Erreur API NBA: ${response.status}`);
  }

  const data = await response.json();
  return NextResponse.json({
    success: true,
    data: data.data,
  });
}

// Synchroniser les équipes vers la base de données
async function syncTeamsToDatabase() {
  const response = await fetch(`${NBA_API_BASE}/teams`, { headers: getHeaders() });
  if (!response.ok) return;

  const { data: teams } = await response.json();

  for (const team of teams) {
    await prisma.team.upsert({
      where: { id: `nba-${team.id}` },
      update: {
        name: team.full_name,
        league: 'nba',
        nbaTeamId: team.id,
      },
      create: {
        id: `nba-${team.id}`,
        name: team.full_name,
        logoUrl: null,
        league: 'nba',
        nbaTeamId: team.id,
      },
    });
  }
}

// Synchroniser les matchs vers la base de données
async function syncGamesToDatabase() {
  const today = new Date();
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  const startDate = weekAgo.toISOString().split('T')[0];
  const endDate = today.toISOString().split('T')[0];

  const response = await fetch(
    `${NBA_API_BASE}/games?start_date=${startDate}&end_date=${endDate}`,
    { headers: getHeaders() }
  );

  if (!response.ok) return;

  const { data: games } = await response.json();

  for (const game of games as NBAApiGame[]) {
    // Déterminer le statut
    let status: 'scheduled' | 'in_progress' | 'completed' = 'scheduled';
    if (game.status === 'Final') {
      status = 'completed';
    } else if (game.period > 0) {
      status = 'in_progress';
    }

    await prisma.match.upsert({
      where: { id: `nba-game-${game.id}` },
      update: {
        status,
        homeScore: game.home_team_score,
        awayScore: game.visitor_team_score,
      },
      create: {
        id: `nba-game-${game.id}`,
        homeTeamId: `nba-${game.home_team.id}`,
        awayTeamId: `nba-${game.visitor_team.id}`,
        matchDate: new Date(game.date),
        status,
        homeScore: game.home_team_score,
        awayScore: game.visitor_team_score,
        league: 'nba',
        nbaGameId: game.id,
      },
    });

    // Synchroniser les stats du match si terminé
    if (status === 'completed') {
      await syncStatsToDatabase(game.id);
    }
  }
}

// Synchroniser les statistiques d'un match
async function syncStatsToDatabase(gameId: number) {
  const response = await fetch(
    `${NBA_API_BASE}/stats?game_ids[]=${gameId}`,
    { headers: getHeaders() }
  );

  if (!response.ok) return;

  const { data: stats } = await response.json();

  for (const stat of stats as NBAApiStats[]) {
    // Mapper la position NBA vers notre enum
    const positionMap: Record<string, 'PG' | 'SG' | 'SF' | 'PF' | 'C' | null> = {
      'G': 'PG',
      'F': 'SF',
      'C': 'C',
      'G-F': 'SG',
      'F-G': 'SF',
      'F-C': 'PF',
      'C-F': 'C',
    };
    const position = positionMap[stat.player.position] || null;

    // D'abord s'assurer que le joueur existe
    await prisma.player.upsert({
      where: { id: `nba-player-${stat.player.id}` },
      update: {
        firstName: stat.player.first_name,
        lastName: stat.player.last_name,
        jerseyNumber: parseInt(stat.player.jersey_number) || null,
        position,
        teamId: `nba-${stat.team.id}`,
      },
      create: {
        id: `nba-player-${stat.player.id}`,
        firstName: stat.player.first_name,
        lastName: stat.player.last_name,
        jerseyNumber: parseInt(stat.player.jersey_number) || null,
        position,
        teamId: `nba-${stat.team.id}`,
        league: 'nba',
        nbaPlayerId: stat.player.id,
      },
    });

    // Puis insérer les stats
    const minutes = parseMinutes(stat.min);

    await prisma.playerStats.upsert({
      where: {
        playerId_matchId: {
          playerId: `nba-player-${stat.player.id}`,
          matchId: `nba-game-${gameId}`,
        },
      },
      update: {
        points: stat.pts || 0,
        offensiveRebounds: stat.oreb || 0,
        defensiveRebounds: stat.dreb || 0,
        assists: stat.ast || 0,
        steals: stat.stl || 0,
        blocks: stat.blk || 0,
        turnovers: stat.turnover || 0,
        minutesPlayed: minutes,
        fieldGoalsMade: stat.fgm || 0,
        fieldGoalsAttempted: stat.fga || 0,
        threePointersMade: stat.fg3m || 0,
        threePointersAttempted: stat.fg3a || 0,
        freeThrowsMade: stat.ftm || 0,
        freeThrowsAttempted: stat.fta || 0,
      },
      create: {
        id: `nba-stat-${gameId}-${stat.player.id}`,
        playerId: `nba-player-${stat.player.id}`,
        matchId: `nba-game-${gameId}`,
        points: stat.pts || 0,
        offensiveRebounds: stat.oreb || 0,
        defensiveRebounds: stat.dreb || 0,
        assists: stat.ast || 0,
        steals: stat.stl || 0,
        blocks: stat.blk || 0,
        turnovers: stat.turnover || 0,
        minutesPlayed: minutes,
        fieldGoalsMade: stat.fgm || 0,
        fieldGoalsAttempted: stat.fga || 0,
        threePointersMade: stat.fg3m || 0,
        threePointersAttempted: stat.fg3a || 0,
        freeThrowsMade: stat.ftm || 0,
        freeThrowsAttempted: stat.fta || 0,
      },
    });
  }
}

// Convertir le format "MM:SS" en minutes
function parseMinutes(minStr: string): number {
  if (!minStr) return 0;
  const parts = minStr.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) + parseInt(parts[1]) / 60;
  }
  return parseInt(minStr) || 0;
}
