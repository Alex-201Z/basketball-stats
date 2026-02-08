'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlayerWithStats } from '@/types';
import { MatchWithTeams } from '@/types'; // Assuming this is exported from types/index.ts

interface StatsEntryOverlayProps {
    selectedPlayer: PlayerWithStats | null;
    match: MatchWithTeams | null;
    onClose: () => void;
    onStatAction: (playerId: string, actionType: string) => void;
}

export function StatsEntryOverlay({ selectedPlayer, match, onClose, onStatAction }: StatsEntryOverlayProps) {
    if (!selectedPlayer) return null;
    const s = selectedPlayer.stats;

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-sm animate-in slide-in-from-bottom-10 fade-in duration-200">
            {/* Header Overlay */}
            <div className="flex flex-col items-center justify-center p-4 border-b bg-card shadow-sm gap-3">
                <div className="relative h-24 w-24">
                    {selectedPlayer.photo_url ? (
                        <img src={selectedPlayer.photo_url} alt="" className="h-full w-full rounded-full object-cover ring-4 ring-background shadow-md" />
                    ) : (
                        <div className={`flex h-full w-full items-center justify-center rounded-full font-bold text-2xl text-white shadow-md ${selectedPlayer.team_id === match?.home_team_id ? 'bg-blue-600' : 'bg-red-600'}`}>
                            {selectedPlayer.jersey_number ?? '#'}
                        </div>
                    )}
                </div>
                <div className="absolute top-4 left-4">
                    <Button variant="ghost" onClick={onClose}>
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                </div>
                <div className="text-center">
                    <h2 className="text-lg font-bold">{selectedPlayer.first_name} {selectedPlayer.last_name}</h2>
                    <p className="text-xs text-muted-foreground">#{selectedPlayer.jersey_number} • {match?.home_team_id === selectedPlayer.team_id ? match?.home_team?.name : match?.away_team?.name}</p>
                </div>

            </div>

            {/* Contenu Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-secondary/10">

                {/* TIRS & SCORING */}
                <div className="space-y-3">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Tirs & Points</p>

                    {/* 2 Points */}
                    <div className="flex items-center justify-between bg-card p-2 rounded-xl border shadow-sm h-16">
                        <span className="font-bold w-20 pl-2">2 PTS</span>
                        <div className="flex flex-col items-center justify-center flex-1 gap-1">
                            <span className="text-sm font-mono text-muted-foreground">
                                {s?.field_goals_made || 0} / {s?.field_goals_attempted || 0}
                            </span>
                            <span className={`text-[10px] font-bold ${(s?.field_goals_attempted || 0) > 0 ? ((s?.field_goals_made || 0) / (s?.field_goals_attempted || 0)) >= 0.5 ? 'text-green-600' : 'text-orange-500' : 'text-muted-foreground'}`}>
                                {((s?.field_goals_attempted || 0) > 0 ? Math.round(((s?.field_goals_made || 0) / (s?.field_goals_attempted || 0)) * 100) : 0)}%
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => onStatAction(selectedPlayer.id, '2miss')}
                                className="h-12 w-16 bg-red-100/50 text-red-600 hover:bg-red-200 border-red-200 font-bold" variant="outline">
                                LOUPÉ
                            </Button>
                            <Button
                                onClick={() => onStatAction(selectedPlayer.id, '2pm')}
                                className="h-12 w-16 bg-green-100/50 text-green-700 hover:bg-green-200 border-green-200 font-bold" variant="outline">
                                +2
                            </Button>
                        </div>
                    </div>

                    {/* 3 Points */}
                    <div className="flex items-center justify-between bg-card p-2 rounded-xl border shadow-sm h-16">
                        <span className="font-bold w-20 pl-2">3 PTS</span>
                        <div className="flex flex-col items-center justify-center flex-1 gap-1">
                            <span className="text-sm font-mono text-muted-foreground">
                                {s?.three_pointers_made || 0} / {s?.three_pointers_attempted || 0}
                            </span>
                            <span className={`text-[10px] font-bold ${(s?.three_pointers_attempted || 0) > 0 ? ((s?.three_pointers_made || 0) / (s?.three_pointers_attempted || 0)) >= 0.4 ? 'text-green-600' : 'text-orange-500' : 'text-muted-foreground'}`}>
                                {((s?.three_pointers_attempted || 0) > 0 ? Math.round(((s?.three_pointers_made || 0) / (s?.three_pointers_attempted || 0)) * 100) : 0)}%
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => onStatAction(selectedPlayer.id, '3miss')}
                                className="h-12 w-16 bg-red-100/50 text-red-600 hover:bg-red-200 border-red-200 font-bold" variant="outline">
                                LOUPÉ
                            </Button>
                            <Button
                                onClick={() => onStatAction(selectedPlayer.id, '3pm')}
                                className="h-12 w-16 bg-green-100/50 text-green-700 hover:bg-green-200 border-green-200 font-bold" variant="outline">
                                +3
                            </Button>
                        </div>
                    </div>

                    {/* Lancers Francs */}
                    <div className="flex items-center justify-between bg-card p-2 rounded-xl border shadow-sm h-16">
                        <span className="font-bold w-20 pl-2">L.F.</span>
                        <div className="flex flex-col items-center justify-center flex-1 gap-1">
                            <span className="text-sm font-mono text-muted-foreground">
                                {s?.free_throws_made || 0} / {s?.free_throws_attempted || 0}
                            </span>
                            <span className={`text-[10px] font-bold ${(s?.free_throws_attempted || 0) > 0 ? ((s?.free_throws_made || 0) / (s?.free_throws_attempted || 0)) >= 0.7 ? 'text-green-600' : 'text-orange-500' : 'text-muted-foreground'}`}>
                                {((s?.free_throws_attempted || 0) > 0 ? Math.round(((s?.free_throws_made || 0) / (s?.free_throws_attempted || 0)) * 100) : 0)}%
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                onClick={() => onStatAction(selectedPlayer.id, 'ftmiss')}
                                className="h-12 w-16 bg-red-100/50 text-red-600 hover:bg-red-200 border-red-200 font-bold" variant="outline">
                                LOUPÉ
                            </Button>
                            <Button
                                onClick={() => onStatAction(selectedPlayer.id, 'ftm')}
                                className="h-12 w-16 bg-green-100/50 text-green-700 hover:bg-green-200 border-green-200 font-bold" variant="outline">
                                +1
                            </Button>
                        </div>
                    </div>
                </div>

                {/* AUTRES STATS */}
                <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">Jeu</p>
                    {[
                        {
                            label: 'Rebonds', val: (s?.offensive_rebounds || 0) + (s?.defensive_rebounds || 0), actions: [
                                { code: 'oreb', txt: '+ OFF', col: 'bg-blue-50 text-blue-700' },
                                { code: 'dreb', txt: '+ DEF', col: 'bg-indigo-50 text-indigo-700' }
                            ]
                        },
                        { label: 'Passes', val: s?.assists || 0, actions: [{ code: 'ast', txt: '+', col: 'bg-secondary' }] },
                        { label: 'Interc.', val: s?.steals || 0, actions: [{ code: 'stl', txt: '+', col: 'bg-secondary' }] },
                        { label: 'Contres', val: s?.blocks || 0, actions: [{ code: 'blk', txt: '+', col: 'bg-secondary' }] },
                        { label: 'Fautes', val: s?.personal_fouls || 0, actions: [{ code: 'pf', txt: '+ FAUTE', col: 'bg-red-50 text-red-700 border-red-200' }] },
                        { label: 'Balles P.', val: s?.turnovers || 0, actions: [{ code: 'to', txt: '+ PERTE', col: 'bg-orange-50 text-orange-700 border-orange-200' }] },
                        { label: 'Minutes', val: Number(s?.minutes_played || 0), actions: [{ code: 'min+', txt: '+1', col: 'bg-secondary' }] }
                    ].map((row, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-card p-1 rounded-xl border shadow-sm h-14 pr-2">
                            <span className="font-bold w-24 pl-3 text-sm">{row.label}</span>
                            <div className="flex-1 text-center">
                                <span className="text-xl font-bold">{row.val}</span>
                            </div>
                            <div className="flex gap-2">
                                {row.actions.map(act => (
                                    <Button
                                        key={act.code}
                                        onClick={() => onStatAction(selectedPlayer.id, act.code)}
                                        className={`h-10 min-w-[3rem] font-bold border ${act.col}`} variant="outline">
                                        {act.txt}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* Footer Overlay */}
            <div className="p-4 border-t bg-card grid grid-cols-2 gap-4">
                {s?.status !== 'ACCEPTED' ? (
                    <Button className="h-12 font-bold uppercase w-full bg-yellow-500 hover:bg-yellow-600 text-black col-span-2"
                        onClick={() => {
                            // const newStatus = 'ACCEPTED'; // unused
                            onStatAction(selectedPlayer.id, 'validate');
                        }}
                    >
                        Valider la présence
                    </Button>
                ) : (
                    <>
                        <Button variant="destructive" className="h-12 font-bold uppercase w-full">Absent</Button>
                        <Button className="h-12 font-bold uppercase w-full bg-blue-600 hover:bg-blue-700" onClick={onClose}>Fermer</Button>
                    </>
                )}
            </div>
        </div>
    );
}
