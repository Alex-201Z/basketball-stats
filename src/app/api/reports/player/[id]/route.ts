
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    const { id } = await params;

    try {
        // 1. Fetch Player Details
        const player = await prisma.player.findUnique({
            where: { id },
            include: {
                team: true,
            },
        });

        if (!player) {
            return NextResponse.json(
                { success: false, error: 'Joueur non trouvé' },
                { status: 404 }
            );
        }

        // 2. Fetch Player Stats for ALL completed matches (or filter by league/season later)
        // We only count stats from matches that are 'completed' or 'in_progress'? 
        // Usually reports are on completed matches, but let's include all where stats exist.
        const stats = await prisma.playerStats.findMany({
            where: {
                playerId: id,
                match: {
                    status: { in: ['completed', 'in_progress'] } // Include in_progress for live tracking? Or just completed. Let's do both for now.
                }
            },
            include: {
                match: true,
            },
            orderBy: {
                match: {
                    matchDate: 'asc',
                },
            },
        });

        // 3. Aggregate Data
        const totalGames = stats.length;

        // Sums
        const totals = stats.reduce((acc, curr) => ({
            points: acc.points + curr.points,
            rebounds: acc.rebounds + (curr.offensiveRebounds + curr.defensiveRebounds),
            assists: acc.assists + curr.assists,
            steals: acc.steals + curr.steals,
            blocks: acc.blocks + curr.blocks,
            turnovers: acc.turnovers + curr.turnovers,
            fgm: acc.fgm + curr.fieldGoalsMade,
            fga: acc.fga + curr.fieldGoalsAttempted,
            pm3: acc.pm3 + curr.threePointersMade,
            pa3: acc.pa3 + curr.threePointersAttempted,
            ftm: acc.ftm + curr.freeThrowsMade,
            fta: acc.fta + curr.freeThrowsAttempted,
            minutes: acc.minutes + Number(curr.minutesPlayed),
        }), {
            points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0,
            fgm: 0, fga: 0, pm3: 0, pa3: 0, ftm: 0, fta: 0, minutes: 0
        });

        // Averages
        const averages = totalGames > 0 ? {
            points: parseFloat((totals.points / totalGames).toFixed(1)),
            rebounds: parseFloat((totals.rebounds / totalGames).toFixed(1)),
            assists: parseFloat((totals.assists / totalGames).toFixed(1)),
            steals: parseFloat((totals.steals / totalGames).toFixed(1)),
            blocks: parseFloat((totals.blocks / totalGames).toFixed(1)),
            turnovers: parseFloat((totals.turnovers / totalGames).toFixed(1)),
            minutes: parseFloat((totals.minutes / totalGames).toFixed(1)),
        } : {
            points: 0, rebounds: 0, assists: 0, steals: 0, blocks: 0, turnovers: 0, minutes: 0
        };

        // Percentages
        const percentages = {
            fg: totals.fga > 0 ? Math.round((totals.fgm / totals.fga) * 100) : 0,
            p3: totals.pa3 > 0 ? Math.round((totals.pm3 / totals.pa3) * 100) : 0,
            ft: totals.fta > 0 ? Math.round((totals.ftm / totals.fta) * 100) : 0,
        };

        // History for Charts (Points over time)
        const history = stats.map(s => ({
            date: s.match.matchDate,
            points: s.points,
            opponent: s.match.homeTeamId === player.teamId ? 'vs Away' : 'vs Home' // Simplified, ideal would be to get opponent name
        }));

        return NextResponse.json({
            success: true,
            data: {
                player,
                summary: {
                    games_played: totalGames,
                    totals,
                    averages,
                    percentages,
                },
                history,
            },
        });

    } catch (error) {
        console.error('Erreur API Rapport:', error);
        return NextResponse.json(
            { success: false, error: 'Erreur serveur' },
            { status: 500 }
        );
    }
}
