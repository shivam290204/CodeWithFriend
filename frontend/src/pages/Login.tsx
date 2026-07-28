import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchJson, persistAuthed, persistName, getApiErrorMessage } from '@/lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchJson('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      toast.success('If that email exists, a reset link has been sent');
      setForgotMode(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to send reset link'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchJson<{user: any}>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      persistAuthed(true);
      persistName(data.user?.name);
      toast.success('Signed in successfully');
      navigate('/');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Sign in failed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `
    w-full px-3 py-2.5 pl-9 rounded-md text-sm outline-none transition-all
    border focus:ring-1
  `.trim();
  const inputStyle = {
    background: 'var(--bg-overlay)',
    borderColor: 'var(--border-strong)',
    color: 'var(--text-primary)',
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── Left pane (decorative) ──────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden grid-bg border-r"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border)' }}
      >
        <div className="absolute top-7 left-8 flex items-center gap-2">
          <img src="/logo.png" alt="PeerPod" className="h-6 w-auto object-contain opacity-80" />
          <span className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>
            PeerPod
          </span>
        </div>

        {/* Code card */}
        <div
          className="w-[400px] rounded-xl border overflow-hidden shadow-2xl animate-slide-up"
          style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}
        >
          <div
            className="flex items-center gap-2 px-4 h-9 border-b"
            style={{ borderColor: 'var(--border)', background: 'var(--bg-surface)' }}
          >
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--border-strong)' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--border-strong)' }} />
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: 'var(--border-strong)' }} />
            </div>
            <span className="ml-2 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              auth_service.ts
            </span>
          </div>
          <div className="p-5 font-mono text-[13px] leading-loose" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <span style={{ color: '#a5b4fc' }}>async function</span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>login</span>
              <span>(email: </span>
              <span style={{ color: '#a5b4fc' }}>string</span>
              <span>) {'{'}</span>
            </div>
            <div className="pl-5">
              <span style={{ color: 'var(--text-muted)' }}>// verify credentials</span>
            </div>
            <div className="pl-5">
              <span style={{ color: '#a5b4fc' }}>const</span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>user</span>
              {' = await '}
              <span style={{ color: 'var(--text-primary)' }}>db</span>
              .find(email);
            </div>
            <div className="pl-5">
              <span style={{ color: '#a5b4fc' }}>return</span>{' '}
              jwt.sign({'{ id: user.id }'}
              <span
                className="inline-block w-0.5 h-4 ml-0.5 -mb-1 cursor-blink"
                style={{ background: 'var(--accent-text)' }}
              />
              );
            </div>
            <div>{'}'}</div>
          </div>
        </div>
      </div>

      {/* ── Right pane (form) ───────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-10">
          <img src="/logo.png" alt="PeerPod" className="h-6 w-auto object-contain" />
          <span className="font-semibold text-sm">PeerPod</span>
        </Link>

        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Sign in to your PeerPod account.
            </p>
          </div>

          {/* Tab toggle */}
          <div
            className="flex p-1 rounded-lg mb-6 border"
            style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}
          >
            <button
              className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
            >
              Sign in
            </button>
            <Link
              to="/signup"
              className="flex-1 py-2 text-sm font-medium rounded-md text-center transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sign up
            </Link>
          </div>

          <form onSubmit={forgotMode ? handleForgotPassword : handleLogin} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                  style={{ color: 'var(--text-muted)' }}
                />
                <input
                  type="email"
                  className={inputClass}
                  style={inputStyle}
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  onFocus={e => {
                    e.currentTarget.style.borderColor = 'var(--accent)';
                    e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)';
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            {!forgotMode && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    Password
                  </label>
                  <span onClick={() => setForgotMode(true)} className="text-xs cursor-pointer transition-colors hover:underline" style={{ color: 'var(--accent-text)' }}>
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5"
                    style={{ color: 'var(--text-muted)' }}
                  />
                  <input
                    type="password"
                    className={inputClass}
                    style={inputStyle}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required={!forgotMode}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = 'var(--accent)';
                      e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)';
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = 'var(--border-strong)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              {loading ? (forgotMode ? 'Sending...' : 'Signing in…') : (forgotMode ? 'Send reset link' : 'Sign in')}
              {!loading && !forgotMode && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
            {forgotMode && (
              <button
                type="button"
                onClick={() => setForgotMode(false)}
                className="mt-2 text-sm transition-colors hover:underline"
                style={{ color: 'var(--text-secondary)' }}
              >
                Back to Sign in
              </button>
            )}
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          {/* OAuth */}
          <div className="flex gap-3">
            {[
              {
                label: 'GitHub',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                ),
              },
              {
                label: 'Google',
                icon: (
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                ),
              },
            ].map(p => (
              <button
                key={p.label}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm border transition-all"
                style={{
                  background: 'var(--bg-raised)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--border-strong)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {p.icon} {p.label}
              </button>
            ))}
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            By signing in, you agree to our{' '}
            <span className="cursor-pointer hover:underline" style={{ color: 'var(--text-secondary)' }}>
              Terms
            </span>{' '}
            &amp;{' '}
            <span className="cursor-pointer hover:underline" style={{ color: 'var(--text-secondary)' }}>
              Privacy Policy
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
