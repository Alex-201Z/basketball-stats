'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { PlayerRanking, RankingCategory, LeagueType } from '@/types';

interface UseRankingsOptions {
  category: RankingCategory;
  league: LeagueType;
  limit?: number;
}

export function useRankings({ category, league, limit = 10 }: UseRankingsOptions) {
  const [rankings, setRankings] = useState<PlayerRanking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRankings = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Requête vers la vue player_rankings
      let query = supabase
        .from('player_rankings')
        .select('*');

      // Filtrer par ligue si nécessaire
      if (league !== 'all') {
        query = query.eq('league', league);
      }

      // Trier selon la catégorie
      const orderColumn = getOrderColumn(category);
      query = query.order(orderColumn, { ascending: false }).limit(limit);

      const { data, error: queryError } = await query;

      if (queryError) {
        throw queryError;
      }

      // Calculer le score global si nécessaire
      const rankingsWithGlobal = (data || []).map((player) => ({
        ...player,
        global_score: calculateGlobalScore(player),
      }));

      // Re-trier par score global si c'est la catégorie sélectionnée
      if (category === 'global') {
        rankingsWithGlobal.sort((a, b) => (b.global_score || 0) - (a.global_score || 0));
      }

      setRankings(rankingsWithGlobal);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [category, league, limit]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  return { rankings, loading, error, refetch: fetchRankings };
}

// Détermine la colonne de tri selon la catégorie
function getOrderColumn(category: RankingCategory): string {
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
      return 'avg_points'; // Sera recalculé côté client
  }
}

// Calcule un score global normalisé (toutes stats égales)
function calculateGlobalScore(player: PlayerRanking): number {
  // Normalisation simple : somme des moyennes
  // Dans une version plus avancée, on pourrait normaliser par rapport aux max de la ligue
  const points = player.avg_points || 0;
  const rebounds = player.avg_rebounds || 0;
  const assists = player.avg_assists || 0;
  const steals = player.avg_steals || 0;
  const blocks = player.avg_blocks || 0;

  // Pondération égale mais ajustée pour l'échelle des différentes stats
  // Points ~20, Rebounds ~10, Assists ~5, Steals ~2, Blocks ~1
  return (
    (points / 30) * 20 +     // Normaliser sur base 30 points
    (rebounds / 15) * 20 +   // Normaliser sur base 15 rebonds
    (assists / 10) * 20 +    // Normaliser sur base 10 passes
    (steals / 3) * 20 +      // Normaliser sur base 3 interceptions
    (blocks / 3) * 20        // Normaliser sur base 3 contres
  );
}
