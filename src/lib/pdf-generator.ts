import { jsPDF } from 'jspdf';
import type { PlayerRanking } from '@/types';

interface ReportData {
  generated_at: string;
  week_start: string;
  week_end: string;
  total_matches: number;
  rankings: {
    top_scorers: PlayerRanking[];
    top_rebounders: PlayerRanking[];
    top_assisters: PlayerRanking[];
    top_stealers: PlayerRanking[];
    top_blockers: PlayerRanking[];
  };
  matches: Array<{
    id: string;
    match_date: string;
    home_score: number;
    away_score: number;
    home_team: { name: string };
    away_team: { name: string };
  }>;
}

export function generateWeeklyReport(data: ReportData): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Titre
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Rapport Hebdomadaire Basketball', pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Période
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const weekStart = new Date(data.week_start).toLocaleDateString('fr-FR');
  const weekEnd = new Date(data.week_end).toLocaleDateString('fr-FR');
  doc.text(`Période: ${weekStart} - ${weekEnd}`, pageWidth / 2, y, { align: 'center' });
  y += 5;
  doc.text(`Généré le: ${new Date(data.generated_at).toLocaleString('fr-FR')}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Statistiques générales
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total matchs: ${data.total_matches}`, 20, y);
  y += 15;

  // Classements
  const categories = [
    { key: 'top_scorers', title: 'Top 5 Scoreurs', stat: 'avg_points', label: 'PTS/M' },
    { key: 'top_rebounders', title: 'Top 5 Rebondeurs', stat: 'avg_rebounds', label: 'REB/M' },
    { key: 'top_assisters', title: 'Top 5 Passeurs', stat: 'avg_assists', label: 'AST/M' },
    { key: 'top_stealers', title: 'Top 5 Interceptions', stat: 'avg_steals', label: 'STL/M' },
    { key: 'top_blockers', title: 'Top 5 Contres', stat: 'avg_blocks', label: 'BLK/M' },
  ];

  for (const category of categories) {
    // Vérifier si on a besoin d'une nouvelle page
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(category.title, 20, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const players = data.rankings[category.key as keyof typeof data.rankings] as PlayerRanking[];

    if (players && players.length > 0) {
      players.forEach((player, index) => {
        const statValue = (player[category.stat as keyof PlayerRanking] as number)?.toFixed(1) || '0.0';
        const line = `${index + 1}. ${player.first_name} ${player.last_name} (${player.team_name}) - ${statValue} ${category.label}`;
        doc.text(line, 25, y);
        y += 6;
      });
    } else {
      doc.text('Aucune donnée disponible', 25, y);
      y += 6;
    }

    y += 10;
  }

  // Matchs de la semaine
  if (y > 200) {
    doc.addPage();
    y = 20;
  }

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Matchs de la semaine', 20, y);
  y += 10;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');

  if (data.matches && data.matches.length > 0) {
    data.matches.forEach((match) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
      }

      const matchDate = new Date(match.match_date).toLocaleDateString('fr-FR');
      const homeName = match.home_team?.name || 'Équipe A';
      const awayName = match.away_team?.name || 'Équipe B';
      const line = `${matchDate}: ${homeName} ${match.home_score} - ${match.away_score} ${awayName}`;
      doc.text(line, 25, y);
      y += 6;
    });
  } else {
    doc.text('Aucun match cette semaine', 25, y);
  }

  // Télécharger le PDF
  const fileName = `rapport-basketball-${weekStart.replace(/\//g, '-')}.pdf`;
  doc.save(fileName);
}
