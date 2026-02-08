import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import type { League, Position } from '@/generated/prisma';

const VALID_POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

// GET /api/players - Liste des joueurs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leagueParam = searchParams.get('league');
  const league = (leagueParam && leagueParam !== 'all' ? leagueParam : null) as League | null;
  const teamId = searchParams.get('team_id');

  try {
    const players = await prisma.player.findMany({
      where: {
        ...(league ? { league } : {}),
        ...(teamId ? { teamId } : {}),
      },
      include: {
        team: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
      orderBy: { lastName: 'asc' },
    });

    const data = players.map(player => ({
      id: player.id,
      first_name: player.firstName,
      last_name: player.lastName,
      jersey_number: player.jerseyNumber,
      position: player.position,
      team_id: player.teamId,
      photo_url: player.photoUrl,
      league: player.league,
      age: player.age,
      nba_player_id: player.nbaPlayerId,
      created_at: player.createdAt.toISOString(),
      team: player.team ? {
        id: player.team.id,
        name: player.team.name,
        logo_url: player.team.logoUrl,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Erreur GET players:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des joueurs' },
      { status: 500 }
    );
  }
}

// POST /api/players - Créer un joueur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { first_name, last_name, jersey_number, position, team_id, photo_url, age } = body;

    // Validations
    if (!first_name || typeof first_name !== 'string' || first_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Le prénom est requis' },
        { status: 400 }
      );
    }

    if (!last_name || typeof last_name !== 'string' || last_name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Le nom est requis' },
        { status: 400 }
      );
    }

    // Validation Équipe (Si fournie)
    if (team_id) {
      // Vérifier que l'équipe existe et est locale
      const team = await prisma.team.findUnique({
        where: { id: team_id },
        select: { league: true },
      });

      if (!team) {
        return NextResponse.json(
          { success: false, error: 'Équipe non trouvée' },
          { status: 404 }
        );
      }

      if (team.league === 'nba') {
        return NextResponse.json(
          { success: false, error: 'Impossible d\'ajouter un joueur à une équipe NBA' },
          { status: 403 }
        );
      }
    }

    // Valider la position si fournie
    if (position && !VALID_POSITIONS.includes(position)) {
      return NextResponse.json(
        { success: false, error: `Position invalide. Valeurs acceptées: ${VALID_POSITIONS.join(', ')}` },
        { status: 400 }
      );
    }

    // Valider le numéro de maillot
    if (jersey_number !== undefined && jersey_number !== null && jersey_number !== '') {
      const num = parseInt(jersey_number, 10);
      if (isNaN(num) || num < 0 || num > 99) {
        return NextResponse.json(
          { success: false, error: 'Le numéro de maillot doit être entre 0 et 99' },
          { status: 400 }
        );
      }
    }

    // Générer un ID unique
    const id = `local-player-${Date.now()}`;

    const player = await prisma.player.create({
      data: {
        id,
        firstName: first_name.trim(),
        lastName: last_name.trim(),
        jerseyNumber: (jersey_number !== undefined && jersey_number !== '') ? parseInt(jersey_number, 10) : null,
        position: position || null,
        teamId: team_id || null,
        photoUrl: photo_url || null,
        league: 'local',
        age: age ? parseInt(age, 10) : null,
      },
      include: {
        team: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: player.id,
        first_name: player.firstName,
        last_name: player.lastName,
        jersey_number: player.jerseyNumber,
        position: player.position,
        team_id: player.teamId,
        age: player.age,
        photo_url: player.photoUrl,
        league: player.league,
        created_at: player.createdAt.toISOString(),
        team: player.team ? {
          id: player.team.id,
          name: player.team.name,
          logo_url: player.team.logoUrl,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erreur POST players:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du joueur' },
      { status: 500 }
    );
  }
}
