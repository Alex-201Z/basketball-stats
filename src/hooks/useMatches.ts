'use client';

import { useState, useEffect, useCallback } from 'react';
import type { MatchWithTeams, LeagueType, MatchStatus, PlayerStats } from '@/types';

interface UseMatchesOptions {
  league?: LeagueType;
  status?: MatchStatus;
  teamId?: string;
  limit?: number;
}

interface CreateMatchData {
  home_team_id: string;
  away_team_id: string;
  match_date: string;
}

interface MatchWithStats extends MatchWithTeams {
  player_stats?: (PlayerStats & { player?: { id: string; first_name: string; last_name: string; jersey_number?: number; position?: string; team_id: string } })[];
}

interface UseMatchesReturn {
  matches: MatchWithTeams[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createMatch: (data: CreateMatchData) => Promise<MatchWithTeams | null>;
  updateMatch: (id: string, data: Partial<{ status: MatchStatus; home_score: number; away_score: number; match_date: string }>) => Promise<MatchWithTeams | null>;
  deleteMatch: (id: string) => Promise<boolean>;
  getMatch: (id: string) => Promise<MatchWithStats | null>;
}

export function useMatches(options: UseMatchesOptions = {}): UseMatchesReturn {
  const { league, status, teamId, limit = 50 } = options;
  const [matches, setMatches] = useState<MatchWithTeams[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (league && league !== 'all') {
        params.set('league', league);
      }
      if (status) {
        params.set('status', status);
      }
      if (teamId) {
        params.set('team_id', teamId);
      }
      params.set('limit', limit.toString());

      const response = await fetch(`/api/matches?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setMatches(result.data);
      } else {
        setError(result.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur fetch matches:', err);
    } finally {
      setLoading(false);
    }
  }, [league, status, teamId, limit]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const createMatch = async (data: CreateMatchData): Promise<MatchWithTeams | null> => {
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMatches((prev) => [result.data, ...prev]);
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la création');
      console.error('Erreur create match:', err);
      return null;
    }
  };

  const updateMatch = async (
    id: string,
    data: Partial<{ status: MatchStatus; home_score: number; away_score: number; match_date: string }>
  ): Promise<MatchWithTeams | null> => {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMatches((prev) =>
          prev.map((match) => (match.id === id ? result.data : match))
        );
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la modification');
      console.error('Erreur update match:', err);
      return null;
    }
  };

  const deleteMatch = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/matches/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setMatches((prev) => prev.filter((match) => match.id !== id));
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Erreur delete match:', err);
      return false;
    }
  };

  const getMatch = async (id: string): Promise<MatchWithStats | null> => {
    try {
      const response = await fetch(`/api/matches/${id}`);
      const result = await response.json();

      if (result.success) {
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la récupération');
      console.error('Erreur get match:', err);
      return null;
    }
  };

  return {
    matches,
    loading,
    error,
    refetch: fetchMatches,
    createMatch,
    updateMatch,
    deleteMatch,
    getMatch,
  };
}
