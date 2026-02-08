import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { RankingCategory, LeagueType, PlayerRanking } from '@/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = (searchParams.get('category') || 'points') as RankingCategory;
  const league = (searchParams.get('league') || 'all') as LeagueType;
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    // Requête d'agrégation pour calculer les moyennes des statistiques
    const whereClause = league !== 'all' ? { player: { league: league as 'nba' | 'local' } } : {};

    const statsAggregation = await prisma.playerStats.groupBy({
      by: ['playerId'],
      where: whereClause,
      _avg: {
        points: true,
        offensiveRebounds: true,
        defensiveRebounds: true,
        assists: true,
        steals: true,
        blocks: true,
        minutesPlayed: true,
      },
      _sum: {
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

    // Récupérer les infos des joueurs
    const playerIds = statsAggregation.map((s) => s.playerId);
    const players = await prisma.player.findMany({
      where: { id: { in: playerIds } },
      include: { team: true },
    });

    const playerMap = new Map(players.map((p) => [p.id, p]));

    // Construire les classements
    const rankings: PlayerRanking[] = statsAggregation.map((stat) => {
      const player = playerMap.get(stat.playerId);
      const totalRebounds = (stat._sum.offensiveRebounds || 0) + (stat._sum.defensiveRebounds || 0);
      const avgRebounds = (Number(stat._avg.offensiveRebounds || 0) + Number(stat._avg.defensiveRebounds || 0));

      return {
        id: stat.playerId,
        first_name: player?.firstName || '',
        last_name: player?.lastName || '',
        jersey_number: player?.jerseyNumber ?? undefined,
        position: player?.position as PlayerRanking['position'],
        team_name: player?.team?.name || '',
        team_logo: player?.team?.logoUrl ?? undefined,
        league: (player?.league || 'local') as 'nba' | 'local' | 'all',
        games_played: stat._count.matchId,
        total_points: stat._sum.points || 0,
        total_rebounds: totalRebounds,
        total_assists: stat._sum.assists || 0,
        total_steals: stat._sum.steals || 0,
        total_blocks: stat._sum.blocks || 0,
        avg_points: Number((stat._avg.points || 0).toFixed(1)),
        avg_rebounds: Number(avgRebounds.toFixed(1)),
        avg_assists: Number((stat._avg.assists || 0).toFixed(1)),
        avg_steals: Number((stat._avg.steals || 0).toFixed(1)),
        avg_blocks: Number((stat._avg.blocks || 0).toFixed(1)),
        global_score: 0,
      };
    });

    // Calculer le score global
    rankings.forEach((player) => {
      player.global_score = calculateGlobalScore(player);
    });

    // Trier selon la catégorie
    const sortKey = getSortKey(category) as keyof PlayerRanking;
    rankings.sort((a, b) => {
      const aVal = (a[sortKey] as number) || 0;
      const bVal = (b[sortKey] as number) || 0;
      return bVal - aVal;
    });

    // Limiter et ajouter le rang
    const rankedPlayers = rankings.slice(0, limit).map((player, index) => ({
      ...player,
      rank: index + 1,
    }));

    return NextResponse.json({
      success: true,
      data: rankedPlayers,
      meta: {
        category,
        league,
        limit,
        total: rankedPlayers.length,
      },
    });
  } catch (error) {
    console.error('Erreur API rankings:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la récupération des classements' },
      { status: 500 }
    );
  }
}

function getSortKey(category: RankingCategory): string {
  switch (category) {
    case 'points':
      return 'avg_points';
    case 'rebounds':
      return 'avg_rebounds';
    case 'assists':
      return 'avg_assists';
    case 'steals':
      return 'avg_steals';
    case 'blocks':
      return 'avg_blocks';
    case 'global':
    default:
      return 'global_score';
  }
}

function calculateGlobalScore(player: PlayerRanking): number {
  const points = player.avg_points || 0;
  const rebounds = player.avg_rebounds || 0;
  const assists = player.avg_assists || 0;
  const steals = player.avg_steals || 0;
  const blocks = player.avg_blocks || 0;

  return Number((
    (points / 30) * 20 +
    (rebounds / 15) * 20 +
    (assists / 10) * 20 +
    (steals / 3) * 20 +
    (blocks / 3) * 20
  ).toFixed(1));
}
