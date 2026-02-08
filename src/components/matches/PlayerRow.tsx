'use client';

import { PlayerWithStats } from '@/types';
import { Button } from '@/components/ui/button';
import { MatchData } from '@/app/matches/[id]/live/page'; // We might need to extract MatchData type too or import it if exported
// Actually MatchData is defined in page.tsx locally. I should export it or redefine it. 
// It extends MatchWithTeams. Let's start with just using MatchWithTeams for now or Any.
// Better: extract MatchData to types or just redefine locally if small.
// Let's check `page.tsx` again. `MatchData` has `player_stats` and `has_access_code`.
// I will move MatchData to types/index.ts or just a new file types/match.ts?
// For now, I'll rely on props passing primitive or well known types.

interface PlayerRowProps {
    player: PlayerWithStats;
    isHome: boolean;
    matchStatus: string;
    onClick: (playerId: string) => void;
}

export function PlayerRow({ player, isHome, matchStatus, onClick }: PlayerRowProps) {
    return (
        <div
            onClick={() => onClick(player.id)}
            className={`flex items-center gap-4 p-3 border-b border-border/50 cursor-pointer transition-all active:scale-[0.99] ${isHome ? 'hover:bg-blue-50/50' : 'hover:bg-red-50/50'}`}
        >
            {/* 1. Identité Joueur (Photo + Nom + Note) */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative h-16 w-16 flex-shrink-0">
                    {player.photo_url ? (
                        <img src={player.photo_url} alt="" className="h-full w-full rounded-full object-cover ring-2 ring-background shadow-sm" />
                    ) : (
                        <div className={`flex h-full w-full items-center justify-center rounded-full font-bold text-white shadow-sm ${isHome ? 'bg-blue-600' : 'bg-red-600'}`}>
                            {player.jersey_number ?? '#'}
                        </div>
                    )}
                    {/* Validation Status Indicator */}
                    {matchStatus === 'in_progress' && (
                        <div className={`absolute -top-1 -left-1 h-3 w-3 rounded-full border border-white ${player.stats?.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} title={player.stats?.status === 'ACCEPTED' ? 'Joueur Validé' : 'En attente de validation'} />
                    )}
                    {/* Note Globale (Badge) */}
                    {player.stats?.rating !== undefined && (
                        <div className={`absolute -bottom-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full text-[10px] font-bold border-2 border-background text-white shadow-sm ${player.stats.rating >= 15 ? 'bg-green-500' : player.stats.rating >= 10 ? 'bg-blue-500' : 'bg-orange-500'
                            }`}>
                            {player.stats.rating}
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="font-bold text-sm truncate">{player.first_name} <span className="uppercase">{player.last_name}</span></p>
                        {player.jersey_number !== undefined && <span className="text-xs font-mono text-muted-foreground">#{player.jersey_number}</span>}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="font-medium text-foreground">{player.stats?.points || 0} PTS</span>
                        <span>•</span>
                        <span>{(player.stats?.offensive_rebounds || 0) + (player.stats?.defensive_rebounds || 0)} REB</span>
                        <span>•</span>
                        <span>{player.stats?.assists || 0} PD</span>
                        <span>•</span>
                        <span>{player.stats?.turnovers || 0} TO</span>
                        <span className={`ml-auto font-mono ${(player.stats?.personal_fouls || 0) >= 5 ? 'text-red-600 font-bold' : ''}`}>
                            {player.stats?.personal_fouls || 0} FTE
                        </span>
                    </div>
                </div>
            </div>
            <div className="text-muted-foreground">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <span className="sr-only">Saisir</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right opacity-50"><path d="m9 18 6-6-6-6" /></svg>
                </Button>
            </div>
        </div>
    );
}
