
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageLayout } from '@/components/PageLayout';
import { ArrowLeft, User } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function PlayerDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const playerId = params.id as string;

    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/reports/player/${playerId}`);
                const result = await res.json();
                if (result.success) {
                    setData(result.data);
                } else {
                    setError(result.error);
                }
            } catch (e) {
                setError('Erreur de chargement');
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [playerId]);

    if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement du rapport...</div>;
    if (error || !data) return <div className="p-8 text-center text-red-500">{error || 'Introuvable'}</div>;

    const { player, summary, history } = data;

    // Chart Data
    const chartData = {
        labels: history.map((h: any) => new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Points par match',
                data: history.map((h: any) => h.points),
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.3,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <PageLayout
            title="Profil Joueur"
            subtitle="Statistiques et progression"
            actions={
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Retour
                </Button>
            }
        >
            <div className="space-y-6">
                {/* Header Profile */}
                <Card className="border-0 bg-card shadow-md overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="h-48 md:h-auto md:w-48 bg-secondary flex items-center justify-center relative">
                            {player.photoUrl ? (
                                <img src={player.photoUrl} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <User className="h-20 w-20 text-muted-foreground/30" />
                            )}
                            {player.jerseyNumber !== undefined && (
                                <div className="absolute top-2 left-2 bg-black/70 text-white text-lg font-bold px-3 py-1 rounded">
                                    #{player.jerseyNumber}
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex-1">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-3xl font-bold">{player.firstName} <span className="uppercase">{player.lastName}</span></h2>
                                    <p className="text-muted-foreground text-lg">{player.team?.name || 'Sans club'} • {player.position || 'N/A'}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">{summary.games_played}</div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider">Matchs Joués</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-4 mt-8">
                                <div className="bg-secondary/30 p-3 rounded-lg text-center">
                                    <div className="text-xl font-bold text-foreground">{summary.averages.points}</div>
                                    <div className="text-xs text-muted-foreground font-bold uppercase">PTS/M</div>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-lg text-center">
                                    <div className="text-xl font-bold text-foreground">{summary.averages.rebounds}</div>
                                    <div className="text-xs text-muted-foreground font-bold uppercase">REB/M</div>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-lg text-center">
                                    <div className="text-xl font-bold text-foreground">{summary.averages.assists}</div>
                                    <div className="text-xs text-muted-foreground font-bold uppercase">PD/M</div>
                                </div>
                                <div className="bg-secondary/30 p-3 rounded-lg text-center border border-primary/20 bg-primary/5">
                                    <div className="text-xl font-bold text-primary">{summary.percentages.fg}%</div>
                                    <div className="text-xs text-primary/80 font-bold uppercase">TIRS %</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Chart Section */}
                    <Card className="md:col-span-2 border-0 shadow-md">
                        <CardHeader>
                            <CardTitle>Progression des Points</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <Line options={chartOptions} data={chartData} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Detailed Stats Card */}
                    <Card className="border-0 shadow-md">
                        <CardHeader>
                            <CardTitle>Totaux Saison</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Points Totaux</span>
                                <span className="font-bold">{summary.totals.points}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Rebonds Totaux</span>
                                <span className="font-bold">{summary.totals.rebounds}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Passes Décisives</span>
                                <span className="font-bold">{summary.totals.assists}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Interceptions</span>
                                <span className="font-bold">{summary.totals.steals}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-muted-foreground">Contres</span>
                                <span className="font-bold">{summary.totals.blocks}</span>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-orange-600 font-medium">Balles Perdues</span>
                                <span className="font-bold text-orange-700">{summary.totals.turnovers}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </PageLayout>
    );
}
