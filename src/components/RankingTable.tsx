'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import type { PlayerRanking, RankingCategory } from '@/types';

interface RankingTableProps {
  rankings: PlayerRanking[];
  category: RankingCategory;
  showRank?: boolean;
}

import { Skeleton } from '@/components/ui/skeleton';

export function RankingTableSkeleton({ showRank = true }: { showRank?: boolean }) {
  return (
    <div className="w-full">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      </div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-4">
            {showRank && <Skeleton className="h-6 w-6 rounded-full" />}
            <div className="space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          </div>
          <Skeleton className="h-6 w-[40px]" />
        </div>
      ))}
    </div>
  );
}

export function RankingTable({ rankings, category, showRank = true }: RankingTableProps) {
  const getStatValue = (player: PlayerRanking) => {
    switch (category) {
      case 'points':
        return player.avg_points?.toFixed(1) || '0.0';
      case 'rebounds':
        return player.avg_rebounds?.toFixed(1) || '0.0';
      case 'assists':
        return player.avg_assists?.toFixed(1) || '0.0';
      case 'steals':
        return player.avg_steals?.toFixed(1) || '0.0';
      case 'blocks':
        return player.avg_blocks?.toFixed(1) || '0.0';
      case 'global':
        return player.global_score?.toFixed(1) || '0.0';
      default:
        return '0.0';
    }
  };

  const getCategoryLabel = () => {
    switch (category) {
      case 'points':
        return 'PTS/M';
      case 'rebounds':
        return 'REB/M';
      case 'assists':
        return 'AST/M';
      case 'steals':
        return 'STL/M';
      case 'blocks':
        return 'BLK/M';
      case 'global':
        return 'Score';
      default:
        return 'Stat';
    }
  };

  const getRankDisplay = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500/10" title="1er">
            <Trophy className="h-3.5 w-3.5 text-yellow-500" aria-label="1ère place" />
          </div>
        );
      case 1:
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-500/10" title="2ème">
            <Medal className="h-3.5 w-3.5 text-slate-400" aria-label="2ème place" />
          </div>
        );
      case 2:
        return (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/10" title="3ème">
            <Award className="h-3.5 w-3.5 text-orange-400" aria-label="3ème place" />
          </div>
        );
      default:
        return <span className="pl-1.5 font-bold text-primary">{index + 1}</span>;
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow className="border-border hover:bg-secondary/50">
          {showRank && <TableHead className="w-12 text-muted-foreground">#</TableHead>}
          <TableHead className="text-muted-foreground">Joueur</TableHead>
          <TableHead className="text-muted-foreground">Équipe</TableHead>
          <TableHead className="text-right text-muted-foreground">Matchs</TableHead>
          <TableHead className="text-right text-muted-foreground">{getCategoryLabel()}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankings.map((player, index) => (
          <TableRow key={player.id} className="border-border hover:bg-secondary/50">
            {showRank && (
              <TableCell>
                {getRankDisplay(index)}
              </TableCell>
            )}
            <TableCell>
              <div className="flex items-center gap-2">
                {player.jersey_number && (
                  <span className="text-muted-foreground">#{player.jersey_number}</span>
                )}
                <span className="font-medium text-foreground">
                  {player.first_name} {player.last_name}
                </span>
                {player.position && (
                  <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                    {player.position}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell className="text-foreground">{player.team_name}</TableCell>
            <TableCell className="text-right text-muted-foreground">{player.games_played}</TableCell>
            <TableCell className="text-right font-bold text-lg text-primary">
              {getStatValue(player)}
            </TableCell>
          </TableRow>
        ))}
        {rankings.length === 0 && (
          <TableRow>
            <TableCell colSpan={showRank ? 5 : 4} className="text-center py-8 text-muted-foreground">
              Aucun joueur trouvé
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
