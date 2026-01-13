'use client';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type TooltipItem,
} from 'chart.js';
import type { PlayerRanking, RankingCategory } from '@/types';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StatsChartProps {
  rankings: PlayerRanking[];
  category: RankingCategory;
  title?: string;
}

export function StatsChart({ rankings, category, title }: StatsChartProps) {
  const getStatValue = (player: PlayerRanking): number => {
    switch (category) {
      case 'points':
        return player.avg_points || 0;
      case 'rebounds':
        return player.avg_rebounds || 0;
      case 'assists':
        return player.avg_assists || 0;
      case 'steals':
        return player.avg_steals || 0;
      case 'blocks':
        return player.avg_blocks || 0;
      case 'global':
        return player.global_score || 0;
      default:
        return 0;
    }
  };

  const getCategoryLabel = (): string => {
    switch (category) {
      case 'points':
        return 'Points par match';
      case 'rebounds':
        return 'Rebonds par match';
      case 'assists':
        return 'Passes par match';
      case 'steals':
        return 'Interceptions par match';
      case 'blocks':
        return 'Contres par match';
      case 'global':
        return 'Score global';
      default:
        return 'Statistique';
    }
  };

  const getBarColor = (index: number): string => {
    const colors = [
      'rgba(255, 99, 132, 0.8)',   // Rouge
      'rgba(54, 162, 235, 0.8)',   // Bleu
      'rgba(255, 206, 86, 0.8)',   // Jaune
      'rgba(75, 192, 192, 0.8)',   // Turquoise
      'rgba(153, 102, 255, 0.8)',  // Violet
      'rgba(255, 159, 64, 0.8)',   // Orange
      'rgba(199, 199, 199, 0.8)',  // Gris
      'rgba(83, 102, 255, 0.8)',   // Indigo
      'rgba(255, 99, 255, 0.8)',   // Magenta
      'rgba(99, 255, 132, 0.8)',   // Vert
    ];
    return colors[index % colors.length];
  };

  const data = {
    labels: rankings.slice(0, 10).map(
      (p) => `${p.first_name.charAt(0)}. ${p.last_name}`
    ),
    datasets: [
      {
        label: getCategoryLabel(),
        data: rankings.slice(0, 10).map(getStatValue),
        backgroundColor: rankings.slice(0, 10).map((_, i) => getBarColor(i)),
        borderColor: rankings.slice(0, 10).map((_, i) =>
          getBarColor(i).replace('0.8', '1')
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: !!title,
        text: title || '',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const value = context.parsed.y;
            return `${getCategoryLabel()}: ${value !== null ? value.toFixed(1) : '0'}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 1,
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="h-[300px] w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
