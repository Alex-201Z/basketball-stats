import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/matches/[id]/stats - Stats du match
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id: matchId } = await params;

  try {
    const stats = await prisma.playerStats.findMany({
      where: { matchId },
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jerseyNumber: true,
            position: true,
            teamId: true,
          },
        },
      },
    });

    const data = stats.map(stat => ({
      id: stat.id,
      player_id: stat.playerId,
      match_id: stat.matchId,
      points: stat.points,
      rebounds: stat.rebounds,
      assists: stat.assists,
      steals: stat.steals,
      blocks: stat.blocks,
      turnovers: stat.turnovers,
      minutes_played: Number(stat.minutesPlayed),
      field_goals_made: stat.fieldGoalsMade,
      field_goals_attempted: stat.fieldGoalsAttempted,
      three_pointers_made: stat.threePointersMade,
      three_pointers_attempted: stat.threePointersAttempted,
      free_throws_made: stat.freeThrowsMade,
      free_throws_attempted: stat.freeThrowsAttempted,
      updated_at: stat.updatedAt.toISOString(),
      player: stat.player ? {
        id: stat.player.id,
        first_name: stat.player.firstName,
        last_name: stat.player.lastName,
        jersey_number: stat.player.jerseyNumber,
        position: stat.player.position,
        team_id: stat.player.teamId,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Erreur GET match stats:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des stats' },
      { status: 500 }
    );
  }
}

// POST /api/matches/[id]/stats - Ajouter/Mettre à jour les stats d'un joueur
export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id: matchId } = await params;

  try {
    const body = await request.json();
    const { player_id, ...statsData } = body;

    if (!player_id) {
      return NextResponse.json(
        { success: false, error: 'L\'ID du joueur est requis' },
        { status: 400 }
      );
    }

    // Vérifier que le match existe et n'est pas NBA
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      select: { league: true, status: true, homeTeamId: true, awayTeamId: true },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match non trouvé' },
        { status: 404 }
      );
    }

    if (match.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de modifier les stats d\'un match NBA' },
        { status: 403 }
      );
    }

    // Vérifier que le joueur existe et appartient à une des équipes du match
    const player = await prisma.player.findUnique({
      where: { id: player_id },
      select: { teamId: true },
    });

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Joueur non trouvé' },
        { status: 404 }
      );
    }

    if (player.teamId !== match.homeTeamId && player.teamId !== match.awayTeamId) {
      return NextResponse.json(
        { success: false, error: 'Ce joueur ne participe pas à ce match' },
        { status: 400 }
      );
    }

    // Préparer les données de stats
    const validStats = [
      'points', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers',
      'minutes_played', 'field_goals_made', 'field_goals_attempted',
      'three_pointers_made', 'three_pointers_attempted',
      'free_throws_made', 'free_throws_attempted'
    ];

    const statsToSave: Record<string, number> = {};
    for (const stat of validStats) {
      if (statsData[stat] !== undefined) {
        const value = parseInt(statsData[stat], 10);
        if (isNaN(value) || value < 0) {
          return NextResponse.json(
            { success: false, error: `Valeur invalide pour ${stat}` },
            { status: 400 }
          );
        }
        statsToSave[stat] = value;
      }
    }

    // Upsert les stats (créer ou mettre à jour)
    const statId = `local-stat-${matchId}-${player_id}`;

    // Mapper les noms de colonnes
    const prismaData: Record<string, number> = {};
    if (statsToSave.points !== undefined) prismaData.points = statsToSave.points;
    if (statsToSave.rebounds !== undefined) prismaData.rebounds = statsToSave.rebounds;
    if (statsToSave.assists !== undefined) prismaData.assists = statsToSave.assists;
    if (statsToSave.steals !== undefined) prismaData.steals = statsToSave.steals;
    if (statsToSave.blocks !== undefined) prismaData.blocks = statsToSave.blocks;
    if (statsToSave.turnovers !== undefined) prismaData.turnovers = statsToSave.turnovers;
    if (statsToSave.minutes_played !== undefined) prismaData.minutesPlayed = statsToSave.minutes_played;
    if (statsToSave.field_goals_made !== undefined) prismaData.fieldGoalsMade = statsToSave.field_goals_made;
    if (statsToSave.field_goals_attempted !== undefined) prismaData.fieldGoalsAttempted = statsToSave.field_goals_attempted;
    if (statsToSave.three_pointers_made !== undefined) prismaData.threePointersMade = statsToSave.three_pointers_made;
    if (statsToSave.three_pointers_attempted !== undefined) prismaData.threePointersAttempted = statsToSave.three_pointers_attempted;
    if (statsToSave.free_throws_made !== undefined) prismaData.freeThrowsMade = statsToSave.free_throws_made;
    if (statsToSave.free_throws_attempted !== undefined) prismaData.freeThrowsAttempted = statsToSave.free_throws_attempted;

    const stat = await prisma.playerStats.upsert({
      where: {
        playerId_matchId: {
          playerId: player_id,
          matchId,
        },
      },
      create: {
        id: statId,
        playerId: player_id,
        matchId,
        ...prismaData,
      },
      update: prismaData,
      include: {
        player: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            jerseyNumber: true,
            position: true,
            teamId: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: stat.id,
        player_id: stat.playerId,
        match_id: stat.matchId,
        points: stat.points,
        rebounds: stat.rebounds,
        assists: stat.assists,
        steals: stat.steals,
        blocks: stat.blocks,
        turnovers: stat.turnovers,
        minutes_played: Number(stat.minutesPlayed),
        updated_at: stat.updatedAt.toISOString(),
        player: stat.player ? {
          id: stat.player.id,
          first_name: stat.player.firstName,
          last_name: stat.player.lastName,
          jersey_number: stat.player.jerseyNumber,
          position: stat.player.position,
          team_id: stat.player.teamId,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erreur POST match stats:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la sauvegarde des stats' },
      { status: 500 }
    );
  }
}
