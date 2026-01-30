'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageLayout } from '@/components/PageLayout';
import { useTeams } from '@/hooks/useTeams';
import { Plus, Edit2, Trash2, Users, UserCircle } from 'lucide-react';
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
      setFormError("Le nom de l'équipe est requis");
      return;
    }

    let result;
    if (editingTeam) {
      result = await updateTeam(editingTeam.id, formData);
    } else {
      result = await createTeam(formData);
    }

    if (result) {
      setShowForm(false);
      setEditingTeam(null);
      setFormData({ name: '', logo_url: '' });
    } else {
      setFormError("Erreur lors de l'enregistrement");
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
    <PageLayout
      title="Gestion des équipes"
      subtitle={`${teams.length} équipes enregistrées`}
      actions={
        !showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle équipe
          </Button>
        )
      }
    >
      {/* Form */}
      {showForm && (
        <Card className="mb-6 border-0 bg-card">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg text-foreground">
              {editingTeam ? 'Modifier l\'équipe' : 'Nouvelle équipe'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    Nom de l&apos;équipe *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Lakers de Paris"
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-foreground">
                    URL du logo
                  </label>
                  <input
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl border border-border bg-secondary px-4 py-2.5 text-foreground placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              {formError && (
                <p className="text-sm text-destructive">{formError}</p>
              )}
              <div className="flex gap-3">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {editingTeam ? 'Enregistrer' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teams Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
          Erreur: {error}
        </div>
      ) : teams.length === 0 ? (
        <Card className="border-0 bg-card">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground">Aucune équipe</p>
            <p className="mb-4 text-sm text-muted-foreground">Commencez par créer votre première équipe</p>
            <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Créer une équipe
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => (
            <Card
              key={team.id}
              className="group border-0 bg-card transition-all duration-300 hover:bg-secondary hover:ring-1 hover:ring-primary/50"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
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
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-secondary text-muted-foreground">
                          Local
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(team)}
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(team)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <UserCircle className="h-4 w-4" />
                  <span>Cliquez pour voir les joueurs</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageLayout>
  );
}
