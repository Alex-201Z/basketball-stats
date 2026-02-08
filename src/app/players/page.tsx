'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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
  Upload,
  Loader2,
} from 'lucide-react';
import { useRef } from 'react';
import type { PlayerWithTeam, PlayerPosition, Team } from '@/types';

const POSITIONS: { value: PlayerPosition; label: string }[] = [
  { value: 'PG', label: 'Meneur (PG)' },
  { value: 'SG', label: 'Arrière (SG)' },
  { value: 'SF', label: 'Ailier (SF)' },
  { value: 'PF', label: 'Ailier fort (PF)' },
  { value: 'C', label: 'Pivot (C)' },
];

export default function PlayersPage() {
  const router = useRouter();
  const { players, loading, error, createPlayer, updatePlayer, deletePlayer } = usePlayers({ league: 'local' });
  const { teams } = useTeams({ league: 'local' });
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
    age: '',
  });
  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtrage des joueurs
  const filteredPlayers = useMemo(() => {
    let result = players;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.first_name.toLowerCase().includes(query) ||
          p.last_name.toLowerCase().includes(query) ||
          p.team?.name?.toLowerCase().includes(query)
      );
    }
    return result;
  }, [players, searchQuery]);

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

    const data = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      jersey_number: formData.jersey_number ? parseInt(formData.jersey_number, 10) : undefined,
      position: formData.position || undefined,
      team_id: formData.team_id,
      photo_url: formData.photo_url || undefined,
      age: formData.age ? parseInt(formData.age, 10) : undefined,
    };

    let result;
    if (editingPlayer) {
      result = await updatePlayer(editingPlayer.id, data);
    } else {
      result = await createPlayer(data as any);
    }

    if (result) {
      handleCancel();
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
      age: player.age?.toString() || '',
    });
    setShowForm(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      age: '',
    });
    setFormError('');
  };

  const handleAddPlayer = () => {
    setFormData({
      first_name: '',
      last_name: '',
      jersey_number: '',
      position: '',
      team_id: '', // Laisser vide pour forcer le choix
      photo_url: '',
      age: '',
    });
    setShowForm(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Image uniquement');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload?folder=players', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, photo_url: data.url }));
      } else {
        alert('Erreur upload');
      }
    } catch (e) {
      console.error(e);
      alert('Erreur upload');
    } finally {
      setIsUploading(false);
    }
  };

  const renderPlayerCard = (player: PlayerWithTeam) => (
    <Card
      key={player.id}
      className="group border-0 bg-card transition-all duration-300 hover:bg-secondary/50 overflow-hidden cursor-pointer"
      onClick={() => router.push(`/players/${player.id}`)}
    >
      <div className="relative h-48 w-full bg-secondary/30 flex items-center justify-center overflow-hidden">
        {player.photo_url ? (
          <img
            src={player.photo_url}
            alt={`${player.first_name} ${player.last_name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <User className="h-20 w-20 text-muted-foreground/30" />
        )}
        <div className="absolute top-2 right-2 flex gap-1 z-10">
          <Button
            variant="secondary"
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleEdit(player); }}
            className="h-8 w-8 rounded-full shadow-sm"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => { e.stopPropagation(); handleDelete(player); }}
            className="h-8 w-8 rounded-full shadow-sm"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        {player.jersey_number !== undefined && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded">
            #{player.jersey_number}
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground truncate">
            {player.first_name} {player.last_name}
          </h3>
          {player.age && <span className="text-xs text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{player.age} ans</span>}
        </div>

        <div className="flex items-center gap-2 mb-3">
          {player.team ? (
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full truncate max-w-[150px]">
              {player.team.name}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground">Sans club</span>
          )}
          {player.position && (
            <span className="text-xs text-muted-foreground border border-border px-1.5 py-0.5 rounded">
              {player.position}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PageLayout
      title="Joueurs"
      subtitle={`${filteredPlayers.length} joueurs enregistrés`}
      actions={
        <div className="flex items-center gap-3">
          {/* Barre de recherche */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-64 rounded-xl border border-border bg-secondary py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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

          {!showForm && (
            <Button onClick={handleAddPlayer} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Joueur
            </Button>
          )}
        </div>
      }
    >
      {/* Mobile Search */}
      <div className="mb-4 md:hidden relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher un joueur..."
          className="w-full rounded-xl border border-border bg-secondary py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Formulaire */}
      {showForm && (
        <Card className="mb-8 border-0 bg-card shadow-lg ring-1 ring-border">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg text-foreground">
              {editingPlayer ? 'Fiche Joueur' : 'Nouveau Joueur'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* 1. Photo & Identité */}
              <div className="flex flex-col md:flex-row gap-6">
                {/* Photo Preview / Input */}
                <div className="flex flex-col gap-2 items-center min-w-[150px]">
                  <div
                    className="h-32 w-32 rounded-full bg-secondary border-2 border-dashed border-border flex items-center justify-center overflow-hidden relative group cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.photo_url ? (
                      <>
                        <img src={formData.photo_url} alt="Aperçu" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white h-6 w-6" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                        {isUploading ? <Loader2 className="h-8 w-8 animate-spin" /> : <Upload className="h-8 w-8" />}
                        <span className="text-[10px] font-medium uppercase tracking-wider">Photo</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  {/* Fallback URL input (hidden or small) */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, photo_url: '' }))}
                    className="text-xs text-red-500 hover:underline"
                    disabled={!formData.photo_url}
                  >
                    Supprimer
                  </button>
                </div>

                {/* Champs Identité */}
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Prénom *</label>
                      <input
                        required
                        type="text"
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Nom *</label>
                      <input
                        required
                        type="text"
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        className="w-full rounded-lg border border-border bg-secondary px-3 py-2"
                      />
                    </div>
                  </div>
                  <div className="w-1/3">
                    <label className="mb-1 block text-sm font-medium">Âge</label>
                    <input
                      type="number"
                      value={formData.age}
                      onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                      className="w-full rounded-lg border border-border bg-secondary px-3 py-2"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border my-4" />

              {/* 2. Club & Sportif */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1">
                  <label className="mb-1 block text-sm font-medium">Club / Équipe *</label>
                  <select
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2"
                  >
                    <option value="">Choisir un club...</option>
                    {teams.map((team) => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                  {teams.length === 0 && (
                    <p className="text-xs text-yellow-500 mt-1">Aucune équipe disponible. Créez-en une d'abord.</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Position</label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value as PlayerPosition })}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2"
                  >
                    <option value="">-</option>
                    {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Numéro</label>
                  <input
                    type="number"
                    value={formData.jersey_number}
                    onChange={(e) => setFormData({ ...formData, jersey_number: e.target.value })}
                    className="w-full rounded-lg border border-border bg-secondary px-3 py-2"
                  />
                </div>
              </div>

              {formError && <p className="text-sm text-destructive font-medium">{formError}</p>}

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="ghost" onClick={handleCancel}>Annuler</Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 px-8">
                  {editingPlayer ? 'Mettre à jour' : 'Enregistrer le joueur'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des Joueurs */}
      {loading ? (
        <div className="flex justify-center py-12"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <User className="h-16 w-16 mx-auto mb-4 opacity-20" />
          <p className="text-lg">Aucun joueur trouvé</p>
          {!searchQuery && <p className="text-sm mt-2">Commencez par ajouter votre premier joueur</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredPlayers.map((player) => renderPlayerCard(player))}
        </div>
      )}
    </PageLayout>
  );
}
