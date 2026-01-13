'use client';

import { useState, useEffect, useCallback } from 'react';
import type { PlayerWithTeam, LeagueType, PlayerPosition } from '@/types';

interface UsePlayersOptions {
  league?: LeagueType;
  teamId?: string;
}

interface CreatePlayerData {
  first_name: string;
  last_name: string;
  jersey_number?: number;
  position?: PlayerPosition;
  team_id: string;
  photo_url?: string;
}

interface UsePlayersReturn {
  players: PlayerWithTeam[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createPlayer: (data: CreatePlayerData) => Promise<PlayerWithTeam | null>;
  updatePlayer: (id: string, data: Partial<CreatePlayerData>) => Promise<PlayerWithTeam | null>;
  deletePlayer: (id: string) => Promise<boolean>;
}

export function usePlayers(options: UsePlayersOptions = {}): UsePlayersReturn {
  const { league, teamId } = options;
  const [players, setPlayers] = useState<PlayerWithTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (league && league !== 'all') {
        params.set('league', league);
      }
      if (teamId) {
        params.set('team_id', teamId);
      }

      const response = await fetch(`/api/players?${params.toString()}`);
      const result = await response.json();

      if (result.success) {
        setPlayers(result.data);
      } else {
        setError(result.error || 'Erreur inconnue');
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur fetch players:', err);
    } finally {
      setLoading(false);
    }
  }, [league, teamId]);

  useEffect(() => {
    fetchPlayers();
  }, [fetchPlayers]);

  const createPlayer = async (data: CreatePlayerData): Promise<PlayerWithTeam | null> => {
    try {
      const response = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setPlayers((prev) => [...prev, result.data]);
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la création');
      console.error('Erreur create player:', err);
      return null;
    }
  };

  const updatePlayer = async (
    id: string,
    data: Partial<CreatePlayerData>
  ): Promise<PlayerWithTeam | null> => {
    try {
      const response = await fetch(`/api/players/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setPlayers((prev) =>
          prev.map((player) => (player.id === id ? result.data : player))
        );
        return result.data;
      } else {
        setError(result.error);
        return null;
      }
    } catch (err) {
      setError('Erreur lors de la modification');
      console.error('Erreur update player:', err);
      return null;
    }
  };

  const deletePlayer = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/players/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setPlayers((prev) => prev.filter((player) => player.id !== id));
        return true;
      } else {
        setError(result.error);
        return false;
      }
    } catch (err) {
      setError('Erreur lors de la suppression');
      console.error('Erreur delete player:', err);
      return false;
    }
  };

  return {
    players,
    loading,
    error,
    refetch: fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
  };
}
