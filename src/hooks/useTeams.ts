'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Team, LeagueType } from '@/types';

interface UseTeamsOptions {
  league?: LeagueType;
}

interface UseTeamsReturn {
  teams: Team[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createTeam: (data: { name: string; logo_url?: string }) => Promise<Team | null>;
  updateTeam: (id: string, data: Partial<Team>) => Promise<Team | null>;
  deleteTeam: (id: string) => Promise<boolean>;
}

export function useTeams(options: UseTeamsOptions = {}): UseTeamsReturn {
  const { league } = options;
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (league && league !== 'all') {
        params.set('league', league);
      }

      const response = await fetch(`/api/teams?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setTeams(result.data);
      } else {
        setError(result.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur fetch teams:', err);
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const createTeam = async (data: { name: string; logo_url?: string }): Promise<Team | null> => {
    try {
      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setTeams((prev) => [...prev, result.data]);
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la création');
      console.error('Erreur create team:', err);
      return null;
    }
  };

  const updateTeam = async (id: string, data: Partial<Team>): Promise<Team | null> => {
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setTeams((prev) =>
          prev.map((team) => (team.id === id ? result.data : team))
        );
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la modification');
      console.error('Erreur update team:', err);
      return null;
    }
  };

  const deleteTeam = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/teams/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setTeams((prev) => prev.filter((team) => team.id !== id));
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Erreur delete team:', err);
      return false;
    }
  };

  return {
    teams,
    loading,
    error,
    refetch: fetchTeams,
    createTeam,
    updateTeam,
    deleteTeam,
  };
}
