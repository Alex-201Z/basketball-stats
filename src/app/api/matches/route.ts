import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { League, MatchStatus } from '@/generated/prisma';

// GET /api/matches - Liste des matchs
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const leagueParam = searchParams.get('league');
  const league = (leagueParam && leagueParam !== 'all' ? leagueParam : null) as League | null;
  const status = searchParams.get('status') as MatchStatus | null;
  const teamId = searchParams.get('team_id');
  const dateFrom = searchParams.get('date_from');
  const dateTo = searchParams.get('date_to');
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  try {
    const matches = await prisma.match.findMany({
      where: {
        ...(league ? { league } : {}),
        ...(status ? { status } : {}),
        ...(teamId ? {
          OR: [
            { homeTeamId: teamId },
            { awayTeamId: teamId },
          ],
        } : {}),
        ...(dateFrom ? { matchDate: { gte: new Date(dateFrom) } } : {}),
        ...(dateTo ? { matchDate: { lte: new Date(dateTo) } } : {}),
      },
      include: {
        homeTeam: {
          select: { id: true, name: true, logoUrl: true },
        },
        awayTeam: {
          select: { id: true, name: true, logoUrl: true },
        },
      },
      orderBy: { matchDate: 'desc' },
      take: limit,
    });

    const data = matches.map(match => ({
      id: match.id,
      home_team_id: match.homeTeamId,
      away_team_id: match.awayTeamId,
      match_date: match.matchDate.toISOString(),
      status: match.status,
      home_score: match.homeScore,
      away_score: match.awayScore,
      league: match.league,
      nba_game_id: match.nbaGameId,
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
    }));

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Erreur GET matches:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des matchs' },
      { status: 500 }
    );
  }
}

// POST /api/matches - Créer un match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { home_team_id, away_team_id, match_date } = body;

    // Validations
    if (!home_team_id) {
      return NextResponse.json(
        { success: false, error: 'L\'équipe à domicile est requise' },
        { status: 400 }
      );
    }

    if (!away_team_id) {
      return NextResponse.json(
        { success: false, error: 'L\'équipe extérieure est requise' },
        { status: 400 }
      );
    }

    if (home_team_id === away_team_id) {
      return NextResponse.json(
        { success: false, error: 'Une équipe ne peut pas jouer contre elle-même' },
        { status: 400 }
      );
    }

    if (!match_date) {
      return NextResponse.json(
        { success: false, error: 'La date du match est requise' },
        { status: 400 }
      );
    }

    // Vérifier que les équipes existent
    const teams = await prisma.team.findMany({
      where: {
        id: { in: [home_team_id, away_team_id] },
      },
      select: { id: true, league: true },
    });

    if (teams.length !== 2) {
      return NextResponse.json(
        { success: false, error: 'Une ou plusieurs équipes non trouvées' },
        { status: 404 }
      );
    }

    // Déterminer la ligue (local si au moins une équipe est locale)
    const league = teams.some(t => t.league === 'local') ? 'local' : 'nba';

    // Générer un ID unique
    const id = `local-match-${Date.now()}`;

    const match = await prisma.match.create({
      data: {
        id,
        homeTeamId: home_team_id,
        awayTeamId: away_team_id,
        matchDate: new Date(match_date),
        status: 'scheduled',
        homeScore: 0,
        awayScore: 0,
        league,
      },
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
        sheet_url: match.sheetUrl,
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
    console.error('Erreur POST matches:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du match' },
      { status: 500 }
    );
  }
}
