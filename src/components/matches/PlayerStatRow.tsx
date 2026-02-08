// Utility for hiding scrollbar
const noScrollbarStyle = `
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
`;

import { PlayerWithStats } from '@/types';
import { Button } from '@/components/ui/button';
import { User, Plus, Minus } from 'lucide-react';

interface PlayerStatRowProps {
    player: PlayerWithStats;
    isHome: boolean;
    onStatAction: (playerId: string, actionType: string) => void;
}

export function PlayerStatRow({ player, isHome, onStatAction }: PlayerStatRowProps) {
    const fouls = player.stats?.personal_fouls || 0;
    const isFouledOut = fouls >= 5;

    return (
        <>
            <style jsx global>{noScrollbarStyle}</style>
            <div className={`
            flex items-center gap-2 p-2 rounded-lg border shadow-sm mb-2 overflow-hidden
            ${isHome ? 'bg-blue-50/20 border-blue-100' : 'bg-red-50/20 border-red-100'}
            ${isFouledOut ? 'opacity-60 grayscale' : ''}
        `}>
                {/* 1. Avatar & Info (Fixed Left) */}
                <div className="flex items-center gap-2 min-w-[140px] w-[140px] flex-shrink-0">
                    <div className="relative h-12 w-12 flex-shrink-0">
                        {player.photo_url ? (
                            <img
                                src={player.photo_url}
                                alt=""
                                className={`h-full w-full rounded-full object-cover ring-2 ${isHome ? 'ring-blue-100' : 'ring-red-100'}`}
                            />
                        ) : (
                            <div className={`flex h-full w-full items-center justify-center rounded-full font-bold text-white text-sm ${isHome ? 'bg-blue-600' : 'bg-red-600'}`}>
                                {player.jersey_number ?? '#'}
                            </div>
                        )}
                        {/* Fouls Indicator (Dot) */}
                        {fouls > 0 && (
                            <div className={`absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold border border-white text-white ${fouls >= 5 ? 'bg-red-600' : fouls >= 3 ? 'bg-orange-500' : 'bg-yellow-500'}`}>
                                {fouls}
                            </div>
                        )}
                    </div>
                    <div className="overflow-hidden">
                        <div className="font-bold text-sm truncate">{player.first_name.charAt(0)}. {player.last_name}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                            {player.stats?.points || 0} PTS • #{player.jersey_number}
                        </div>
                    </div>
                </div>

                {/* 2. Scrollable Actions Area */}
                <div className="flex-1 overflow-x-auto pb-1 no-scrollbar flex items-center gap-2 pr-2">

                    {/* Scoring Group */}
                    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
                        <div className="flex flex-col gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] border-green-200 text-green-700 bg-green-50 hover:bg-green-100" onClick={() => onStatAction(player.id, '2pm')}>+2</Button>
                            <Button size="sm" variant="ghost" className="h-6 px-1 text-[8px] text-red-400 hover:text-red-600" onClick={() => onStatAction(player.id, '2miss')}>Miss</Button>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] border-green-200 text-green-700 bg-green-50 hover:bg-green-100" onClick={() => onStatAction(player.id, '3pm')}>+3</Button>
                            <Button size="sm" variant="ghost" className="h-6 px-1 text-[8px] text-red-400 hover:text-red-600" onClick={() => onStatAction(player.id, '3miss')}>Miss</Button>
                        </div>
                        <div className="flex flex-col gap-1">
                            <Button size="sm" variant="outline" className="h-7 px-2 text-[10px] border-green-200 text-green-700 bg-green-50 hover:bg-green-100" onClick={() => onStatAction(player.id, 'ftm')}>+1</Button>
                            <Button size="sm" variant="ghost" className="h-6 px-1 text-[8px] text-red-400 hover:text-red-600" onClick={() => onStatAction(player.id, 'ftmiss')}>Miss</Button>
                        </div>
                    </div>

                    {/* Rebounds Group */}
                    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
                        <Button size="sm" variant="outline" className="h-14 w-10 flex-col gap-0 p-0 hover:bg-blue-50 hover:text-blue-600" onClick={() => onStatAction(player.id, 'dreb')}>
                            <span className="text-[10px] font-bold">DEF</span>
                            <span className="text-[8px] uppercase">Reb</span>
                        </Button>
                        <Button size="sm" variant="outline" className="h-14 w-10 flex-col gap-0 p-0 hover:bg-indigo-50 hover:text-indigo-600" onClick={() => onStatAction(player.id, 'oreb')}>
                            <span className="text-[10px] font-bold">OFF</span>
                            <span className="text-[8px] uppercase">Reb</span>
                        </Button>
                    </div>

                    {/* Playmaking & Defense */}
                    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
                        <Button size="sm" variant="outline" className="h-14 w-10 flex-col gap-0 p-0" onClick={() => onStatAction(player.id, 'ast')}>
                            <span className="font-bold text-xs">AST</span>
                        </Button>
                        <Button size="sm" variant="outline" className="h-14 w-10 flex-col gap-0 p-0" onClick={() => onStatAction(player.id, 'stl')}>
                            <span className="font-bold text-xs">INT</span>
                        </Button>
                        <Button size="sm" variant="outline" className="h-14 w-10 flex-col gap-0 p-0" onClick={() => onStatAction(player.id, 'blk')}>
                            <span className="font-bold text-xs">CTR</span>
                        </Button>
                    </div>

                    {/* Negatives */}
                    <div className="flex items-center gap-1 bg-background/50 p-1 rounded-lg border border-border/50">
                        <Button size="sm" variant="outline" className="h-14 w-10 flex-col gap-0 p-0 border-red-200 text-red-700 hover:bg-red-50" onClick={() => onStatAction(player.id, 'pf')}>
                            <span className="font-bold text-xs">FTE</span>
                        </Button>
                        <Button size="sm" variant="outline" className="h-14 w-10 flex-col gap-0 p-0 border-orange-200 text-orange-700 hover:bg-orange-50" onClick={() => onStatAction(player.id, 'to')}>
                            <span className="font-bold text-xs">PER</span>
                        </Button>
                    </div>

                </div>
            </div>
        </>
    );
}
