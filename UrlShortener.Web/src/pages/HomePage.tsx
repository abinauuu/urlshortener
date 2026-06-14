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

  const baseUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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
    await navigator.clipboard.writeText(`${baseUrl}/${result.shortCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyGuest = async (url: UrlResponse) => {
    await navigator.clipboard.writeText(`${baseUrl}/${url.shortCode}`);
    setCopiedId(url.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePaste = async () => {
    const text = await navigator.clipboard.readText();
    setOriginalUrl(text);
  };

  const focusRing = { borderColor: 'var(--accent)', boxShadow: '0 0 0 4px var(--ring)' };
  const blurReset = { borderColor: '', boxShadow: '' };

  return (
    <div className="min-h-screen bg-page flex flex-col">

      {/* Nav */}
      <nav
        className="sticky top-0 z-10 border-b border-[var(--glass-brd)] px-6 md:px-8 py-4 flex items-center gap-3"
        style={{ background: 'var(--glass)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
      >
        <div className="w-8 h-8 rounded-[9px] bg-accent flex items-center justify-center text-accent-fg text-base shrink-0">↗</div>
        <span className="text-[17px] font-bold tracking-tight text-ink">hop.li</span>
        <div className="flex-1" />
        <Link
          to="/login"
          className="h-9 px-4 rounded-xl text-[14px] font-semibold text-muted no-underline transition-colors hover:bg-surface-2 hover:text-ink flex items-center"
        >
          Login
        </Link>
        <Link
          to="/register"
          className="h-9 px-4 rounded-xl bg-accent text-accent-fg text-[14px] font-semibold no-underline flex items-center transition-colors"
          style={{ boxShadow: 'var(--shadow-card)' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
        >
          Get started free
        </Link>
      </nav>

      {/* Hero */}
      <section
        className="py-16 md:py-24 px-4"
        style={{ background: 'radial-gradient(120% 70% at 50% 0%, var(--accent-soft), transparent 60%)' }}
      >
        <div className="max-w-[600px] mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-soft border border-[rgba(15,118,110,0.2)] text-accent-soft-text text-[12.5px] font-semibold mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            Free · No account needed
          </div>
          <h1 className="text-[38px] md:text-[48px] font-bold tracking-tight text-ink leading-[1.1] mb-4">
            Short links that work.
          </h1>
          <p className="text-[16px] md:text-[17px] text-muted font-medium mb-8 max-w-[440px] mx-auto">
            Paste a long URL and get a clean short link in seconds — no account, no friction.
          </p>

          {/* Shorten box */}
          <div className="bg-surface rounded-2xl border border-border p-6 text-left" style={{ boxShadow: 'var(--shadow-card-md)' }}>
            {error && (
              <div className="flex items-start gap-2 px-4 py-3 rounded-xl border border-danger-brd bg-danger-soft mb-5 text-[13.5px] font-semibold text-danger-text">
                <span className="mt-px">⚠</span>
                {error}
              </div>
            )}

            {result ? (
              <div>
                <p className="text-[12px] font-semibold text-subtle uppercase tracking-wider mb-3">Your short link</p>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border-strong bg-surface-2 mb-4">
                  <a href={`${baseUrl}/${result.shortCode}`} target="_blank" rel="noopener noreferrer" className="flex-1 min-w-0 no-underline">
                    <span className="text-[15px] text-muted font-medium">hop.li/</span>
                    <span className="text-[15px] font-mono font-semibold text-accent">{result.shortCode}</span>
                  </a>
                  <button
                    onClick={() => void handleCopy()}
                    className="shrink-0 h-8 px-3 rounded-lg border border-border-strong bg-surface text-[13px] font-semibold text-ink cursor-pointer transition-colors hover:bg-surface-2"
                    style={copied ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                  >
                    {copied ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-[12.5px] text-subtle mb-5">
                  Expires {new Date(result.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · 30-day guest link
                </p>
                <button
                  onClick={() => setResult(null)}
                  className="w-full h-11 rounded-xl border border-border-strong bg-surface text-[14.5px] font-semibold text-ink cursor-pointer transition-colors hover:bg-surface-2"
                >
                  Shorten another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label className="block text-[14px] font-medium text-ink mb-2">Original URL</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle text-[17px]">🔗</span>
                      <input
                        type="url"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        placeholder="https://example.com/very/long/url"
                        required
                        className="w-full h-12 pl-10 pr-4 rounded-xl border border-border-strong bg-surface text-ink text-[14.5px] font-medium outline-none transition-shadow"
                        style={{ fontFamily: 'inherit' }}
                        onFocus={(e) => Object.assign(e.target.style, focusRing)}
                        onBlur={(e) => Object.assign(e.target.style, blurReset)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => void handlePaste()}
                      className="inline-flex items-center h-12 px-4 rounded-xl border border-border-strong bg-surface text-ink text-[14.5px] font-semibold cursor-pointer shrink-0 transition-colors hover:bg-surface-2"
                    >
                      Paste
                    </button>
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[14px] font-medium text-subtle mb-2">
                    Custom short code
                    <span className="text-[11px] bg-amber-soft text-amber-text font-semibold px-1.5 py-0.5 rounded-md">Registered only</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="spring-sale"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-surface-2 text-subtle text-[14.5px] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-[14px] font-medium text-subtle mb-2">
                    Comment
                    <span className="text-[11px] bg-amber-soft text-amber-text font-semibold px-1.5 py-0.5 rounded-md">Registered only</span>
                  </label>
                  <input
                    type="text"
                    disabled
                    placeholder="What is this link for?"
                    className="w-full h-12 px-4 rounded-xl border border-border bg-surface-2 text-subtle text-[14.5px] cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-accent text-accent-fg text-[15.5px] font-semibold border-none cursor-pointer disabled:opacity-50 transition-colors"
                  style={{ boxShadow: 'var(--shadow-card)' }}
                  onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                >
                  {loading ? 'Shortening…' : 'Shorten URL'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-surface-2">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-[22px] font-bold tracking-tight text-ink text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { step: '1', title: 'Paste your URL', desc: 'Drop in any long link — from a doc, a product page, anywhere.' },
              { step: '2', title: 'Get a short link', desc: 'We generate a clean hop.li/… link instantly. No sign-up needed.' },
              { step: '3', title: 'Share it anywhere', desc: 'Use it in messages, emails, bios — it redirects every time.' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="bg-surface rounded-2xl border border-border p-6" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="w-9 h-9 rounded-xl bg-accent-soft text-accent-soft-text font-bold text-[15px] flex items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="text-[16px] font-bold text-ink mb-1.5">{title}</h3>
                <p className="text-[14px] text-muted font-medium leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4">
        <div className="max-w-[860px] mx-auto">
          <h2 className="text-[22px] font-bold tracking-tight text-ink text-center mb-2">More with a free account</h2>
          <p className="text-[14.5px] text-muted text-center font-medium mb-10">Everything guest links do, plus the good stuff.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { icon: '⏱', title: '90-day links', desc: 'Guest links last 30 days. Registered links stay active for 90 days.' },
              { icon: '✏️', title: 'Custom short codes', desc: 'Choose a readable slug — like hop.li/my-sale — instead of a random one.' },
              { icon: '💬', title: 'Comments', desc: 'Add a note to any link so you always remember what it was for.' },
              { icon: '📊', title: 'Click tracking', desc: 'See how many times each link was clicked, right from your dashboard.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-surface rounded-2xl border border-border p-6 flex gap-4" style={{ boxShadow: 'var(--shadow-card)' }}>
                <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-[20px] shrink-0">
                  {icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-ink mb-1">{title}</h3>
                  <p className="text-[13.5px] text-muted font-medium leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guest recent links */}
      {guestUrls.length > 0 && (
        <section className="py-10 px-4 bg-surface-2">
          <div className="max-w-[640px] mx-auto">
            <h2 className="text-[16px] font-bold text-ink mb-4">Your recent guest links</h2>
            <div className="flex flex-col gap-3">
              {guestUrls.map(url => (
                <div key={url.id} className="bg-surface rounded-xl border border-border px-4 py-3 flex items-center gap-3" style={{ boxShadow: 'var(--shadow-card)' }}>
                  <div className="flex-1 min-w-0">
                    <a href={`${baseUrl}/${url.shortCode}`} target="_blank" rel="noopener noreferrer" className="no-underline">
                      <span className="text-[14px] text-muted font-medium">hop.li/</span>
                      <span className="text-[14px] font-mono font-semibold text-accent">{url.shortCode}</span>
                    </a>
                    <p className="text-[12.5px] text-subtle truncate mt-0.5">{url.originalUrl}</p>
                    <p className="text-[11.5px] text-subtle mt-0.5">
                      Expires {new Date(url.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <button
                    onClick={() => void handleCopyGuest(url)}
                    className="shrink-0 h-8 px-3 rounded-lg border border-border-strong bg-surface text-[13px] font-semibold text-ink cursor-pointer transition-colors hover:bg-surface-2"
                    style={copiedId === url.id ? { background: 'var(--accent-soft)', color: 'var(--accent)', borderColor: 'var(--accent)' } : {}}
                  >
                    {copiedId === url.id ? '✓ Copied' : 'Copy'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Upgrade CTA */}
      <section className="py-16 px-4" style={{ background: 'radial-gradient(120% 80% at 50% 100%, var(--accent-soft), transparent 60%)' }}>
        <div className="max-w-[480px] mx-auto text-center">
          <h2 className="text-[24px] font-bold tracking-tight text-ink mb-2">Ready for 90-day links?</h2>
          <p className="text-[15px] text-muted font-medium mb-7">
            Create a free account and unlock custom codes, comments, and click tracking.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center justify-center h-12 px-8 rounded-xl bg-accent text-accent-fg text-[15px] font-semibold no-underline transition-colors"
            style={{ boxShadow: 'var(--shadow-card)' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
          >
            Create free account
          </Link>
          <p className="text-[13px] text-subtle mt-4">No credit card. No spam. Cancel anytime.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-[6px] bg-accent flex items-center justify-center text-accent-fg text-[11px]">↗</div>
          <span className="text-[14px] font-bold text-ink">hop.li</span>
        </div>
        <p className="text-[13px] text-subtle">© 2026 hop.li · Free URL shortener</p>
      </footer>
    </div>
  );
}

export default HomePage;
