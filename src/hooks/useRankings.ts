'use client';

import { useState, useEffect, useCallback } from 'react';
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
      const params = new URLSearchParams({
        category,
        league,
        limit: limit.toString(),
      });

      const response = await fetch(`/api/rankings?${params}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Erreur lors du chargement');
      }

      setRankings(result.data || []);
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
