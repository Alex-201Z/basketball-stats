'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMatches } from '@/hooks/useMatches';
import { useTeams } from '@/hooks/useTeams';
import { Calendar, Plus, Play, Eye, Trash2, ArrowLeft } from 'lucide-react';
import type { MatchWithTeams, MatchStatus } from '@/types';

const STATUS_LABELS: Record<MatchStatus, { label: string; color: string }> = {
  scheduled: { label: 'Programmé', color: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'En cours', color: 'bg-green-100 text-green-800' },
  completed: { label: 'Terminé', color: 'bg-gray-100 text-gray-800' },
};

export default function MatchesPage() {
  const { matches, loading, error, createMatch, deleteMatch } = useMatches({ league: 'local' });
  const { teams } = useTeams({ league: 'local' });
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    home_team_id: '',
    away_team_id: '',
    match_date: '',
    match_time: '',
  });
  const [formError, setFormError] = useState('');
  const [filterStatus, setFilterStatus] = useState<MatchStatus | ''>('');

  const filteredMatches = filterStatus
    ? matches.filter((m) => m.status === filterStatus)
    : matches;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.home_team_id) {
      setFormError('L\'équipe à domicile est requise');
      return;
    }
    if (!formData.away_team_id) {
      setFormError('L\'équipe extérieure est requise');
      return;
    }
    if (formData.home_team_id === formData.away_team_id) {
      setFormError('Une équipe ne peut pas jouer contre elle-même');
      return;
    }
    if (!formData.match_date) {
      setFormError('La date est requise');
      return;
    }

    const dateTime = formData.match_time
      ? `${formData.match_date}T${formData.match_time}:00`
      : `${formData.match_date}T00:00:00`;

    const result = await createMatch({
      home_team_id: formData.home_team_id,
      away_team_id: formData.away_team_id,
      match_date: new Date(dateTime).toISOString(),
    });

    if (result) {
      setShowForm(false);
      setFormData({
        home_team_id: '',
        away_team_id: '',
        match_date: '',
        match_time: '',
      });
    } else {
      setFormError('Erreur lors de la création du match');
    }
  };

  const handleDelete = async (match: MatchWithTeams) => {
    if (window.confirm('Supprimer ce match ?')) {
      await deleteMatch(match.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setFormData({
      home_team_id: '',
      away_team_id: '',
      match_date: '',
      match_time: '',
    });
    setFormError('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <Calendar className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-bold">Gestion des matchs</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as MatchStatus | '')}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="">Tous les matchs</option>
                <option value="scheduled">Programmés</option>
                <option value="in_progress">En cours</option>
                <option value="completed">Terminés</option>
              </select>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} disabled={teams.length < 2}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau match
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {teams.length < 2 && !loading && (
          <div className="text-center py-8 mb-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Vous devez avoir au moins 2 équipes pour créer un match.
            </p>
            <Link href="/teams">
              <Button variant="outline" className="mt-2">
                Gérer les équipes
              </Button>
            </Link>
          </div>
        )}

        {showForm && teams.length >= 2 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nouveau match</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Équipe à domicile *
                    </label>
                    <select
                      value={formData.home_team_id}
                      onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Sélectionner...</option>
                      {teams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Équipe extérieure *
                    </label>
                    <select
                      value={formData.away_team_id}
                      onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    >
                      <option value="">Sélectionner...</option>
                      {teams
                        .filter((t) => t.id !== formData.home_team_id)
                        .map((team) => (
                          <option key={team.id} value={team.id}>
                            {team.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      value={formData.match_date}
                      onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Heure
                    </label>
                    <input
                      type="time"
                      value={formData.match_time}
                      onChange={(e) => setFormData({ ...formData, match_time: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                    />
                  </div>
                </div>
                {formError && (
                  <p className="text-red-500 text-sm">{formError}</p>
                )}
                <div className="flex gap-2">
                  <Button type="submit">Créer le match</Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Annuler
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Chargement...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filterStatus
              ? `Aucun match ${STATUS_LABELS[filterStatus].label.toLowerCase()}.`
              : 'Aucun match local. Créez votre premier match !'}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <Card key={match.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${STATUS_LABELS[match.status].color}`}
                      >
                        {STATUS_LABELS[match.status].label}
                      </span>
                      <div className="text-center min-w-[300px]">
                        <div className="flex items-center justify-center gap-4">
                          <span className="font-semibold text-right flex-1">
                            {match.home_team?.name || 'Équipe inconnue'}
                          </span>
                          <span className="text-2xl font-bold text-orange-500">
                            {match.home_score} - {match.away_score}
                          </span>
                          <span className="font-semibold text-left flex-1">
                            {match.away_team?.name || 'Équipe inconnue'}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(match.match_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {match.status === 'scheduled' && (
                        <Link href={`/matches/${match.id}/live`}>
                          <Button variant="default" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Démarrer
                          </Button>
                        </Link>
                      )}
                      {match.status === 'in_progress' && (
                        <Link href={`/matches/${match.id}/live`}>
                          <Button variant="default" size="sm">
                            <Play className="h-4 w-4 mr-1" />
                            Continuer
                          </Button>
                        </Link>
                      )}
                      <Link href={`/matches/${match.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Détails
                        </Button>
                      </Link>
                      {match.status === 'scheduled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(match)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
