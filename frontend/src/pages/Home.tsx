import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight, Terminal, Users, Zap, Lock,
  GitBranch, Code2, Plus, Hash, Moon, Sun,
  Globe
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from 'sonner';

/* ─── Hook: persisted theme ─────────────────────────────────────────── */
function useTheme() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('cf-theme') as 'dark' | 'light') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cf-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme(t => t === 'dark' ? 'light' : 'dark'), []);
  return { theme, toggle };
}

/* ─── Component ─────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const { theme, toggle: toggleTheme } = useTheme();
  const [isAuthed, setIsAuthed] = useState(false);
  const [emailVerified, setEmailVerified] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [folderName, setFolderName] = useState('');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  /* ── Auth probe ─────────────────────────────────────────────────── */
  useEffect(() => {
    import('@/lib/api').then(({ probeAuth }) => {
      probeAuth().then(res => {
        setIsAuthed(res.isAuthed);
        if (res.isAuthed && res.user && res.user.emailVerified === false) {
          setEmailVerified(false);
        }
      });
    });
  }, []);

  /* ── Handlers ────────────────────────────────────────────────────── */
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true);
    navigate(`/room/${joinCode.trim().toUpperCase()}`);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = folderName.trim() || 'My Project';
    setCreating(true);
    try {
      const data = await import('@/lib/api').then(m =>
        m.fetchJson<{ roomCode: string }>('/api/rooms', {
          method: 'POST',
          body: JSON.stringify({ name: finalName, language: 'javascript' }),
        })
      );
      toast.success(`Room created — ${data.roomCode}`);
      navigate(`/room/${data.roomCode}`);
    } catch (err: any) {
      if (err.message?.includes('401')) {
        toast.error('Session expired. Please sign in again.');
        navigate('/login');
      } else {
        import('@/lib/api').then(m =>
          toast.error(m.getApiErrorMessage(err, 'Failed to create room'))
        );
      }
    } finally {
      setCreating(false);
    }
  };

  const handleSignOut = async () => {
    await import('@/lib/api').then(m =>
      m.fetchJson('/api/auth/logout', { method: 'POST' }).catch(() => {})
    );
    localStorage.removeItem('codesync-authed');
    localStorage.removeItem('codesync-name');
    setIsAuthed(false);
    toast.success('Signed out');
  };

  /* ── Data ──────────────────────────────────────────────────────────── */


  const stats = [
    { value: "50ms", label: "Avg. sync latency" },
    { value: "10+", label: "Languages supported" },
    { value: "∞", label: "Free rooms" },
  ];

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div
      className="min-h-screen font-sans overflow-x-hidden"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ── Email verification banner ───────────────────────────────── */}
      {isAuthed && !emailVerified && (
        <div
          className="flex items-center justify-center gap-3 px-6 py-2.5 text-sm font-medium"
          style={{ background: "var(--accent)", color: "#fff" }}
        >
          <Zap className="w-3.5 h-3.5 shrink-0" />
          Please verify your email — check your inbox for the link.
        </div>
      )}

      {/* ══════════════════════ NAVBAR ══════════════════════════════════ */}
      <header className="nav-blur h-14 sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <img
            src="/logo.png"
            alt="PeerPod"
            className="h-7 w-auto object-contain transition-opacity group-hover:opacity-75"
          />
          <span
            className="font-bold text-base tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            PeerPod
          </span>
        </Link>

        {/* Nav right */}
        <nav className="flex items-center gap-1">
          <Link to="/docs" className="btn-ghost">Docs</Link>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle ml-1"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div className="theme-toggle-thumb">
              {theme === 'dark'
                ? <Moon className="w-2.5 h-2.5" style={{ color: '#fff' }} />
                : <Sun className="w-2.5 h-2.5" style={{ color: '#fff' }} />
              }
            </div>
          </button>

          {isAuthed ? (
            <button onClick={handleSignOut} className="btn-ghost ml-1">
              Sign out
            </button>
          ) : (
            <>
              <Link to="/login" className="btn-ghost">Sign in</Link>
              <Link to="/signup">
                <button className="btn-primary ml-1">Get started</button>
              </Link>
            </>
          )}
        </nav>
      </header>

      <main>
        {/* ══════════════════════ HERO ════════════════════════════════════ */}
        <section className="relative overflow-hidden">
          {/* Background glow + grid */}
          <div className="absolute inset-0 hero-glow pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">

            {/* Headline */}
            <h1 className="animate-fade-in-up-delay-1 text-5xl md:text-7xl font-black tracking-tight mb-6 leading-[1.05]">
              Write code{" "}
              <span className="text-gradient">together</span>
              <br />
              <span style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
                in real-time.
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="animate-fade-in-up-delay-2 text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              PeerPod is a multiplayer code editor with real-time sync, an integrated
              terminal, and secure sandboxed execution — built for developer teams.
            </p>

            {/* CTA — two cards always visible, locked if not authed */}
            <div className="animate-fade-in-up-delay-3 max-w-2xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* ── Create Room Card ─────────────────────────────────── */}
                <div
                  className="relative rounded-md border p-6 flex flex-col gap-4 text-left transition-all duration-300"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-strong)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.01)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-11 h-11 flex items-center justify-center rounded-md"
                    style={{ background: "var(--accent-muted)", color: "var(--accent-text)" }}
                  >
                    <Plus className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                      Create a room
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      Start a new collaborative session and share the code with your team.
                    </p>
                  </div>

                  {isAuthed ? (
                    <form onSubmit={handleCreate} className="flex flex-col gap-2 mt-auto">
                      <input
                        className="input-field"
                        type="text"
                        placeholder="Project name…"
                        value={folderName}
                        onChange={e => setFolderName(e.target.value)}
                      />
                      <button
                        type="submit"
                        disabled={creating}
                        className="btn-primary w-full justify-center disabled:opacity-60"
                      >
                        <Plus className="w-4 h-4" />
                        {creating ? 'Creating…' : 'Create Room'}
                      </button>
                    </form>
                  ) : (
                    <div className="mt-auto">
                      <div
                        className="flex items-center gap-2 text-xs font-medium mb-3 px-3 py-2 rounded-lg"
                        style={{ background: "var(--bg-overlay)", color: "var(--text-muted)" }}
                      >
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        Sign in to create a room
                      </div>
                      <Link to="/signup">
                        <button className="btn-primary w-full justify-center">
                          Get started — it's free
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>

                {/* ── Join Room Card ───────────────────────────────────── */}
                <div
                  className="relative rounded-md border p-6 flex flex-col gap-4 text-left transition-all duration-300"
                  style={{
                    background: "var(--bg-surface)",
                    borderColor: "var(--border-strong)",
                    boxShadow: "var(--shadow-sm)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--text-secondary)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-lg)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.01)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-sm)";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0) scale(1)";
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-11 h-11 flex items-center justify-center rounded-md"
                    style={{ background: "var(--accent-muted)", color: "var(--accent-text)" }}
                  >
                    <Hash className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base mb-1" style={{ color: "var(--text-primary)" }}>
                      Join a room
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                      Have a room code? Paste it below and jump straight into the session.
                    </p>
                  </div>

                  {isAuthed ? (
                    <form onSubmit={handleJoin} className="flex flex-col gap-2 mt-auto">
                      <div className="relative">
                        <Hash
                          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
                          style={{ color: "var(--text-muted)" }}
                        />
                        <input
                          className="input-field"
                          style={{ paddingLeft: "2.5rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
                          type="text"
                          placeholder="ROOM CODE"
                          value={joinCode}
                          onChange={e => setJoinCode(e.target.value.toUpperCase())}
                          maxLength={6}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={joining || !joinCode.trim()}
                        className="btn-secondary w-full justify-center disabled:opacity-50"
                      >
                        <ArrowRight className="w-4 h-4" />
                        {joining ? 'Joining…' : 'Join Room'}
                      </button>
                    </form>
                  ) : (
                    <div className="mt-auto">
                      <div
                        className="flex items-center gap-2 text-xs font-medium mb-3 px-3 py-2 rounded-lg"
                        style={{ background: "var(--bg-overlay)", color: "var(--text-muted)" }}
                      >
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        Sign in to join a room
                      </div>
                      <Link to="/login">
                        <button className="btn-secondary w-full justify-center">
                          Sign in
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════ STATS ═══════════════════════════════════ */}
        <section
          className="border-t border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="max-w-4xl mx-auto px-6 py-10 grid grid-cols-3 divide-x divide-[var(--border)]">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`px-6 text-center animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="text-3xl md:text-4xl font-black mb-1 text-gradient"
                >
                  {s.value}
                </div>
                <div className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════ EDITOR PREVIEW ══════════════════════════ */}
        <section className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: "var(--text-primary)" }}
            >
              The editor teams love
            </h2>
            <p className="text-base max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              Monaco Editor under the hood — the same engine that powers VS Code.
            </p>
          </div>

          <div className="code-window animate-float">
            {/* Window bar */}
            <div className="code-window-bar">
              <div className="code-dot" style={{ background: "var(--border-strong)" }} />
              <div className="code-dot" style={{ background: "var(--border-strong)" }} />
              <div className="code-dot" style={{ background: "var(--border-strong)" }} />
              <span className="ml-3 text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                main.py
              </span>
              <div className="ml-auto flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--green)" }}>
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse-soft" style={{ background: "var(--green)" }} />
                  3 collaborators online
                </div>
              </div>
            </div>

            {/* Code body */}
            <div className="p-6 font-mono text-sm leading-8" style={{ color: "var(--text-secondary)" }}>
              {/* User avatar indicator */}
              <div className="flex items-center gap-2 mb-4 -mt-1">
                {[
                  { color: '#6366f1', label: 'Alice' },
                  { color: '#34d399', label: 'Bob' },
                  { color: '#f59e0b', label: 'Carol' },
                ].map(u => (
                  <div key={u.label} className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full border"
                    style={{ borderColor: u.color, color: u.color, background: u.color + '18' }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: u.color }} />
                    {u.label}
                  </div>
                ))}
              </div>

              <div>
                <span style={{ color: "var(--text-muted)" }}>def</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>fibonacci</span>
                <span>(n: </span>
                <span style={{ color: "var(--text-muted)" }}>int</span>
                <span>) -&gt; </span>
                <span style={{ color: "var(--text-muted)" }}>list</span>
                <span>[</span>
                <span style={{ color: "var(--text-muted)" }}>int</span>
                <span>]:</span>
              </div>
              <div className="pl-8">
                <span style={{ color: "var(--text-muted)" }}>"""</span>
                <span style={{ color: "var(--text-secondary)" }}>Alice is typing here...</span>
                <span
                  className="inline-block w-0.5 h-4 ml-0.5 -mb-1 cursor-blink"
                  style={{ background: "var(--text-primary)" }}
                />
              </div>
              <div className="pl-8">
                <span style={{ color: "var(--text-muted)" }}>if</span>{" "}
                <span>n &lt;= </span>
                <span style={{ color: "var(--text-secondary)" }}>1</span>
                <span>:</span>
              </div>
              <div className="pl-16">
                <span style={{ color: "var(--text-muted)" }}>return</span>{" "}
                <span>[</span>
                <span style={{ color: "var(--text-secondary)" }}>0</span>
                <span>][:n]</span>
              </div>
              <div className="pl-8">
                <span>seq </span>
                <span style={{ color: "var(--text-secondary)" }}>= [</span>
                <span style={{ color: "var(--text-secondary)" }}>0</span>
                <span>, </span>
                <span style={{ color: "var(--text-secondary)" }}>1</span>
                <span>]</span>
              </div>
            </div>

            {/* Terminal output */}
            <div
              className="border-t px-6 py-4 font-mono text-xs"
              style={{ borderColor: "var(--border)", background: "var(--bg-raised)" }}
            >
              <div style={{ color: "var(--text-muted)" }}>$ python main.py</div>
              <div className="mt-1" style={{ color: "var(--green)" }}>
                [0, 1, 1, 2, 3, 5, 8, 13, 21]
              </div>
            </div>
          </div>
        </section>


        {/* ══════════════════════ CTA BAND ════════════════════════════════ */}
        {!isAuthed && (
          <section
            className="border-t"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="max-w-3xl mx-auto px-6 py-24 text-center">
              <div
                className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-6 border"
                style={{ background: "var(--bg-raised)", borderColor: "var(--border-strong)", color: "var(--text-primary)" }}
              >
                <Globe className="w-3 h-3" />
                Free forever for individuals
              </div>
              <h2
                className="text-3xl md:text-4xl font-bold mb-5 leading-tight"
                style={{ color: "var(--text-primary)" }}
              >
                Ready to build together?
              </h2>
              <p className="text-base mb-8" style={{ color: "var(--text-secondary)" }}>
                Create your first room in seconds. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/signup">
                  <button className="btn-primary glow-pulse text-base px-8 py-3">
                    Start for free
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/login">
                  <button className="btn-ghost text-base">
                    Already have an account? Sign in →
                  </button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ══════════════════════ FOOTER ══════════════════════════════════ */}
      <footer
        className="border-t py-10 px-6 lg:px-12"
        style={{ borderColor: "var(--border)" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="PeerPod" className="h-5 w-auto object-contain opacity-50" />
            <span className="font-semibold text-sm" style={{ color: "var(--text-secondary)" }}>
              PeerPod
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="hover:text-[var(--text-secondary)] cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-[var(--text-secondary)] cursor-pointer transition-colors">Terms</span>
            <Link to="/docs" className="hover:text-[var(--text-secondary)] transition-colors">Docs</Link>
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            © 2026 PeerPod. Built for developers.
          </p>
        </div>
      </footer>
    </div>
  );
}
