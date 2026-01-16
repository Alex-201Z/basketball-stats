'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import type { PlayerRanking } from '@/types';

interface TopPlayersCardProps {
  rankings: PlayerRanking[];
  title: string;
  statKey: 'avg_points' | 'avg_rebounds' | 'avg_assists' | 'avg_steals' | 'avg_blocks';
  statLabel: string;
  loading?: boolean;
}

const RANK_ICONS = [
  { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-500/10' },
  { icon: Award, color: 'text-orange-400', bg: 'bg-orange-500/10' },
];

export function TopPlayersCard({
  rankings,
  title,
  statKey,
  statLabel,
  loading,
}: TopPlayersCardProps) {
  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-8 w-8 rounded-full bg-secondary" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 w-24 rounded bg-secondary" />
                  <div className="h-3 w-16 rounded bg-secondary" />
                </div>
                <div className="h-6 w-12 rounded bg-secondary" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const topPlayers = rankings.slice(0, 3);

  return (
    <Card className="border-0 bg-card transition-all hover:bg-secondary/50">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {topPlayers.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-sm">
            Aucune donnée disponible
          </div>
        ) : (
          <div className="space-y-3">
            {topPlayers.map((player, index) => {
              const RankIcon = RANK_ICONS[index]?.icon || Award;
              const rankColor = RANK_ICONS[index]?.color || 'text-muted-foreground';
              const rankBg = RANK_ICONS[index]?.bg || 'bg-secondary';
              const statValue = player[statKey];

              return (
                <div
                  key={player.id}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-secondary"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${rankBg}`}>
                    <RankIcon className={`h-4 w-4 ${rankColor}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">
                      {player.first_name} {player.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {player.team_name || 'Sans équipe'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">
                      {typeof statValue === 'number' ? statValue.toFixed(1) : '0.0'}
                    </p>
                    <p className="text-xs text-muted-foreground">{statLabel}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
