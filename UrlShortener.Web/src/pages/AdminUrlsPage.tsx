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

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNav />
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h2 className="text-xl font-semibold mb-6">URLs</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Short</th>
                <th className="px-4 py-3">Original</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Clicks</th>
                <th className="px-4 py-3">Expires</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {urls.map(url => (
                <tr key={url.id} className="border-t">
                  <td className="px-4 py-3">{url.shortCode}</td>
                  <td className="px-4 py-3 max-w-xs truncate text-gray-500">{url.originalUrl}</td>
                  <td className="px-4 py-3 text-gray-500">{url.userEmail ?? 'Guest'}</td>
                  <td className="px-4 py-3">{url.clicks}</td>
                  <td className="px-4 py-3">
                    {new Date(url.expiresAt) < new Date() ? (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">Expired</span>
                    ) : (
                      <span className="text-gray-500">
                        {new Date(url.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => void handleToggle(url.id)}
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        url.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {url.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => void handleDelete(url.id)} className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminUrlsPage;
