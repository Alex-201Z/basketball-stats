'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Calendar } from 'lucide-react';
import type { MatchWithTeams, PlayerStats, PlayerWithTeam, MatchStatus } from '@/types';

interface MatchData extends MatchWithTeams {
  player_stats?: (PlayerStats & { player?: PlayerWithTeam })[];
}

const STATUS_LABELS: Record<MatchStatus, { label: string; color: string }> = {
  scheduled: { label: 'Programmé', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'En cours', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Terminé', color: 'bg-gray-100 text-gray-800' },
};

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.id as string;

  const [match, setMatch] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const response = await fetch(`/api/matches/${matchId}`);
        const result = await response.json();

        if (result.success) {
          setMatch(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Erreur de chargement');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [matchId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  // Séparer les stats par équipe
  const homeStats = (match.player_stats || []).filter(
    (s) => s.player?.team_id === match.home_team_id
  );
  const awayStats = (match.player_stats || []).filter(
    (s) => s.player?.team_id === match.away_team_id
  );

  const renderStatsTable = (stats: (PlayerStats & { player?: PlayerWithTeam })[], teamName: string) => (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{teamName}</CardTitle>
      </CardHeader>
      <CardContent>
        {stats.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            Aucune statistique enregistrée
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-1">Joueur</th>
                  <th className="text-center py-2 px-1">PTS</th>
                  <th className="text-center py-2 px-1">REB</th>
                  <th className="text-center py-2 px-1">AST</th>
                  <th className="text-center py-2 px-1">STL</th>
                  <th className="text-center py-2 px-1">BLK</th>
                  <th className="text-center py-2 px-1">TO</th>
                </tr>
              </thead>
              <tbody>
                {stats.map((stat) => (
                  <tr key={stat.id} className="border-b last:border-0">
                    <td className="py-2 px-1">
                      <span className="text-muted-foreground">
                        #{stat.player?.jersey_number ?? '?'}
                      </span>{' '}
                      {stat.player?.first_name?.[0]}. {stat.player?.last_name}
                    </td>
                    <td className="text-center py-2 px-1 font-bold">
                      {stat.points}
                    </td>
                    <td className="text-center py-2 px-1">{stat.rebounds}</td>
                    <td className="text-center py-2 px-1">{stat.assists}</td>
                    <td className="text-center py-2 px-1">{stat.steals}</td>
                    <td className="text-center py-2 px-1">{stat.blocks}</td>
                    <td className="text-center py-2 px-1">{stat.turnovers}</td>
                  </tr>
                ))}
                {/* Totaux */}
                <tr className="bg-muted/50 font-bold">
                  <td className="py-2 px-1">Total</td>
                  <td className="text-center py-2 px-1">
                    {stats.reduce((s, st) => s + (st.points || 0), 0)}
                  </td>
                  <td className="text-center py-2 px-1">
                    {stats.reduce((s, st) => s + (st.rebounds || 0), 0)}
                  </td>
                  <td className="text-center py-2 px-1">
                    {stats.reduce((s, st) => s + (st.assists || 0), 0)}
                  </td>
                  <td className="text-center py-2 px-1">
                    {stats.reduce((s, st) => s + (st.steals || 0), 0)}
                  </td>
                  <td className="text-center py-2 px-1">
                    {stats.reduce((s, st) => s + (st.blocks || 0), 0)}
                  </td>
                  <td className="text-center py-2 px-1">
                    {stats.reduce((s, st) => s + (st.turnovers || 0), 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/matches" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            {match.status !== 'completed' && (
              <Link href={`/matches/${matchId}/live`}>
                <Button>
                  <Play className="h-4 w-4 mr-2" />
                  {match.status === 'scheduled' ? 'Démarrer' : 'Continuer'}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Score principal */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="text-center">
              <span
                className={`text-xs px-2 py-1 rounded ${STATUS_LABELS[match.status].color}`}
              >
                {STATUS_LABELS[match.status].label}
              </span>

              <div className="flex items-center justify-center gap-8 my-6">
                <div className="text-right flex-1">
                  <p className="font-bold text-xl">{match.home_team?.name}</p>
                  <p className="text-sm text-muted-foreground">Domicile</p>
                </div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-orange-500">
                    {match.home_score} - {match.away_score}
                  </p>
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-xl">{match.away_team?.name}</p>
                  <p className="text-sm text-muted-foreground">Extérieur</p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(match.match_date)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Box Score */}
        <h2 className="text-xl font-bold mb-4">Box Score</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {renderStatsTable(homeStats, match.home_team?.name || 'Équipe domicile')}
          {renderStatsTable(awayStats, match.away_team?.name || 'Équipe extérieure')}
        </div>
      </main>
    </div>
  );
}
