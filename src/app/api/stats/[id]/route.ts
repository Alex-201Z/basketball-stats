import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/stats/[id] - Détails d'une stat
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const stat = await prisma.playerStats.findUnique({
      where: { id },
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
        match: {
          select: {
            id: true,
            homeTeamId: true,
            awayTeamId: true,
            matchDate: true,
            status: true,
            league: true,
          },
        },
      },
    });

    if (!stat) {
      return NextResponse.json(
        { success: false, error: 'Statistique non trouvée' },
        { status: 404 }
      );
    }

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
        match: stat.match ? {
          id: stat.match.id,
          home_team_id: stat.match.homeTeamId,
          away_team_id: stat.match.awayTeamId,
          match_date: stat.match.matchDate.toISOString(),
          status: stat.match.status,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erreur GET stat:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de la statistique' },
      { status: 500 }
    );
  }
}

// PUT /api/stats/[id] - Modifier une stat (incrémentation ou mise à jour complète)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const existing = await prisma.playerStats.findUnique({
      where: { id },
      include: {
        match: {
          select: { league: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Statistique non trouvée' },
        { status: 404 }
      );
    }

    if (existing.match?.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de modifier les stats d\'un match NBA' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Mode incrémentation rapide
    if (body.action === 'increment' && body.stat && body.value !== undefined) {
      const validIncrementStats = ['points', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers'];
      
      if (!validIncrementStats.includes(body.stat)) {
        return NextResponse.json(
          { success: false, error: `Stat invalide pour incrémentation: ${body.stat}` },
          { status: 400 }
        );
      }

      const increment = parseInt(body.value, 10);
      if (isNaN(increment)) {
        return NextResponse.json(
          { success: false, error: 'Valeur d\'incrémentation invalide' },
          { status: 400 }
        );
      }

      const currentValue = (existing[body.stat as keyof typeof existing] as number) || 0;
      const newValue = Math.max(0, currentValue + increment);

      const stat = await prisma.playerStats.update({
        where: { id },
        data: { [body.stat]: newValue },
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
    }

    // Mode mise à jour complète
    const validStats = [
      'points', 'rebounds', 'assists', 'steals', 'blocks', 'turnovers',
      'minutes_played', 'field_goals_made', 'field_goals_attempted',
      'three_pointers_made', 'three_pointers_attempted',
      'free_throws_made', 'free_throws_attempted'
    ];

    const updates: Record<string, number> = {};
    for (const stat of validStats) {
      if (body[stat] !== undefined) {
        const value = parseInt(body[stat], 10);
        if (isNaN(value) || value < 0) {
          return NextResponse.json(
            { success: false, error: `Valeur invalide pour ${stat}` },
            { status: 400 }
          );
        }
        updates[stat] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune modification fournie' },
        { status: 400 }
      );
    }

    // Mapper les noms de colonnes
    const prismaUpdates: Record<string, number> = {};
    if (updates.points !== undefined) prismaUpdates.points = updates.points;
    if (updates.rebounds !== undefined) prismaUpdates.rebounds = updates.rebounds;
    if (updates.assists !== undefined) prismaUpdates.assists = updates.assists;
    if (updates.steals !== undefined) prismaUpdates.steals = updates.steals;
    if (updates.blocks !== undefined) prismaUpdates.blocks = updates.blocks;
    if (updates.turnovers !== undefined) prismaUpdates.turnovers = updates.turnovers;
    if (updates.minutes_played !== undefined) prismaUpdates.minutesPlayed = updates.minutes_played;
    if (updates.field_goals_made !== undefined) prismaUpdates.fieldGoalsMade = updates.field_goals_made;
    if (updates.field_goals_attempted !== undefined) prismaUpdates.fieldGoalsAttempted = updates.field_goals_attempted;
    if (updates.three_pointers_made !== undefined) prismaUpdates.threePointersMade = updates.three_pointers_made;
    if (updates.three_pointers_attempted !== undefined) prismaUpdates.threePointersAttempted = updates.three_pointers_attempted;
    if (updates.free_throws_made !== undefined) prismaUpdates.freeThrowsMade = updates.free_throws_made;
    if (updates.free_throws_attempted !== undefined) prismaUpdates.freeThrowsAttempted = updates.free_throws_attempted;

    const stat = await prisma.playerStats.update({
      where: { id },
      data: prismaUpdates,
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
    console.error('Erreur PUT stat:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification de la statistique' },
      { status: 500 }
    );
  }
}

// DELETE /api/stats/[id] - Supprimer une stat
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const existing = await prisma.playerStats.findUnique({
      where: { id },
      include: {
        match: {
          select: { league: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Statistique non trouvée' },
        { status: 404 }
      );
    }

    if (existing.match?.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer les stats d\'un match NBA' },
        { status: 403 }
      );
    }

    await prisma.playerStats.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Statistique supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur DELETE stat:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de la statistique' },
      { status: 500 }
    );
  }
}
