import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllUrls, toggleUrlStatus, updateComment } from '../api/urls.api';
import type { UrlResponse } from '../types/url.types';

function DashboardPage() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState('');

  useEffect(() => {
    const fetchUrls = async () => {
      try {
        const data = await getAllUrls();
        setUrls(data);
      } catch {
        setError('Failed to load URLs');
      } finally {
        setLoading(false);
      }
    };

    void fetchUrls();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const updated = await toggleUrlStatus(id, !isActive);
      setUrls(urls.map(url => url.id === id ? updated : url));
    } catch {
      setError('Failed to update URL');
    }
  };

  const handleEditComment = (id: string, currentComment: string | null) => {
    setEditingId(id);
    setEditingComment(currentComment ?? '');
  };

  const handleSaveComment = async (id: string) => {
    try {
      const updated = await updateComment(id, { comment: editingComment });
      setUrls(urls.map(url => url.id === id ? updated : url));
      setEditingId(null);
    } catch {
      setError('Failed to update comment');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingComment('');
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;
  if (error) return <div className="text-center mt-20 text-red-500">{error}</div>;

  return (
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">URL Shortener</h1>
          <button
              onClick={handleLogout}
              className="text-sm text-red-600 hover:underline"
          >
            Logout
          </button>
        </nav>

        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Your URLs</h2>
            <button
                onClick={() => navigate('/dashboard/create')}
                className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
            >
              + Create URL
            </button>
          </div>

          {urls.length === 0 ? (
              <p className="text-center text-gray-500 mt-10">No URLs yet. Create your first one!</p>
          ) : (
              <div className="space-y-4">
                {urls.map(url => (
                    <div key={url.id} className="bg-white rounded-lg shadow p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 mr-4">
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {import.meta.env.VITE_API_URL}/{url.shortCode}
                          </p>
                          <p className="text-sm text-gray-500 truncate mt-1">{url.originalUrl}</p>
                          {editingId === url.id ? (
                            <div className="flex items-center gap-2 mt-2">
                              <input
                                type="text"
                                value={editingComment}
                                onChange={(e) => setEditingComment(e.target.value)}
                                className="flex-1 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Add a comment..."
                                autoFocus
                              />
                              <button onClick={() => handleSaveComment(url.id)} className="text-xs text-blue-600 hover:underline">Save</button>
                              <button onClick={handleCancelEdit} className="text-xs text-gray-400 hover:underline">Cancel</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 mt-1">
                              <p className="text-xs text-gray-400">{url.comment ?? 'No comment'}</p>
                              <button onClick={() => handleEditComment(url.id, url.comment)} className="text-xs text-gray-300 hover:text-blue-500">Edit</button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">{url.clicks} clicks</span>
                          <button
                              onClick={() => handleToggle(url.id, url.isActive)}
                              className={`text-xs px-3 py-1 rounded-full font-medium ${
                                  url.isActive
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-red-100 text-red-700'
                              }`}
                          >
                            {url.isActive ? 'Active' : 'Inactive'}
                          </button>
                        </div>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}

export default DashboardPage;