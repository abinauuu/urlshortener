import { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import { getStats } from '../api/admin.api';
import type { AdminStats } from '../types/admin.types';

function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStats(await getStats());
      } catch {
        setError('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };
    void fetchStats();
  }, []);

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;
  if (!stats) return null;

  const cards = [
    { label: 'Total Users', value: stats.totalUsers },
    { label: 'Total URLs', value: stats.totalUrls },
    { label: 'Total Clicks', value: stats.totalClicks },
    { label: 'Guest URLs', value: stats.guestUrls },
    { label: 'Active URLs', value: stats.activeUrls },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-xl font-semibold mb-6">Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {cards.map(card => (
            <div key={card.label} className="bg-white rounded-lg shadow p-6">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-3xl font-bold mt-2">{card.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminStatsPage;
