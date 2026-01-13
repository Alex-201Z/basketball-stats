'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Pause, Square, Flag } from 'lucide-react';
import type { MatchWithTeams, PlayerStats, PlayerWithTeam } from '@/types';

interface PlayerWithStats extends PlayerWithTeam {
  stats?: PlayerStats;
}

interface MatchData extends MatchWithTeams {
  player_stats?: (PlayerStats & { player?: PlayerWithTeam })[];
}

const STAT_BUTTONS = [
  { key: 'points', label: 'PTS', increments: [1, 2, 3] },
  { key: 'rebounds', label: 'REB', increments: [1] },
  { key: 'assists', label: 'AST', increments: [1] },
  { key: 'steals', label: 'STL', increments: [1] },
  { key: 'blocks', label: 'BLK', increments: [1] },
];

export default function LiveScoringPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchData | null>(null);
  const [homePlayers, setHomePlayers] = useState<PlayerWithStats[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchMatch = useCallback(async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}`);
      const result = await response.json();

      if (result.success) {
        setMatch(result.data);

        // Charger les joueurs des deux équipes
        const [homeRes, awayRes] = await Promise.all([
          fetch(`/api/players?team_id=${result.data.home_team_id}`),
          fetch(`/api/players?team_id=${result.data.away_team_id}`),
        ]);

        const homeData = await homeRes.json();
        const awayData = await awayRes.json();

        // Associer les stats existantes aux joueurs
        const statsMap = new Map(
          (result.data.player_stats || []).map((s: PlayerStats & { player?: { id: string } }) => [s.player?.id || s.player_id, s])
        );

        setHomePlayers(
          (homeData.data || []).map((p: PlayerWithTeam) => ({
            ...p,
            stats: statsMap.get(p.id),
          }))
        );

        setAwayPlayers(
          (awayData.data || []).map((p: PlayerWithTeam) => ({
            ...p,
            stats: statsMap.get(p.id),
          }))
        );
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Erreur de chargement');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [matchId]);

  useEffect(() => {
    fetchMatch();
  }, [fetchMatch]);

  const updateStat = async (playerId: string, stat: string, increment: number) => {
    // Trouver le joueur et ses stats actuelles
    const player = [...homePlayers, ...awayPlayers].find((p) => p.id === playerId);
    if (!player) return;

    const currentValue = (player.stats?.[stat as keyof PlayerStats] as number) || 0;
    const newValue = Math.max(0, currentValue + increment);

    // Mise à jour optimiste de l'UI
    const updatePlayers = (players: PlayerWithStats[]) =>
      players.map((p) =>
        p.id === playerId
          ? {
              ...p,
              stats: {
                ...p.stats,
                [stat]: newValue,
              } as PlayerStats,
            }
          : p
      );

    setHomePlayers(updatePlayers);
    setAwayPlayers(updatePlayers);

    // Envoyer au serveur
    try {
      await fetch(`/api/matches/${matchId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player_id: playerId,
          [stat]: newValue,
        }),
      });

      // Recalculer les scores si c'est des points
      if (stat === 'points') {
        const homeTotal = homePlayers.reduce(
          (sum, p) =>
            sum + ((p.id === playerId ? newValue : p.stats?.points) || 0),
          0
        );
        const awayTotal = awayPlayers.reduce(
          (sum, p) =>
            sum + ((p.id === playerId ? newValue : p.stats?.points) || 0),
          0
        );

        await fetch(`/api/matches/${matchId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            home_score: homeTotal,
            away_score: awayTotal,
          }),
        });

        setMatch((prev) =>
          prev
            ? {
                ...prev,
                home_score: homeTotal,
                away_score: awayTotal,
              }
            : null
        );
      }
    } catch (err) {
      console.error('Erreur mise à jour stat:', err);
    }
  };

  const startMatch = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'in_progress' }),
      });
      const result = await response.json();
      if (result.success) {
        setMatch((prev) => (prev ? { ...prev, status: 'in_progress' } : null));
      }
    } catch (err) {
      console.error('Erreur démarrage match:', err);
    }
  };

  const endMatch = async () => {
    if (!window.confirm('Terminer ce match ?')) return;

    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      const result = await response.json();
      if (result.success) {
        router.push(`/matches/${matchId}`);
      }
    } catch (err) {
      console.error('Erreur fin match:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Match non trouvé'}</p>
          <Link href="/matches">
            <Button>Retour aux matchs</Button>
          </Link>
        </div>
      </div>
    );
  }

  const renderPlayerCard = (player: PlayerWithStats, isHome: boolean) => (
    <Card key={player.id} className={`${isHome ? 'border-l-4 border-l-blue-500' : 'border-r-4 border-r-red-500'}`}>
      <CardContent className="pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-muted-foreground">
              #{player.jersey_number ?? '?'}
            </span>
            <span className="font-semibold">
              {player.first_name[0]}. {player.last_name}
            </span>
            {player.position && (
              <span className="text-xs text-muted-foreground">
                ({player.position})
              </span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {STAT_BUTTONS.map(({ key, label, increments }) => (
            <div key={key} className="flex items-center gap-2">
              <span className="w-10 text-xs font-medium text-muted-foreground">
                {label}
              </span>
              <span className="w-8 text-center font-bold">
                {(player.stats?.[key as keyof PlayerStats] as number) || 0}
              </span>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0 text-red-500"
                  onClick={() => updateStat(player.id, key, -1)}
                  disabled={match.status !== 'in_progress'}
                >
                  -
                </Button>
                {increments.map((inc) => (
                  <Button
                    key={inc}
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 text-green-600"
                    onClick={() => updateStat(player.id, key, inc)}
                    disabled={match.status !== 'in_progress'}
                  >
                    +{inc}
                  </Button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec score */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <Link href="/matches" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex gap-2">
              {match.status === 'scheduled' && (
                <Button onClick={startMatch} className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer le match
                </Button>
              )}
              {match.status === 'in_progress' && (
                <Button onClick={endMatch} variant="destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Terminer le match
                </Button>
              )}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-8">
              <div className="text-right">
                <p className="font-bold text-lg">{match.home_team?.name}</p>
                <p className="text-sm text-muted-foreground">Domicile</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-orange-500">
                  {match.home_score} - {match.away_score}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    match.status === 'in_progress'
                      ? 'bg-green-100 text-green-800'
                      : match.status === 'completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {match.status === 'in_progress'
                    ? 'EN COURS'
                    : match.status === 'completed'
                    ? 'TERMINÉ'
                    : 'PROGRAMMÉ'}
                </span>
              </div>
              <div className="text-left">
                <p className="font-bold text-lg">{match.away_team?.name}</p>
                <p className="text-sm text-muted-foreground">Extérieur</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Zone de saisie */}
      <main className="container mx-auto px-4 py-6">
        {match.status === 'scheduled' && (
          <div className="text-center py-12 bg-yellow-50 border border-yellow-200 rounded-lg mb-6">
            <p className="text-yellow-800">
              Cliquez sur &quot;Démarrer le match&quot; pour commencer la saisie des statistiques.
            </p>
          </div>
        )}

        {match.status === 'completed' && (
          <div className="text-center py-6 mb-6">
            <p className="text-muted-foreground mb-2">Match terminé</p>
            <Link href={`/matches/${matchId}`}>
              <Button variant="outline">Voir le récapitulatif</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Équipe domicile */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-blue-600">
              {match.home_team?.name}
            </h2>
            {homePlayers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun joueur dans cette équipe
              </p>
            ) : (
              <div className="space-y-3">
                {homePlayers.map((player) => renderPlayerCard(player, true))}
              </div>
            )}
          </div>

          {/* Équipe extérieure */}
          <div>
            <h2 className="text-lg font-bold mb-4 text-red-600">
              {match.away_team?.name}
            </h2>
            {awayPlayers.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun joueur dans cette équipe
              </p>
            ) : (
              <div className="space-y-3">
                {awayPlayers.map((player) => renderPlayerCard(player, false))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
