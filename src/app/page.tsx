import { DashboardClient } from '@/components/DashboardClient';
import { getDashboardStats, getRecentMatches, getRankings } from '@/lib/dashboard-data';

// Force dynamic rendering because we rely on DB data that changes frequently
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch data on the server
  // We use Promise.all to fetch everything in parallel
  const [stats, matches, rankings] = await Promise.all([
    getDashboardStats(),
    getRecentMatches(),
    getRankings('points', 10),
  ]);

  return (
    <DashboardClient
      initialStats={stats}
      initialMatches={matches}
      initialRankings={rankings}
    />
  );
}
