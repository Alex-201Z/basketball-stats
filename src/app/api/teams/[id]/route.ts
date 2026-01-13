import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/teams/[id] - Détails d'une équipe
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const team = await prisma.team.findUnique({
      where: { id },
    });

    if (!team) {
      return NextResponse.json(
        { success: false, error: 'Équipe non trouvée' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: team.id,
        name: team.name,
        logo_url: team.logoUrl,
        league: team.league,
        created_at: team.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erreur GET team:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération de l\'équipe' },
      { status: 500 }
    );
  }
}

// PUT /api/teams/[id] - Modifier une équipe
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const existing = await prisma.team.findUnique({
      where: { id },
      select: { league: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Équipe non trouvée' },
        { status: 404 }
      );
    }

    if (existing.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de modifier une équipe NBA' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const updates: { name?: string; logoUrl?: string | null } = {};

    if (body.name !== undefined) {
      if (typeof body.name !== 'string' || body.name.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Le nom de l\'équipe est invalide' },
          { status: 400 }
        );
      }
      updates.name = body.name.trim();
    }

    if (body.logo_url !== undefined) {
      updates.logoUrl = body.logo_url || null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { success: false, error: 'Aucune modification fournie' },
        { status: 400 }
      );
    }

    const team = await prisma.team.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: team.id,
        name: team.name,
        logo_url: team.logoUrl,
        league: team.league,
        created_at: team.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Erreur PUT team:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification de l\'équipe' },
      { status: 500 }
    );
  }
}

// DELETE /api/teams/[id] - Supprimer une équipe
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const existing = await prisma.team.findUnique({
      where: { id },
      select: { league: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Équipe non trouvée' },
        { status: 404 }
      );
    }

    if (existing.league === 'nba') {
      return NextResponse.json(
        { success: false, error: 'Impossible de supprimer une équipe NBA' },
        { status: 403 }
      );
    }

    await prisma.team.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Équipe supprimée avec succès',
    });
  } catch (error) {
    console.error('Erreur DELETE team:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression de l\'équipe' },
      { status: 500 }
    );
  }
}
