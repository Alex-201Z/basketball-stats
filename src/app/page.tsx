'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Sidebar, MobileMenuButton } from '@/components/Sidebar';
import { DashboardStats } from '@/components/DashboardStats';
import { RecentMatches } from '@/components/RecentMatches';
import { TopPlayersCard } from '@/components/TopPlayersCard';
import { RankingTable } from '@/components/RankingTable';
import { StatsChart } from '@/components/StatsChart';
import { useRankings } from '@/hooks/useRankings';
import { useMatches } from '@/hooks/useMatches';
import { useRealtimeRefresh } from '@/hooks/useRealtime';
import type { RankingCategory } from '@/types';
import {
  Trophy,
  FileDown,
  RefreshCw,
  TrendingUp,
  Target,
  Zap,
  Shield,
  Hand,
  BarChart3,
  Bell,
  Menu,
} from 'lucide-react';

const CATEGORY_CONFIG = {
  points: { label: 'Points', icon: Target, color: 'text-primary' },
  rebounds: { label: 'Rebonds', icon: TrendingUp, color: 'text-blue-500' },
  assists: { label: 'Passes', icon: Zap, color: 'text-green-500' },
  steals: { label: 'Intercept.', icon: Hand, color: 'text-purple-500' },
  blocks: { label: 'Contres', icon: Shield, color: 'text-red-500' },
  global: { label: 'Global', icon: BarChart3, color: 'text-foreground' },
};

export default function Dashboard() {
  const [category, setCategory] = useState<RankingCategory>('points');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalTeams: 0,
    totalMatches: 0,
    matchesInProgress: 0,
  });

  const { rankings, loading, error, refetch } = useRankings({
    category,
    league: 'local',
    limit: 10,
  });

  const { matches, loading: matchesLoading } = useMatches({ league: 'local' });

  // Récupérer les stats globales
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsRes, playersRes] = await Promise.all([
          fetch('/api/teams'),
          fetch('/api/players'),
        ]);
        const teamsData = await teamsRes.json();
        const playersData = await playersRes.json();

        const inProgressMatches = matches.filter(m => m.status === 'in_progress').length;
        const completedMatches = matches.filter(m => m.status === 'completed').length;

        setStats({
          totalPlayers: playersData.data?.length || 0,
          totalTeams: teamsData.data?.length || 0,
          totalMatches: completedMatches,
          matchesInProgress: inProgressMatches,
        });
      } catch (err) {
        console.error('Erreur stats:', err);
      }
    };
    fetchStats();
  }, [matches]);

  useRealtimeRefresh('player_stats', refetch);

  const handleExportPDF = async () => {
    try {
      const response = await fetch('/api/reports?format=pdf');
      const result = await response.json();

      if (result.success) {
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

  const topScorer = rankings[0]
    ? { name: `${rankings[0].first_name} ${rankings[0].last_name}`, points: rankings[0].avg_points || 0 }
    : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Top Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3">
              <MobileMenuButton onClick={() => setSidebarOpen(true)} />
              <div>
                <h1 className="text-lg lg:text-xl font-bold text-foreground">Dashboard</h1>
                <p className="text-xs lg:text-sm text-muted-foreground hidden sm:block">Vue d&apos;ensemble des statistiques</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <Button
                size="sm"
                onClick={handleExportPDF}
                className="bg-primary hover:bg-primary/90 text-xs lg:text-sm"
              >
                <FileDown className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Rapport PDF</span>
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 lg:p-6 space-y-4 lg:space-y-6">
          {/* Stats Cards */}
          <DashboardStats
            totalPlayers={stats.totalPlayers}
            totalTeams={stats.totalTeams}
            totalMatches={stats.totalMatches}
            matchesInProgress={stats.matchesInProgress}
            topScorer={topScorer}
          />

          {/* Grid: Recent Matches & Top Players */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentMatches matches={matches} loading={matchesLoading} />
            </div>
            <div className="space-y-6">
              <TopPlayersCard
                rankings={rankings}
                title="Top Scoreurs"
                statKey="avg_points"
                statLabel="PTS/M"
                loading={loading}
              />
            </div>
          </div>

          {/* Rankings Section */}
          <Card className="border-0 bg-card">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Trophy className="h-5 w-5 text-primary" />
                  Classements
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs
                value={category}
                onValueChange={(v) => setCategory(v as RankingCategory)}
              >
                <TabsList className="mb-4 lg:mb-6 grid w-full grid-cols-3 lg:grid-cols-6 gap-1 lg:gap-2 bg-secondary p-1 rounded-xl">
                  {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <TabsTrigger
                        key={key}
                        value={key}
                        className="flex items-center justify-center gap-1 lg:gap-1.5 py-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-lg text-muted-foreground data-[state=active]:text-foreground text-xs lg:text-sm"
                      >
                        <Icon className={`h-3.5 w-3.5 lg:h-4 lg:w-4 ${category === key ? config.color : 'text-muted-foreground'}`} />
                        <span className="hidden sm:inline">{config.label}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {Object.keys(CATEGORY_CONFIG).map((cat) => (
                  <TabsContent key={cat} value={cat} className="space-y-6">
                    {/* Chart */}
                    <div className="rounded-xl border border-border bg-secondary/50 p-6">
                      <StatsChart
                        rankings={rankings}
                        category={cat as RankingCategory}
                        title={`Top 10 - ${CATEGORY_CONFIG[cat as RankingCategory].label}`}
                      />
                    </div>

                    {/* Table */}
                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="flex items-center gap-3">
                          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                          <span className="text-muted-foreground">Chargement...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="rounded-xl bg-destructive/10 p-6 text-center text-destructive">
                        Erreur: {error}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-border overflow-hidden">
                        <RankingTable
                          rankings={rankings}
                          category={cat as RankingCategory}
                        />
                      </div>
                    )}
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>Basketball Stats Manager © 2026</p>
            <p className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Temps réel actif
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
