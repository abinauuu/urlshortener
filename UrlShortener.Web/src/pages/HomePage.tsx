import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createGuestUrl } from '../api/urls.api';
import type { UrlResponse } from '../types/url.types';

const GUEST_URLS_KEY = 'guest_urls';
const MAX_GUEST_URLS = 10;

function loadGuestUrls(): UrlResponse[] {
  try {
    const stored = localStorage.getItem(GUEST_URLS_KEY);
    if (!stored) return [];
    const urls: UrlResponse[] = JSON.parse(stored);
    const now = new Date();
    const valid = urls.filter(url => new Date(url.expiresAt) > now);
    if (valid.length !== urls.length) {
      localStorage.setItem(GUEST_URLS_KEY, JSON.stringify(valid));
    }
    return valid;
  } catch {
    return [];
  }
}

function saveGuestUrl(url: UrlResponse): void {
  const existing = loadGuestUrls();
  const updated = [url, ...existing].slice(0, MAX_GUEST_URLS);
  localStorage.setItem(GUEST_URLS_KEY, JSON.stringify(updated));
}

function HomePage() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [result, setResult] = useState<UrlResponse | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [guestUrls, setGuestUrls] = useState<UrlResponse[]>(() => loadGuestUrls());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await createGuestUrl(originalUrl);
      setResult(data);
      setOriginalUrl('');
      saveGuestUrl(data);
      setGuestUrls(loadGuestUrls());
    } catch (err) {
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosErr = err as { response?: { data?: { message?: string } } };
        setError(axiosErr.response?.data?.message || 'Failed to shorten URL. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/${result.shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyGuest = async (url: UrlResponse) => {
    await navigator.clipboard.writeText(`${import.meta.env.VITE_API_URL}/${url.shortCode}`);
    setCopiedId(url.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setOriginalUrl(text);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">URL Shortener</h1>
        <div className="flex gap-4">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">Login</Link>
          <Link to="/register" className="text-sm text-blue-600 hover:underline">Register</Link>
        </div>
      </nav>

      <div className="max-w-lg mx-auto py-16 px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2">Shorten your URL</h2>
          <p className="text-gray-500 text-sm">No account needed. Links expire in 30 days.</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {result ? (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Your short URL:</p>
              <div className="flex items-center gap-2 bg-gray-50 border rounded px-3 py-2 mb-4">
                <a
                  href={`${import.meta.env.VITE_API_URL}/${result.shortCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-sm text-blue-600 hover:underline truncate"
                >
                  {import.meta.env.VITE_API_URL}/{result.shortCode}
                </a>
                <button
                  onClick={() => void handleCopy()}
                  className="text-xs text-gray-400 hover:text-blue-500 shrink-0"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <p className="text-xs text-gray-400 mb-4">
                Expires: {new Date(result.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <button
                onClick={() => setResult(null)}
                className="w-full border rounded py-2 text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400"
              >
                Shorten another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Original URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    className="flex-1 border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://example.com/very/long/url"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => void handlePaste()}
                    className="px-3 py-2 border rounded text-sm text-gray-500 hover:text-blue-600 hover:border-blue-400 shrink-0"
                  >
                    Paste
                  </button>
                </div>
              </div>

              <div className="mb-6 group relative">
                <label className="block text-sm font-medium mb-1 text-gray-400">
                  Custom Short Code <span className="font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full border rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  placeholder="my-link"
                />
                <span className="absolute left-0 -top-6 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  Sign in to use custom short codes
                </span>
              </div>

              <div className="mb-6 group relative">
                <label className="block text-sm font-medium mb-1 text-gray-400">
                  Comment <span className="font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  disabled
                  className="w-full border rounded px-3 py-2 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
                  placeholder="What is this link for?"
                />
                <span className="absolute left-0 -top-6 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  Sign in to add comments
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Shortening...' : 'Shorten URL'}
              </button>
            </form>
          )}
        </div>

        {guestUrls.length > 0 && (
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-gray-600 mb-3">Your recent links</h3>
            <div className="space-y-2">
              {guestUrls.map(url => (
                <div key={url.id} className="bg-white rounded-lg shadow p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <a
                      href={`${import.meta.env.VITE_API_URL}/${url.shortCode}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:underline truncate block"
                    >
                      {import.meta.env.VITE_API_URL}/{url.shortCode}
                    </a>
                    <p className="text-xs text-gray-400 truncate">{url.originalUrl}</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      Expires: {new Date(url.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleCopyGuest(url)}
                    className="text-xs text-gray-400 hover:text-blue-500 shrink-0"
                  >
                    {copiedId === url.id ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Want 90-day links, custom short codes and comments?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">Create a free account</Link>
        </p>
      </div>
    </div>
  );
}

export default HomePage;
