'use client';

import { PlayerWithStats } from '@/types';

interface PlayerCardProps {
    player: PlayerWithStats;
    isHome: boolean;
    matchStatus: string;
    onClick: (playerId: string) => void;
}

export function PlayerCard({ player, isHome, matchStatus, onClick }: PlayerCardProps) {
    const fouls = player.stats?.personal_fouls || 0;
    const isFouledOut = fouls >= 5;

    return (
        <div
            onClick={() => onClick(player.id)}
            className={`
                relative flex flex-col items-center p-3 rounded-xl border-2 transition-all cursor-pointer shadow-sm
                ${isHome
                    ? 'bg-blue-50/30 border-blue-100 hover:border-blue-300 hover:shadow-md'
                    : 'bg-red-50/30 border-red-100 hover:border-red-300 hover:shadow-md'
                }
                ${isFouledOut ? 'opacity-60 grayscale' : ''}
                active:scale-[0.98]
            `}
        >
            {/* Avatar Circle */}
            <div className="relative h-24 w-24 mb-2">
                {player.photo_url ? (
                    <img
                        src={player.photo_url}
                        alt={`${player.first_name} ${player.last_name}`}
                        className={`h-full w-full rounded-full object-cover ring-4 ${isHome ? 'ring-blue-100' : 'ring-red-100'} shadow-md`}
                    />
                ) : (
                    <div className={`flex h-full w-full items-center justify-center rounded-full font-bold text-3xl text-white shadow-md ${isHome ? 'bg-blue-600' : 'bg-red-600'}`}>
                        {player.jersey_number ?? '#'}
                    </div>
                )}

                {/* Validation Status Indicator */}
                {matchStatus === 'in_progress' && (
                    <div className={`absolute top-0 right-0 h-4 w-4 rounded-full border-2 border-white ${player.stats?.status === 'ACCEPTED' ? 'bg-green-500' : 'bg-yellow-400'}`} />
                )}

                {/* Jersey Number Badge */}
                {player.jersey_number !== undefined && (
                    <div className="absolute -bottom-1 -right-1 bg-black text-white text-xs font-bold px-1.5 py-0.5 rounded shadow-sm border border-white">
                        #{player.jersey_number}
                    </div>
                )}
            </div>

            {/* Name & Stats */}
            <div className="text-center w-full">
                <h3 className="font-bold text-sm truncate leading-tight mb-1">
                    {player.first_name} <span className="uppercase block text-xs font-black">{player.last_name}</span>
                </h3>

                <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="flex flex-col items-center bg-background rounded px-2 py-0.5 border shadow-sm w-12">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">PTS</span>
                        <span className="font-black text-lg leading-none">{player.stats?.points || 0}</span>
                    </div>
                    <div className={`flex flex-col items-center bg-background rounded px-2 py-0.5 border shadow-sm w-12 ${isFouledOut ? 'border-red-500 bg-red-50' : ''}`}>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">FTE</span>
                        <span className={`font-black text-lg leading-none ${isFouledOut ? 'text-red-600' : ''}`}>
                            {fouls}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
