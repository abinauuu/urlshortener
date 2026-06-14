import { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav';
import { getUrls, toggleUrl, deleteUrl } from '../api/admin.api';
import type { AdminUrl } from '../types/admin.types';

function AdminUrlsPage() {
  const [urls, setUrls] = useState<AdminUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        setUrls(await getUrls());
      } catch {
        setError('Failed to load URLs');
      } finally {
        setLoading(false);
      }
    };
    void fetchUrls();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const updated = await toggleUrl(id);
      setUrls(urls.map(u => u.id === id ? updated : u));
    } catch {
      setError('Failed to toggle URL');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this URL?')) return;
    try {
      await deleteUrl(id);
      setUrls(urls.filter(u => u.id !== id));
    } catch {
      setError('Failed to delete URL');
    }
  };

  if (loading) return (
    <div className="flex min-h-screen bg-page">
      <AdminNav />
      <main className="flex-1 flex items-center justify-center">
        <p className="text-[14px] text-muted font-medium">Loading…</p>
      </main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-page">
      <AdminNav />
      <main className="flex-1 px-8 py-8">
        <div className="flex items-center justify-between mb-7">
          <h1 className="text-[22px] font-bold tracking-tight text-ink">URLs</h1>
          <span className="text-[13px] text-muted font-medium">{urls.length} total</span>
        </div>

        {error && (
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-5 text-[13.5px] font-semibold text-danger-text">
            <span>⚠</span> {error}
          </div>
        )}

        <div className="bg-surface rounded-2xl border border-border overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
          <table className="w-full text-[13.5px]">
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Short</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Original</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Owner</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Clicks</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Expires</th>
                <th className="px-5 py-3 text-left text-[12px] font-semibold text-subtle uppercase tracking-wider">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {urls.map(url => {
                const isExpired = new Date(url.expiresAt) < new Date();
                return (
                  <tr key={url.id} className="border-b border-border last:border-0 hover:bg-surface-2 transition-colors">
                    <td className="px-5 py-3.5">
                      <span className="font-mono font-semibold text-accent text-[13px]">{url.shortCode}</span>
                    </td>
                    <td className="px-5 py-3.5 max-w-[200px] truncate text-muted">{url.originalUrl}</td>
                    <td className="px-5 py-3.5 text-muted">{url.userEmail ?? 'Guest'}</td>
                    <td className="px-5 py-3.5 text-ink font-medium">{url.clicks}</td>
                    <td className="px-5 py-3.5">
                      {isExpired ? (
                        <span className="text-[12px] font-semibold px-2 py-0.5 rounded-md bg-danger-soft text-danger-text border border-danger-brd">
                          Expired
                        </span>
                      ) : (
                        <span className="text-muted">
                          {new Date(url.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => void handleToggle(url.id)}
                        className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-lg cursor-pointer border transition-colors ${
                          url.isActive
                            ? 'bg-success-soft text-success-text border-transparent hover:opacity-80'
                            : 'bg-surface-2 text-muted border-border hover:bg-surface'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${url.isActive ? 'bg-success' : 'bg-subtle'}`} />
                        {url.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => void handleDelete(url.id)}
                        className="text-[13px] font-semibold text-danger-text cursor-pointer hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default AdminUrlsPage;
