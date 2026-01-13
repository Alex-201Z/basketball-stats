'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePlayers } from '@/hooks/usePlayers';
import { useTeams } from '@/hooks/useTeams';
import { User, Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import type { PlayerWithTeam, PlayerPosition } from '@/types';

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
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<PlayerWithTeam | null>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    jersey_number: '',
    position: '' as PlayerPosition | '',
    team_id: '',
    photo_url: '',
  });
  const [formError, setFormError] = useState('');
  const [filterTeam, setFilterTeam] = useState('');

  const filteredPlayers = filterTeam
    ? players.filter((p) => p.team_id === filterTeam)
    : players;

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
      setFormError('L\'équipe est requise');
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
        team_id: '',
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
      team_id: '',
      photo_url: '',
    });
    setFormError('');
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
              <User className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-bold">Gestion des joueurs</h1>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="px-3 py-2 border rounded-md bg-background text-sm"
              >
                <option value="">Toutes les équipes</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              {!showForm && (
                <Button onClick={() => setShowForm(true)} disabled={teams.length === 0}>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau joueur
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {teams.length === 0 && !loading && (
          <div className="text-center py-8 mb-8 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              Vous devez d&apos;abord créer une équipe avant d&apos;ajouter des joueurs.
            </p>
            <Link href="/teams">
              <Button variant="outline" className="mt-2">
                Gérer les équipes
              </Button>
            </Link>
          </div>
        )}

        {showForm && teams.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingPlayer ? 'Modifier le joueur' : 'Nouveau joueur'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Prénom *
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="Ex: Jean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nom *
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="Ex: Dupont"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Équipe *
                    </label>
                    <select
                      value={formData.team_id}
                      onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
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
                      Numéro
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="99"
                      value={formData.jersey_number}
                      onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="0-99"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Position
                    </label>
                    <select
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value as PlayerPosition | '' })}
                      className="w-full px-3 py-2 border rounded-md bg-background"
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
                  <label className="block text-sm font-medium mb-1">
                    URL de la photo (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.photo_url}
                    onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="https://..."
                  />
                </div>
                {formError && (
                  <p className="text-red-500 text-sm">{formError}</p>
                )}
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingPlayer ? 'Modifier' : 'Créer'}
                  </Button>
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
        ) : filteredPlayers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {filterTeam
              ? 'Aucun joueur dans cette équipe.'
              : 'Aucun joueur local. Ajoutez votre premier joueur !'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map((player) => (
              <Card key={player.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={`${player.first_name} ${player.last_name}`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 font-bold">
                            {player.jersey_number ?? '?'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">
                          {player.first_name} {player.last_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {player.team?.name || 'Sans équipe'}
                          {player.position && ` • ${player.position}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(player)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(player)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
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
