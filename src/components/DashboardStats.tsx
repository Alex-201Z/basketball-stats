'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Zap,
  Award,
  Activity,
} from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: 'orange' | 'blue' | 'green' | 'purple' | 'pink';
}

const colorClasses = {
  orange: {
    bg: 'bg-primary/10',
    icon: 'text-primary',
    gradient: 'from-primary to-primary/80',
  },
  blue: {
    bg: 'bg-blue-500/10',
    icon: 'text-blue-500',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-emerald-500/10',
    icon: 'text-emerald-500',
    gradient: 'from-emerald-500 to-emerald-600',
  },
  purple: {
    bg: 'bg-purple-500/10',
    icon: 'text-purple-500',
    gradient: 'from-purple-500 to-purple-600',
  },
  pink: {
    bg: 'bg-pink-500/10',
    icon: 'text-pink-500',
    gradient: 'from-pink-500 to-pink-600',
  },
};

function StatsCard({ title, value, subtitle, icon, trend, color }: StatsCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className="relative overflow-hidden border-0 bg-card transition-all duration-300 hover:bg-secondary">
      <div className={`absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-gradient-to-br ${colors.gradient} opacity-10`} />
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                {trend.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-emerald-500' : 'text-red-500'
                  }`}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">vs semaine dernière</span>
              </div>
            )}
          </div>
          <div className={`rounded-xl ${colors.bg} p-3`}>
            <div className={colors.icon}>{icon}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DashboardStatsProps {
  totalPlayers: number;
  totalTeams: number;
  totalMatches: number;
  matchesInProgress: number;
  topScorer?: {
    name: string;
    points: number;
  };
}

export function DashboardStats({
  totalPlayers,
  totalTeams,
  totalMatches,
  matchesInProgress,
  topScorer,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Joueurs actifs"
        value={totalPlayers}
        subtitle={`${totalTeams} équipes`}
        icon={<Users className="h-6 w-6" />}
        color="orange"
      />
      <StatsCard
        title="Matchs joués"
        value={totalMatches}
        subtitle={matchesInProgress > 0 ? `${matchesInProgress} en cours` : 'Cette saison'}
        icon={<Activity className="h-6 w-6" />}
        color="blue"
      />
      <StatsCard
        title="Top Scorer"
        value={topScorer?.name || '-'}
        subtitle={topScorer ? `${topScorer.points} PTS/M` : 'Aucune donnée'}
        icon={<Award className="h-6 w-6" />}
        color="purple"
      />
      <StatsCard
        title="Statistiques"
        value="Live"
        subtitle="Mise à jour en temps réel"
        icon={<Zap className="h-6 w-6" />}
        color="green"
      />
    </div>
  );
}
