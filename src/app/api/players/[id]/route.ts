import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import prisma from '@/lib/prisma';
import type { Position } from '@/generated/prisma';

const VALID_POSITIONS: Position[] = ['PG', 'SG', 'SF', 'PF', 'C'];

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/players/[id] - Détails d'un joueur
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        team: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
    });

    if (!player) {
      return NextResponse.json(
        { success: false, error: 'Joueur non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: player.id,
        first_name: player.firstName,
        last_name: player.lastName,
        jersey_number: player.jerseyNumber,
        position: player.position,
        team_id: player.teamId,
        photo_url: player.photoUrl,
        league: player.league,
        age: player.age,
        created_at: player.createdAt.toISOString(),
        team: player.team ? {
          id: player.team.id,
          name: player.team.name,
          logo_url: player.team.logoUrl,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erreur GET player:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération du joueur' },
      { status: 500 }
    );
  }
}

// PUT /api/players/[id] - Modifier un joueur
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const existing = await prisma.player.findUnique({
      where: { id },
      select: { league: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Joueur non trouvé' },
        { status: 404 }
      );
    }

    if (existing.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de modifier un joueur NBA' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates: {
      firstName?: string;
      lastName?: string;
      jerseyNumber?: number | null;
      position?: Position | null;
      teamId?: string;
      photoUrl?: string | null;
      age?: number | null;
    } = {};

    if (body.first_name !== undefined) {
      if (typeof body.first_name !== 'string' || body.first_name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Prénom invalide' },
          { status: 400 }
        );
      }
      updates.firstName = body.first_name.trim();
    }

    if (body.last_name !== undefined) {
      if (typeof body.last_name !== 'string' || body.last_name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Nom invalide' },
          { status: 400 }
        );
      }
      updates.lastName = body.last_name.trim();
    }

    if (body.jersey_number !== undefined) {
      if (body.jersey_number === null) {
        updates.jerseyNumber = null;
      } else {
        const num = parseInt(body.jersey_number, 10);
        if (isNaN(num) || num < 0 || num > 99) {
          return NextResponse.json(
            { success: false, error: 'Numéro de maillot invalide (0-99)' },
            { status: 400 }
          );
        }
        updates.jerseyNumber = num;
      }
    }

    if (body.age !== undefined) {
      if (body.age === null || body.age === '') {
        updates.age = null;
      } else {
        const num = parseInt(body.age, 10);
        if (isNaN(num) || num < 0 || num > 120) {
          return NextResponse.json({ success: false, error: "Âge invalide" }, { status: 400 });
        }
        updates.age = num;
      }
    }

    if (body.position !== undefined) {
      if (body.position === null) {
        updates.position = null;
      } else if (!VALID_POSITIONS.includes(body.position)) {
        return NextResponse.json(
          { success: false, error: `Position invalide. Valeurs: ${VALID_POSITIONS.join(', ')}` },
          { status: 400 }
        );
      } else {
        updates.position = body.position;
      }
    }

    if (body.team_id !== undefined) {
      const team = await prisma.team.findUnique({
        where: { id: body.team_id },
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
          { success: false, error: 'Impossible de transférer vers une équipe NBA' },
          { status: 403 }
        );
      }

      updates.teamId = body.team_id;
    }

    if (body.photo_url !== undefined) {
      updates.photoUrl = body.photo_url || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune modification fournie' },
        { status: 400 }
      );
    }

    const player = await prisma.player.update({
      where: { id },
      data: updates,
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
        photo_url: player.photoUrl,
        league: player.league,
        age: player.age,
        created_at: player.createdAt.toISOString(),
        team: player.team ? {
          id: player.team.id,
          name: player.team.name,
          logo_url: player.team.logoUrl,
        } : null,
      },
    });
  } catch (error) {
    console.error('Erreur PUT player:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du joueur' },
      { status: 500 }
    );
  }
}

// DELETE /api/players/[id] - Supprimer un joueur
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const existing = await prisma.player.findUnique({
      where: { id },
      select: { league: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Joueur non trouvé' },
        { status: 404 }
      );
    }

    if (existing.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer un joueur NBA' },
        { status: 403 }
      );
    }

    await prisma.player.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Joueur supprimé avec succès',
    });
  } catch (error) {
    console.error('Erreur DELETE player:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du joueur' },
      { status: 500 }
    );
  }
}
