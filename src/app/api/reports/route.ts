import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get('format') || 'json';
  const league = searchParams.get('league') as 'nba' | 'local' | null;

  try {
    // Calculer les dates de la semaine
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Dimanche précédent
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // Samedi
    weekEnd.setHours(23, 59, 59, 999);

    // Récupérer les classements par catégorie
    const categories = ['points', 'rebounds', 'assists', 'steals', 'blocks'] as const;
    const rankings: Record<string, unknown[]> = {};

    for (const category of categories) {
      const statsAggregation = await prisma.playerStats.groupBy({
        by: ['playerId'],
        where: league ? { player: { league } } : {},
        _avg: {
          points: true,
          offensiveRebounds: true,
          defensiveRebounds: true,
          assists: true,
          steals: true,
          blocks: true,
        },
        _count: {
          matchId: true,
        },
      });

      // Récupérer les joueurs
      const playerIds = statsAggregation.map((s) => s.playerId);
      const players = await prisma.player.findMany({
        where: { id: { in: playerIds } },
        include: { team: true },
      });

      const playerMap = new Map(players.map((p) => [p.id, p]));

      // Construire les données et trier
      const categoryData = statsAggregation
        .map((stat) => {
          const player = playerMap.get(stat.playerId);
          const avgRebounds = (Number(stat._avg.offensiveRebounds || 0) + Number(stat._avg.defensiveRebounds || 0));
          return {
            player_id: stat.playerId,
            first_name: player?.firstName || '',
            last_name: player?.lastName || '',
            team_name: player?.team?.name || null,
            games_played: stat._count.matchId,
            avg_points: Number((stat._avg.points || 0).toFixed(1)),
            avg_rebounds: Number(avgRebounds.toFixed(1)),
            avg_assists: Number((stat._avg.assists || 0).toFixed(1)),
            avg_steals: Number((stat._avg.steals || 0).toFixed(1)),
            avg_blocks: Number((stat._avg.blocks || 0).toFixed(1)),
          };
        })
        .sort((a, b) => {
          const key = `avg_${category}` as keyof typeof a;
          return (b[key] as number) - (a[key] as number);
        })
        .slice(0, 5);

      rankings[category] = categoryData;
    }

    // Récupérer les matchs de la semaine
    const matches = await prisma.match.findMany({
      where: {
        matchDate: {
          gte: weekStart,
          lte: weekEnd,
        },
        ...(league ? { league } : {}),
      },
      include: {
        homeTeam: { select: { name: true } },
        awayTeam: { select: { name: true } },
      },
      orderBy: { matchDate: 'desc' },
    });

    // Formater les matchs pour la réponse
    const formattedMatches = matches.map((match) => ({
      id: match.id,
      match_date: match.matchDate.toISOString(),
      status: match.status,
      home_score: match.homeScore,
      away_score: match.awayScore,
      league: match.league,
      home_team: { name: match.homeTeam.name },
      away_team: { name: match.awayTeam.name },
    }));

    const report = {
      generated_at: new Date().toISOString(),
      week_start: weekStart.toISOString(),
      week_end: weekEnd.toISOString(),
      total_matches: matches.length,
      rankings: {
        top_scorers: rankings.points,
        top_rebounders: rankings.rebounds,
        top_assisters: rankings.assists,
        top_stealers: rankings.steals,
        top_blockers: rankings.blocks,
      },
      matches: formattedMatches,
    };

    if (format === 'pdf') {
      // Retourner les données pour génération PDF côté client
      return NextResponse.json({
        success: true,
        data: report,
        format: 'pdf-data',
      });
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la génération du rapport' },
      { status: 500 }
    );
  }
}
