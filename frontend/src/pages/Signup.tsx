import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchJson, persistAuthed, persistName, getApiErrorMessage } from '@/lib/api';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await fetchJson<{user: any}>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      });
      persistAuthed(true);
      persistName(data.user?.name);
      toast.success('Account created successfully');
      navigate('/');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full px-3 py-2.5 pl-9 rounded-md text-sm outline-none transition-all border`;
  const inputStyle = {
    background: 'var(--bg-overlay)',
    borderColor: 'var(--border-strong)',
    color: 'var(--text-primary)',
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--accent)';
    e.currentTarget.style.boxShadow = '0 0 0 1px var(--accent)';
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--border-strong)';
    e.currentTarget.style.boxShadow = 'none';
  };

  return (
    <div
      className="flex min-h-screen"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      {/* ── Left pane ───────────────────────────────────────────────────── */}
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
              user_model.ts
            </span>
          </div>
          <div className="p-5 font-mono text-[13px] leading-loose" style={{ color: 'var(--text-secondary)' }}>
            <div>
              <span style={{ color: '#a5b4fc' }}>interface</span>{' '}
              <span style={{ color: 'var(--text-primary)' }}>User</span>{' {'}
            </div>
            <div className="pl-5">
              name<span>: </span><span style={{ color: '#a5b4fc' }}>string</span>;
            </div>
            <div className="pl-5">
              email<span>: </span><span style={{ color: '#a5b4fc' }}>string</span>;
            </div>
            <div className="pl-5">
              password<span>: </span><span style={{ color: '#a5b4fc' }}>string</span>;
            </div>
            <div className="pl-5">
              createdAt<span>: </span><span style={{ color: '#a5b4fc' }}>Date</span>;
              <span
                className="inline-block w-0.5 h-4 ml-0.5 -mb-1 cursor-blink"
                style={{ background: 'var(--accent-text)' }}
              />
            </div>
            <div>{'}'}</div>
          </div>
        </div>
      </div>

      {/* ── Right pane ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center p-8">
        <Link to="/" className="lg:hidden flex items-center gap-2 mb-10">
          <img src="/logo.png" alt="PeerPod" className="h-6 w-auto object-contain" />
          <span className="font-semibold text-sm">PeerPod</span>
        </Link>

        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              Create an account
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Join PeerPod and start collaborating.
            </p>
          </div>

          {/* Tab toggle */}
          <div
            className="flex p-1 rounded-lg mb-6 border"
            style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)' }}
          >
            <Link
              to="/login"
              className="flex-1 py-2 text-sm font-medium rounded-md text-center transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              Sign in
            </Link>
            <button
              className="flex-1 py-2 text-sm font-medium rounded-md transition-all"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-primary)' }}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <input type="text" className={inputClass} style={inputStyle} placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} required onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <input type="email" className={inputClass} style={inputStyle} placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <input type="password" className={inputClass} style={inputStyle} placeholder="Min. 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} onFocus={onFocus} onBlur={onBlur} />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-60"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
            >
              {loading ? 'Creating account…' : 'Create account'}
              {!loading && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>

          <div className="flex gap-3">
            {['GitHub', 'Google'].map(p => (
              <button
                key={p}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm border transition-all"
                style={{ background: 'var(--bg-raised)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {p}
              </button>
            ))}
          </div>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
            By creating an account, you agree to our{' '}
            <span className="cursor-pointer hover:underline" style={{ color: 'var(--text-secondary)' }}>Terms</span>{' '}
            &amp;{' '}
            <span className="cursor-pointer hover:underline" style={{ color: 'var(--text-secondary)' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
