import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { MatchStatus } from '../../../../../generated/prisma';

const VALID_STATUSES: MatchStatus[] = ['scheduled', 'in_progress', 'completed'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/matches/[id] - Détails d'un match
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        homeTeam: {
          select: { id: true, name: true, logoUrl: true },
        },
        awayTeam: {
          select: { id: true, name: true, logoUrl: true },
        },
        playerStats: {
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
        },
      },
    });

    if (!match) {
      return NextResponse.json(
        { success: false, error: 'Match non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: match.id,
        home_team_id: match.homeTeamId,
        away_team_id: match.awayTeamId,
        match_date: match.matchDate.toISOString(),
        status: match.status,
        home_score: match.homeScore,
        away_score: match.awayScore,
        league: match.league,
        created_at: match.createdAt.toISOString(),
        home_team: match.homeTeam ? {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          logo_url: match.homeTeam.logoUrl,
        } : null,
        away_team: match.awayTeam ? {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          logo_url: match.awayTeam.logoUrl,
        } : null,
        player_stats: match.playerStats.map(stat => ({
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
        })),
      },
    });
  } catch (error) {
    console.error('Erreur GET match:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du match' },
      { status: 500 }
    );
  }
}

// PUT /api/matches/[id] - Modifier un match
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const existing = await prisma.match.findUnique({
      where: { id },
      select: { league: true, status: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Match non trouvé' },
        { status: 404 }
      );
    }

    if (existing.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de modifier un match NBA' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates: {
      status?: MatchStatus;
      homeScore?: number;
      awayScore?: number;
      matchDate?: Date;
    } = {};

    // Mise à jour du statut
    if (body.status !== undefined) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: `Statut invalide. Valeurs: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }

      const currentStatus = existing.status;
      const newStatus = body.status;

      if (currentStatus === 'completed' && newStatus !== 'completed') {
        return NextResponse.json(
          { success: false, error: 'Un match terminé ne peut pas être réouvert' },
          { status: 400 }
        );
      }

      updates.status = newStatus;
    }

    // Mise à jour du score
    if (body.home_score !== undefined) {
      const score = parseInt(body.home_score, 10);
      if (isNaN(score) || score < 0) {
        return NextResponse.json(
          { success: false, error: 'Score domicile invalide' },
          { status: 400 }
        );
      }
      updates.homeScore = score;
    }

    if (body.away_score !== undefined) {
      const score = parseInt(body.away_score, 10);
      if (isNaN(score) || score < 0) {
        return NextResponse.json(
          { success: false, error: 'Score extérieur invalide' },
          { status: 400 }
        );
      }
      updates.awayScore = score;
    }

    // Mise à jour de la date
    if (body.match_date !== undefined) {
      if (existing.status !== 'scheduled') {
        return NextResponse.json(
          { success: false, error: 'Impossible de modifier la date d\'un match commencé' },
          { status: 400 }
        );
      }
      updates.matchDate = new Date(body.match_date);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune modification fournie' },
        { status: 400 }
      );
    }

    const match = await prisma.match.update({
      where: { id },
      data: updates,
      include: {
        homeTeam: {
          select: { id: true, name: true, logoUrl: true },
        },
        awayTeam: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: match.id,
        home_team_id: match.homeTeamId,
        away_team_id: match.awayTeamId,
        match_date: match.matchDate.toISOString(),
        status: match.status,
        home_score: match.homeScore,
        away_score: match.awayScore,
        league: match.league,
        created_at: match.createdAt.toISOString(),
        home_team: match.homeTeam ? {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          logo_url: match.homeTeam.logoUrl,
        } : null,
        away_team: match.awayTeam ? {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          logo_url: match.awayTeam.logoUrl,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erreur PUT match:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du match' },
      { status: 500 }
    );
  }
}

// DELETE /api/matches/[id] - Supprimer un match
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const existing = await prisma.match.findUnique({
      where: { id },
      select: { league: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Match non trouvé' },
        { status: 404 }
      );
    }

    if (existing.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer un match NBA' },
        { status: 403 }
      );
    }

    // Supprimer le match (les stats seront supprimées en cascade)
    await prisma.match.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Match supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur DELETE match:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du match' },
      { status: 500 }
    );
  }
}
