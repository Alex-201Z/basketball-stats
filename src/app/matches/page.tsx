'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/PageLayout';
import { useMatches } from '@/hooks/useMatches';
import { useTeams } from '@/hooks/useTeams';
import { Calendar, Plus, Play, Eye, Trash2, Clock, MapPin } from 'lucide-react';
import type { MatchWithTeams, MatchStatus } from '@/types';

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string; dotColor: string }> = {
  scheduled: {
    label: 'Programmé',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dotColor: 'bg-blue-500',
  },
  in_progress: {
    label: 'En cours',
    className: 'bg-green-500/20 text-green-400 border-green-500/30',
    dotColor: 'bg-green-500 animate-pulse',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-muted text-muted-foreground border-border',
    dotColor: 'bg-muted-foreground',
  },
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
      setFormError("L'équipe à domicile est requise");
      return;
    }
    if (!formData.away_team_id) {
      setFormError("L'équipe extérieure est requise");
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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <PageLayout
      title="Gestion des matchs"
      subtitle={`${matches.length} matchs au total`}
      actions={
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as MatchStatus | '')}
            className="rounded-xl border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Tous les matchs</option>
            <option value="scheduled">Programmés</option>
            <option value="in_progress">En cours</option>
            <option value="completed">Terminés</option>
          </select>
          {!showForm && (
            <Button
              onClick={() => setShowForm(true)}
              disabled={teams.length < 2}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau match
            </Button>
          )}
        </div>
      }
    >
      {/* Warning if not enough teams */}
      {teams.length < 2 && !loading && (
        <Card className="mb-6 border-0 border-l-4 border-l-yellow-500 bg-yellow-500/10">
          <CardContent className="flex items-center justify-between py-4">
            <p className="text-yellow-200">
              Vous devez avoir au moins 2 équipes pour créer un match.
            </p>
            <Link href="/teams">
              <Button variant="outline" size="sm">
                Gérer les équipes
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Form */}
      {showForm && teams.length >= 2 && (
        <Card className="mb-6 border-0 bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg text-foreground">Programmer un match</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Équipe à domicile *
                  </label>
                  <select
                    value={formData.home_team_id}
                    onChange={(e) => setFormData({ ...formData, home_team_id: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Équipe extérieure *
                  </label>
                  <select
                    value={formData.away_team_id}
                    onChange={(e) => setFormData({ ...formData, away_team_id: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.match_date}
                    onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Heure
                  </label>
                  <input
                    type="time"
                    value={formData.match_time}
                    onChange={(e) => setFormData({ ...formData, match_time: e.target.value })}
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              {formError && <p className="text-sm text-destructive">{formError}</p>}
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  Créer le match
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Matches List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          Erreur: {error}
        </div>
      ) : filteredMatches.length === 0 ? (
        <Card className="border-0 bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">
              {filterStatus
                ? `Aucun match ${STATUS_CONFIG[filterStatus].label.toLowerCase()}`
                : 'Aucun match'}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              Programmez votre premier match
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredMatches.map((match) => (
            <Card
              key={match.id}
              className="group border-0 bg-card transition-all duration-300 hover:bg-secondary"
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  {/* Match Info */}
                  <div className="flex items-center gap-6">
                    {/* Date/Time */}
                    <div className="hidden w-24 flex-col items-center text-center md:flex">
                      <span className={`mb-1 h-2 w-2 rounded-full ${STATUS_CONFIG[match.status].dotColor}`} />
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(match.match_date).split(' ').slice(1).join(' ')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(match.match_date)}
                      </p>
                    </div>

                    {/* Teams & Score */}
                    <div className="flex items-center gap-4">
                      <div className="w-32 text-right">
                        <p className="font-bold text-foreground">
                          {match.home_team?.name || 'TBD'}
                        </p>
                        <p className="text-xs text-muted-foreground">Domicile</p>
                      </div>

                      <div className="flex items-center gap-3 rounded-xl bg-secondary px-4 py-2 ring-1 ring-border">
                        <span className="text-2xl font-bold text-foreground">{match.home_score}</span>
                        <span className="text-muted-foreground">-</span>
                        <span className="text-2xl font-bold text-foreground">{match.away_score}</span>
                      </div>

                      <div className="w-32 text-left">
                        <p className="font-bold text-foreground">
                          {match.away_team?.name || 'TBD'}
                        </p>
                        <p className="text-xs text-muted-foreground">Extérieur</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={STATUS_CONFIG[match.status].className}
                    >
                      {STATUS_CONFIG[match.status].label}
                    </Badge>

                    {(match.status === 'scheduled' || match.status === 'in_progress') && (
                      <Link href={`/matches/${match.id}/live`}>
                        <Button size="sm" className="bg-green-600 hover:bg-green-700">
                          <Play className="mr-1 h-4 w-4" />
                          {match.status === 'scheduled' ? 'Démarrer' : 'Continuer'}
                        </Button>
                      </Link>
                    )}

                    <Link href={`/matches/${match.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-1 h-4 w-4" />
                        Détails
                      </Button>
                    </Link>

                    {match.status === 'scheduled' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(match)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
