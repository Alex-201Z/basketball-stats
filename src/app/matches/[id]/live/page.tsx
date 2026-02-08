'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Flag } from 'lucide-react';
import type { MatchWithTeams, PlayerStats, PlayerWithTeam, PlayerWithStats } from '@/types';
import { ScoutAccessModal } from '@/components/matches/ScoutAccessModal';
import { StatsEntryOverlay } from '@/components/matches/StatsEntryOverlay';
import { PlayerStatRow } from '@/components/matches/PlayerStatRow';
import { MatchSheetModal } from '@/components/matches/MatchSheetModal';

interface MatchData extends MatchWithTeams {
  player_stats?: (PlayerStats & { player?: PlayerWithTeam })[];
  has_access_code?: boolean;
}

export default function LiveScoringPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchData | null>(null);
  const [homePlayers, setHomePlayers] = useState<PlayerWithStats[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<PlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Sécurité Scout
  const [isScoutAuthenticated, setIsScoutAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAuthSubmit = async (code: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.success) {
        setIsScoutAuthenticated(true);
        setShowAuthModal(false);
        sessionStorage.setItem(`match_auth_${matchId}`, 'true');
      } else {
        alert('Code incorrect');
      }
    } catch (e) {
      alert('Erreur de validation');
    }
  };

  // State pour le joueur sélectionné (Mode Saisie Détaillée)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

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

        // Check Access Code needed
        if (result.data.has_access_code) {
          const storedAuth = sessionStorage.getItem(`match_auth_${matchId}`);
          if (storedAuth === 'true') {
            setIsScoutAuthenticated(true);
          } else {
            setShowAuthModal(true);
          }
        } else {
          setIsScoutAuthenticated(true); // Pas de code, accès libre (ou gestion différente selon rôle)
        }
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

  const handleStatAction = async (playerId: string, actionType: string) => {
    if (!match || match.status !== 'in_progress') return;

    const player = [...homePlayers, ...awayPlayers].find(p => p.id === playerId);
    if (!player) return;

    const stats = player.stats || {
      points: 0, offensive_rebounds: 0, defensive_rebounds: 0, total_rebounds: 0,
      assists: 0, steals: 0, blocks: 0, turnovers: 0, personal_fouls: 0,
      minutes_played: 0, field_goals_made: 0, field_goals_attempted: 0,
      three_pointers_made: 0, three_pointers_attempted: 0,
      free_throws_made: 0, free_throws_attempted: 0, id: '', player_id: playerId, match_id: matchId, updated_at: ''
    };

    const updates: Partial<PlayerStats> = {};

    switch (actionType) {
      case '2pm': // 2 Points Marqué
        updates.points = (stats.points || 0) + 2;
        updates.field_goals_made = (stats.field_goals_made || 0) + 1;
        updates.field_goals_attempted = (stats.field_goals_attempted || 0) + 1;
        break;
      case '2miss': // 2 Points Raté
        updates.field_goals_attempted = (stats.field_goals_attempted || 0) + 1;
        break;
      case '3pm': // 3 Points Marqué
        updates.points = (stats.points || 0) + 3;
        updates.three_pointers_made = (stats.three_pointers_made || 0) + 1;
        updates.three_pointers_attempted = (stats.three_pointers_attempted || 0) + 1;
        break;
      case '3miss': // 3 Points Raté
        updates.three_pointers_attempted = (stats.three_pointers_attempted || 0) + 1;
        break;
      case 'ftm': // Lancer Franc Marqué
        updates.points = (stats.points || 0) + 1;
        updates.free_throws_made = (stats.free_throws_made || 0) + 1;
        updates.free_throws_attempted = (stats.free_throws_attempted || 0) + 1;
        break;
      case 'ftmiss': // Lancer Franc Raté
        updates.free_throws_attempted = (stats.free_throws_attempted || 0) + 1;
        break;
      case 'oreb':
        updates.offensive_rebounds = (stats.offensive_rebounds || 0) + 1;
        break;
      case 'dreb':
        updates.defensive_rebounds = (stats.defensive_rebounds || 0) + 1;
        break;
      case 'ast':
        updates.assists = (stats.assists || 0) + 1;
        break;
      case 'stl':
        updates.steals = (stats.steals || 0) + 1;
        break;
      case 'blk':
        updates.blocks = (stats.blocks || 0) + 1;
        break;
      case 'to':
        updates.turnovers = (stats.turnovers || 0) + 1;
        break;
      case 'pf':
        updates.personal_fouls = (stats.personal_fouls || 0) + 1;
        break;
      case 'min+':
        updates.minutes_played = (Number(stats.minutes_played) || 0) + 1;
        break;
      case 'validate':
        updates.status = 'ACCEPTED';
        break;
    }

    // Optimistic Update
    const updateList = (list: PlayerWithStats[]) => list.map(p => {
      if (p.id === playerId) {
        return { ...p, stats: { ...p.stats, ...updates } as PlayerStats };
      }
      return p;
    });
    setHomePlayers(updateList);
    setAwayPlayers(updateList);

    // Send to API
    try {
      const response = await fetch(`/api/matches/${matchId}/stats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: playerId, ...updates }),
      });
      const result = await response.json();

      if (result.success && result.data) {
        const updateWithServerData = (list: PlayerWithStats[]) => list.map(p => {
          if (p.id === playerId) {
            return { ...p, stats: result.data };
          }
          return p;
        });
        setHomePlayers(updateWithServerData);
        setAwayPlayers(updateWithServerData);

        // Update Match Score if points changed
        if (updates.points !== undefined) {
          const newHomePlayers = updateWithServerData(homePlayers);
          const newAwayPlayers = updateWithServerData(awayPlayers);

          const homeScore = newHomePlayers.reduce((acc, p) => acc + (p.stats?.points || 0), 0);
          const awayScore = newAwayPlayers.reduce((acc, p) => acc + (p.stats?.points || 0), 0);

          setMatch(prev => prev ? { ...prev, home_score: homeScore, away_score: awayScore } : null);

          await fetch(`/api/matches/${matchId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ home_score: homeScore, away_score: awayScore }),
          });
        }
      }
    } catch (err) {
      console.error("Error updating stat", err);
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

  const selectedPlayer = selectedPlayerId
    ? [...homePlayers, ...awayPlayers].find(p => p.id === selectedPlayerId)
    : null;

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

  return (
    <div className="min-h-screen bg-background relative">

      {/* Modal Auth */}
      <ScoutAccessModal isOpen={showAuthModal} onSubmit={handleAuthSubmit} />

      {/* Overlay de Saisie (S'affiche si un joueur est sélectionné) */}
      <StatsEntryOverlay
        selectedPlayer={selectedPlayer || null}
        match={match}
        onClose={() => setSelectedPlayerId(null)}
        onStatAction={handleStatAction}
      />

      {/* Header avec score */}
      <header className="border-b bg-card sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <Link href="/matches" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex gap-2">
              <MatchSheetModal
                matchId={matchId}
                initialSheetUrl={match.sheet_url}
                onSheetUpdate={(url) => setMatch(prev => prev ? { ...prev, sheet_url: url || undefined } : null)}
              />
              {match.status === 'scheduled' && (
                <Button onClick={startMatch} size="sm" className="bg-green-600 hover:bg-green-700">
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer
                </Button>
              )}
              {match.status === 'in_progress' && (
                <Button onClick={endMatch} size="sm" variant="destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Terminer
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 md:gap-12">
            <div className="text-right flex-1">
              <span className="font-bold text-lg block leading-tight">{match.home_team?.name}</span>
              <span className="text-xs text-muted-foreground">Domicile</span>
            </div>
            <div className="text-center px-4 py-1 bg-secondary/50 rounded-xl">
              <span className="text-3xl font-black text-primary font-mono tracking-tighter">
                {match.home_score} - {match.away_score}
              </span>
            </div>
            <div className="text-left flex-1">
              <span className="font-bold text-lg block leading-tight">{match.away_team?.name}</span>
              <span className="text-xs text-muted-foreground">Extérieur</span>
            </div>
          </div>
        </div>
      </header>

      {/* Zone de saisie */}
      <main className="container mx-auto max-w-5xl py-6 space-y-8">
        {match.status === 'scheduled' && (
          <div className="text-center py-12 bg-yellow-50/50 border border-yellow-200 rounded-xl mx-4">
            <p className="text-yellow-800 font-medium">
              Le match n'a pas encore commencé.
            </p>
          </div>
        )}

        {match.status === 'completed' && (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div className="text-xl font-bold text-muted-foreground">Match Terminé</div>
            <Link href={`/matches/${matchId}`}>
              <Button>Voir les résultats finaux</Button>
            </Link>
          </div>
        )}

        <div className="space-y-8">
          {/* Équipe domicile */}
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-blue-600/5 px-6 py-3 border-b border-blue-100 flex justify-between items-center">
              <h2 className="font-bold text-blue-700">{match.home_team?.name}</h2>
              <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">HOME</span>
            </div>
            <div className="p-2">
              {homePlayers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm italic">Aucun joueur dans cette équipe</p>
              ) : (
                homePlayers.map((player) => (
                  <PlayerStatRow
                    key={player.id}
                    player={player}
                    isHome={true}
                    onStatAction={handleStatAction}
                  />
                ))
              )}
            </div>
          </div>

          {/* Équipe extérieure */}
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            <div className="bg-red-600/5 px-6 py-3 border-b border-red-100 flex justify-between items-center">
              <h2 className="font-bold text-red-700">{match.away_team?.name}</h2>
              <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">AWAY</span>
            </div>
            <div className="p-2">
              {awayPlayers.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm italic">Aucun joueur dans cette équipe</p>
              ) : (
                awayPlayers.map((player) => (
                  <PlayerStatRow
                    key={player.id}
                    player={player}
                    isHome={false}
                    onStatAction={handleStatAction}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
