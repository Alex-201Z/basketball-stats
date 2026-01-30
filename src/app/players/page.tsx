'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/PageLayout';
import { usePlayers } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import {
  User,
  Plus,
  Pencil,
  Trash2,
  Users,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
} from 'lucide-react';
import type { PlayerWithTeam, PlayerPosition, Team } from '@/types';

const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'PG', label: 'Meneur (PG)' },
  { value: 'SG', label: 'Arrière (SG)' },
  { value: 'SF', label: 'Ailier (SF)' },
  { value: 'PF', label: 'Ailier fort (PF)' },
  { value: 'C', label: 'Pivot (C)' },
];

export default function PlayersPage() {
  const { players, loading, error, createPlayer, updatePlayer, deletePlayer } = usePlayers({ league: 'local' });
  const { teams } = useTeams({ league: 'local' });
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerWithTeam | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    jersey_number: '',
    position: '' as PlayerPosition | '',
    team_id: '',
    photo_url: '',
  });
  const [formError, setFormError] = useState('');

  // Filtrer les joueurs par équipe sélectionnée
  const teamPlayers = useMemo(() => {
    if (!selectedTeam) return [];
    return players.filter((p) => p.team_id === selectedTeam.id);
  }, [players, selectedTeam]);

  // Recherche globale
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return players.filter(
      (p) =>
        p.first_name.toLowerCase().includes(query) ||
        p.last_name.toLowerCase().includes(query) ||
        p.team?.name?.toLowerCase().includes(query) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(query)
    );
  }, [players, searchQuery]);

  // Compter les joueurs par équipe
  const playerCountByTeam = useMemo(() => {
    const counts: Record<string, number> = {};
    players.forEach((p) => {
      counts[p.team_id] = (counts[p.team_id] || 0) + 1;
    });
    return counts;
  }, [players]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.first_name.trim()) {
      setFormError('Le prénom est requis');
      return;
    }
    if (!formData.last_name.trim()) {
      setFormError('Le nom est requis');
      return;
    }
    if (!formData.team_id) {
      setFormError("L'équipe est requise");
      return;
    }

    const data = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      jersey_number: formData.jersey_number ? parseInt(formData.jersey_number, 10) : undefined,
      position: formData.position || undefined,
      team_id: formData.team_id,
      photo_url: formData.photo_url || undefined,
    };

    let result;
    if (editingPlayer) {
      result = await updatePlayer(editingPlayer.id, data);
    } else {
      result = await createPlayer(data as { first_name: string; last_name: string; team_id: string; jersey_number?: number; position?: PlayerPosition; photo_url?: string });
    }

    if (result) {
      setShowForm(false);
      setEditingPlayer(null);
      setFormData({
        first_name: '',
        last_name: '',
        jersey_number: '',
        position: '',
        team_id: selectedTeam?.id || '',
        photo_url: '',
      });
    } else {
      setFormError('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (player: PlayerWithTeam) => {
    setEditingPlayer(player);
    setFormData({
      first_name: player.first_name,
      last_name: player.last_name,
      jersey_number: player.jersey_number?.toString() || '',
      position: player.position || '',
      team_id: player.team_id,
      photo_url: player.photo_url || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (player: PlayerWithTeam) => {
    if (window.confirm(`Supprimer le joueur "${player.first_name} ${player.last_name}" ?`)) {
      await deletePlayer(player.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlayer(null);
    setFormData({
      first_name: '',
      last_name: '',
      jersey_number: '',
      position: '',
      team_id: selectedTeam?.id || '',
      photo_url: '',
    });
    setFormError('');
  };

  const handleSelectTeam = (team: Team) => {
    setSelectedTeam(team);
    setFormData((prev) => ({ ...prev, team_id: team.id }));
    setSearchQuery('');
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setShowForm(false);
    setEditingPlayer(null);
  };

  const handleAddPlayer = () => {
    setFormData({
      first_name: '',
      last_name: '',
      jersey_number: '',
      position: '',
      team_id: selectedTeam?.id || '',
      photo_url: '',
    });
    setShowForm(true);
  };

  const renderPlayerCard = (player: PlayerWithTeam, showTeam = false) => (
    <Card
      key={player.id}
      className="group border-0 bg-card transition-all duration-300 hover:bg-secondary"
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {player.photo_url ? (
              <div className="relative h-12 w-12 overflow-hidden rounded-full ring-2 ring-border">
                <Image
                  src={player.photo_url}
                  alt={`${player.first_name} ${player.last_name}`}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 ring-2 ring-border">
                <span className="text-lg font-bold text-primary">
                  {player.jersey_number ?? '?'}
                </span>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-foreground">
                {player.first_name} {player.last_name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {showTeam && player.team && (
                  <span className="text-primary">{player.team.name}</span>
                )}
                {player.position && (
                  <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                    {player.position}
                  </Badge>
                )}
                {player.jersey_number && (
                  <span>#{player.jersey_number}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(player)}
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(player)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout
      title={selectedTeam ? selectedTeam.name : 'Gestion des joueurs'}
      subtitle={
        selectedTeam
          ? `${teamPlayers.length} joueurs dans l'équipe`
          : `${players.length} joueurs • ${teams.length} équipes`
      }
      actions={
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un joueur..."
              className="w-64 rounded-xl border border-border bg-secondary py-2 pl-10 pr-10 text-sm text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {selectedTeam && !showForm && (
            <Button onClick={handleAddPlayer} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un joueur
            </Button>
          )}
        </div>
      }
    >
      {/* Résultats de recherche */}
      {searchQuery && (
        <div className="mb-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Résultats de recherche ({searchResults.length})
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="mr-1 h-4 w-4" />
              Effacer
            </Button>
          </div>
          {searchResults.length === 0 ? (
            <Card className="border-0 bg-card">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun joueur trouvé pour &quot;{searchQuery}&quot;</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((player) => renderPlayerCard(player, true))}
            </div>
          )}
        </div>
      )}

      {/* Vue normale (pas de recherche) */}
      {!searchQuery && (
        <>
          {/* Bouton retour si équipe sélectionnée */}
          {selectedTeam && (
            <Button
              variant="ghost"
              onClick={handleBackToTeams}
              className="mb-4 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Retour aux équipes
            </Button>
          )}

          {/* Message si pas d'équipes */}
          {teams.length === 0 && !loading && (
            <Card className="mb-6 border-0 border-l-4 border-l-yellow-500 bg-yellow-500/10">
              <CardContent className="flex items-center justify-between py-4">
                <p className="text-yellow-200">
                  Vous devez d&apos;abord créer une équipe avant d&apos;ajouter des joueurs.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="/teams">Gérer les équipes</a>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Formulaire */}
          {showForm && teams.length > 0 && (
            <Card className="mb-6 border-0 bg-card">
              <CardHeader className="border-b border-border">
                <CardTitle className="text-lg text-foreground">
                  {editingPlayer ? 'Modifier le joueur' : 'Nouveau joueur'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Ex: Jean"
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Nom *
                      </label>
                      <input
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Ex: Dupont"
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Équipe *
                      </label>
                      <select
                        value={formData.team_id}
                        onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
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
                        Numéro
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="99"
                        value={formData.jersey_number}
                        onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                        placeholder="0-99"
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-foreground">
                        Position
                      </label>
                      <select
                        value={formData.position}
                        onChange={(e) => setFormData({ ...formData, position: e.target.value as PlayerPosition | '' })}
                        className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Sélectionner...</option>
                        {POSITIONS.map((pos) => (
                          <option key={pos.value} value={pos.value}>
                            {pos.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">
                      URL de la photo (optionnel)
                    </label>
                    <input
                      type="url"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  {formError && <p className="text-sm text-destructive">{formError}</p>}
                  <div className="flex gap-3">
                    <Button type="submit" className="bg-primary hover:bg-primary/90">
                      {editingPlayer ? 'Enregistrer' : 'Créer'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Contenu principal */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : error ? (
            <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
              Erreur: {error}
            </div>
          ) : !selectedTeam ? (
            /* Liste des équipes */
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {teams.length === 0 ? (
                <Card className="col-span-full border-0 bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="mb-4 h-16 w-16 text-muted-foreground" />
                    <p className="text-lg font-medium text-muted-foreground">Aucune équipe</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Créez d&apos;abord une équipe pour ajouter des joueurs
                    </p>
                  </CardContent>
                </Card>
              ) : (
                teams.map((team) => (
                  <Card
                    key={team.id}
                    onClick={() => handleSelectTeam(team)}
                    className="group cursor-pointer border-0 bg-card transition-all duration-300 hover:bg-secondary hover:ring-1 hover:ring-primary/50"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary relative overflow-hidden">
                            {team.logo_url ? (
                              <div className="relative h-10 w-10">
                                <Image
                                  src={team.logo_url}
                                  alt={team.name}
                                  fill
                                  className="object-cover rounded-lg"
                                  sizes="40px"
                                />
                              </div>
                            ) : (
                              <Users className="h-7 w-7" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-foreground">{team.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {playerCountByTeam[team.id] || 0} joueur
                              {(playerCountByTeam[team.id] || 0) > 1 ? 's' : ''}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          ) : (
            /* Liste des joueurs de l'équipe */
            <div>
              {teamPlayers.length === 0 ? (
                <Card className="border-0 bg-card">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <User className="mb-4 h-16 w-16 text-muted-foreground" />
                    <p className="text-lg font-medium text-muted-foreground">
                      Aucun joueur dans cette équipe
                    </p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Ajoutez votre premier joueur
                    </p>
                    <Button onClick={handleAddPlayer} className="bg-primary hover:bg-primary/90">
                      <Plus className="mr-2 h-4 w-4" />
                      Ajouter un joueur
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {teamPlayers.map((player) => renderPlayerCard(player))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
