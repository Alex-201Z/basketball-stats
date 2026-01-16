'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowRight, Play } from 'lucide-react';
import type { MatchWithTeams, MatchStatus } from '@/types';

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string }> = {
  scheduled: {
    label: 'Programmé',
    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  },
  in_progress: {
    label: 'En cours',
    className: 'bg-green-500/20 text-green-400 border-green-500/30 animate-pulse',
  },
  completed: {
    label: 'Terminé',
    className: 'bg-muted text-muted-foreground border-border',
  },
};

interface RecentMatchesProps {
  matches: MatchWithTeams[];
  loading?: boolean;
}

export function RecentMatches({ matches, loading }: RecentMatchesProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Card className="border-0 bg-card">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Matchs récents
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 bg-card">
      <CardHeader className="border-b border-border">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Matchs récents
          </CardTitle>
          <Link href="/matches">
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {matches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-muted-foreground">Aucun match récent</p>
            <Link href="/matches" className="mt-4">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Créer un match</Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {matches.slice(0, 5).map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 transition-colors hover:bg-secondary"
              >
                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-center">
                    <p className="text-xs font-medium text-muted-foreground">
                      {formatDate(match.match_date)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(match.match_date)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right min-w-[100px]">
                      <p className="font-semibold text-foreground truncate">
                        {match.home_team?.name || 'TBD'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-1.5 ring-1 ring-border">
                      <span className="text-lg font-bold text-foreground">{match.home_score}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="text-lg font-bold text-foreground">{match.away_score}</span>
                    </div>
                    <div className="text-left min-w-[100px]">
                      <p className="font-semibold text-foreground truncate">
                        {match.away_team?.name || 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={STATUS_CONFIG[match.status].className}
                  >
                    {STATUS_CONFIG[match.status].label}
                  </Badge>
                  {(match.status === 'scheduled' || match.status === 'in_progress') && (
                    <Link href={`/matches/${match.id}/live`}>
                      <Button size="sm" variant="ghost" className="text-green-500 hover:bg-green-500/10">
                        <Play className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
