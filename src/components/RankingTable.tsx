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
import type { PlayerRanking, RankingCategory } from '@/types';

interface RankingTableProps {
  rankings: PlayerRanking[];
  category: RankingCategory;
  showRank?: boolean;
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

  const getLeagueBadge = (league: string) => {
    if (league === 'nba') {
      return <Badge variant="default" className="bg-orange-500">NBA</Badge>;
    }
    return <Badge variant="secondary">Local</Badge>;
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {showRank && <TableHead className="w-12">#</TableHead>}
          <TableHead>Joueur</TableHead>
          <TableHead>Équipe</TableHead>
          <TableHead>Ligue</TableHead>
          <TableHead className="text-right">Matchs</TableHead>
          <TableHead className="text-right">{getCategoryLabel()}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rankings.map((player, index) => (
          <TableRow key={player.id}>
            {showRank && (
              <TableCell className="font-bold">
                {index + 1}
              </TableCell>
            )}
            <TableCell>
              <div className="flex items-center gap-2">
                {player.jersey_number && (
                  <span className="text-muted-foreground">#{player.jersey_number}</span>
                )}
                <span className="font-medium">
                  {player.first_name} {player.last_name}
                </span>
                {player.position && (
                  <Badge variant="outline" className="text-xs">
                    {player.position}
                  </Badge>
                )}
              </div>
            </TableCell>
            <TableCell>{player.team_name}</TableCell>
            <TableCell>{getLeagueBadge(player.league)}</TableCell>
            <TableCell className="text-right">{player.games_played}</TableCell>
            <TableCell className="text-right font-bold text-lg">
              {getStatValue(player)}
            </TableCell>
          </TableRow>
        ))}
        {rankings.length === 0 && (
          <TableRow>
            <TableCell colSpan={showRank ? 6 : 5} className="text-center py-8 text-muted-foreground">
              Aucun joueur trouvé
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
