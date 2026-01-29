import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { League } from '../../../../generated/prisma';

// GET /api/teams - Liste des équipes
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leagueParam = searchParams.get('league');
  const league = (leagueParam && leagueParam !== 'all' ? leagueParam : null) as League | null;

  try {
    const teams = await prisma.team.findMany({
      where: league ? { league } : undefined,
      orderBy: { name: 'asc' },
    });

    // Transformer pour compatibilité avec le frontend
    const data = teams.map(team => ({
      id: team.id,
      name: team.name,
      logo_url: team.logoUrl,
      league: team.league,
      nba_team_id: team.nbaTeamId,
      created_at: team.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Erreur GET teams:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des équipes' },
      { status: 500 }
    );
  }
}

// POST /api/teams - Créer une équipe
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logo_url } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Le nom de l\'équipe est requis' },
        { status: 400 }
      );
    }

    // Générer un ID unique pour l'équipe locale
    const id = `local-team-${Date.now()}`;

    const team = await prisma.team.create({
      data: {
        id,
        name: name.trim(),
        logoUrl: logo_url || null,
        league: 'local',
      },
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
    console.error('Erreur POST teams:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création de l\'équipe' },
      { status: 500 }
    );
  }
}
