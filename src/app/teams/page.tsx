'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTeams } from '@/hooks/useTeams';
import { Users, Plus, Pencil, Trash2, ArrowLeft } from 'lucide-react';
import type { Team } from '@/types';

export default function TeamsPage() {
  const { teams, loading, error, createTeam, updateTeam, deleteTeam } = useTeams({ league: 'local' });
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({ name: '', logo_url: '' });
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Le nom est requis');
      return;
    }

    let result;
    if (editingTeam) {
      result = await updateTeam(editingTeam.id, {
        name: formData.name,
        logo_url: formData.logo_url || undefined,
      });
    } else {
      result = await createTeam({
        name: formData.name,
        logo_url: formData.logo_url || undefined,
      });
    }

    if (result) {
      setShowForm(false);
      setEditingTeam(null);
      setFormData({ name: '', logo_url: '' });
    } else {
      setFormError('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({ name: team.name, logo_url: team.logo_url || '' });
    setShowForm(true);
  };

  const handleDelete = async (team: Team) => {
    if (window.confirm(`Supprimer l'équipe "${team.name}" ?`)) {
      await deleteTeam(team.id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTeam(null);
    setFormData({ name: '', logo_url: '' });
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
              <Users className="h-6 w-6 text-orange-500" />
              <h1 className="text-xl font-bold">Gestion des équipes</h1>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle équipe
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingTeam ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nom de l&apos;équipe *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="Ex: Paris Basket"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    URL du logo (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md bg-background"
                    placeholder="https://..."
                  />
                </div>
                {formError && (
                  <p className="text-red-500 text-sm">{formError}</p>
                )}
                <div className="flex gap-2">
                  <Button type="submit">
                    {editingTeam ? 'Modifier' : 'Créer'}
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
        ) : teams.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Aucune équipe locale. Créez votre première équipe !
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map((team) => (
              <Card key={team.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {team.logo_url ? (
                        <img
                          src={team.logo_url}
                          alt={team.name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-orange-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Ligue locale
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(team)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(team)}
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
