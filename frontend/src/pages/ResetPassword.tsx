import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { fetchJson, getApiErrorMessage } from '@/lib/api';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);
    try {
      await fetchJson('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword: password }),
      });
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Reset failed'));
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
      className="flex min-h-screen items-center justify-center p-8"
      style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}
    >
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Reset Password
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              New Password
            </label>
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
                required
                minLength={8}
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

          <button
            type="submit"
            disabled={loading}
            className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-semibold transition-all disabled:opacity-60"
            style={{ background: 'var(--accent)', color: '#fff' }}
            onMouseEnter={e => !loading && (e.currentTarget.style.background = 'var(--accent-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
          >
            {loading ? 'Resetting…' : 'Reset password'}
            {!loading && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
