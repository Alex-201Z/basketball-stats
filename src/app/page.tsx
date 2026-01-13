'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RankingTable } from '@/components/RankingTable';
import { StatsChart } from '@/components/StatsChart';
import { LeagueSelector } from '@/components/LeagueSelector';
import { useRankings } from '@/hooks/useRankings';
import { useRealtimeRefresh } from '@/hooks/useRealtime';
import type { RankingCategory, LeagueType } from '@/types';
import { Trophy, TrendingUp, Users, FileDown, RefreshCw, Calendar, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [league, setLeague] = useState<LeagueType>('all');
  const [category, setCategory] = useState<RankingCategory>('points');

  // Hook pour les classements avec rafraîchissement temps réel
  const { rankings, loading, error, refetch } = useRankings({
    category,
    league,
    limit: 10,
  });

  // Activer le temps réel
  useRealtimeRefresh('player_stats', refetch);

  const handleSync = async () => {
    try {
      await fetch('/api/nba', { method: 'POST' });
      refetch();
    } catch (err) {
      console.error('Erreur sync:', err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/reports?format=pdf');
      const result = await response.json();

      if (result.success) {
        // Import dynamique pour éviter les erreurs SSR
        const { generateWeeklyReport } = await import('@/lib/pdf-generator');
        generateWeeklyReport(result.data);
      } else {
        alert('Erreur lors de la génération du rapport');
      }
    } catch (err) {
      console.error('Erreur PDF:', err);
      alert('Erreur lors de la génération du rapport');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-orange-500" />
              <h1 className="text-2xl font-bold">Basketball Stats</h1>
            </div>
            <div className="flex items-center gap-4">
              <LeagueSelector value={league} onChange={setLeague} />
              <Button variant="outline" size="sm" onClick={handleSync}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync NBA
              </Button>
              <Button variant="default" size="sm" onClick={handleExportPDF}>
                <FileDown className="h-4 w-4 mr-2" />
                Rapport PDF
              </Button>
            </div>
          </div>
          {/* Navigation */}
          <nav className="flex gap-4 mt-4 pt-4 border-t">
            <Link href="/teams" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Users className="h-4 w-4" />
              Équipes
            </Link>
            <Link href="/players" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <UserCircle className="h-4 w-4" />
              Joueurs
            </Link>
            <Link href="/matches" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <Calendar className="h-4 w-4" />
              Matchs
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Joueurs classés</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rankings.length}</div>
              <p className="text-xs text-muted-foreground">
                {league === 'all' ? 'Toutes ligues' : league.toUpperCase()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Meilleur scoreur</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {rankings[0]
                  ? `${rankings[0].first_name} ${rankings[0].last_name}`
                  : '-'}
              </div>
              <p className="text-xs text-muted-foreground">
                {rankings[0]?.avg_points?.toFixed(1) || '0'} PTS/M
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Catégorie</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{category}</div>
              <p className="text-xs text-muted-foreground">Classement actuel</p>
            </CardContent>
          </Card>
        </div>

        {/* Rankings Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Classements</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs
              value={category}
              onValueChange={(v) => setCategory(v as RankingCategory)}
            >
              <TabsList className="grid w-full grid-cols-6 mb-6">
                <TabsTrigger value="points">Points</TabsTrigger>
                <TabsTrigger value="rebounds">Rebonds</TabsTrigger>
                <TabsTrigger value="assists">Passes</TabsTrigger>
                <TabsTrigger value="steals">Intercept.</TabsTrigger>
                <TabsTrigger value="blocks">Contres</TabsTrigger>
                <TabsTrigger value="global">Global</TabsTrigger>
              </TabsList>

              {['points', 'rebounds', 'assists', 'steals', 'blocks', 'global'].map(
                (cat) => (
                  <TabsContent key={cat} value={cat} className="space-y-6">
                    {/* Chart */}
                    <div className="border rounded-lg p-4">
                      <StatsChart
                        rankings={rankings}
                        category={cat as RankingCategory}
                        title={`Top 10 - ${getCategoryTitle(cat as RankingCategory)}`}
                      />
                    </div>

                    {/* Table */}
                    {loading ? (
                      <div className="flex items-center justify-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">
                          Chargement...
                        </span>
                      </div>
                    ) : error ? (
                      <div className="text-center py-8 text-red-500">
                        Erreur: {error}
                      </div>
                    ) : (
                      <RankingTable
                        rankings={rankings}
                        category={cat as RankingCategory}
                      />
                    )}
                  </TabsContent>
                )
              )}
            </Tabs>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t mt-8">
        <div className="container mx-auto px-4 py-4 text-center text-sm text-muted-foreground">
          Basketball Stats App - Classements en temps réel
        </div>
      </footer>
    </div>
  );
}

function getCategoryTitle(category: RankingCategory): string {
  switch (category) {
    case 'points':
      return 'Points par match';
    case 'rebounds':
      return 'Rebonds par match';
    case 'assists':
      return 'Passes décisives par match';
    case 'steals':
      return 'Interceptions par match';
    case 'blocks':
      return 'Contres par match';
    case 'global':
      return 'Score global';
    default:
      return category;
  }
}
