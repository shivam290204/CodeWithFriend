import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Terminal, Mic, Layout, Settings, Bell, FileCode2 } from "lucide-react";
import { useState, useEffect } from "react";

export default function Home() {
  const navigate = useNavigate();
  const [isAuthed, setIsAuthed] = useState<boolean>(false);

  useEffect(() => {
    import('@/lib/api').then(({ probeAuth }) => {
      probeAuth().then(setIsAuthed);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#030014] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-x-hidden relative">
      
      {/* Ambient Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none mix-blend-overlay" />

      {/* Navbar */}
      <header className="h-20 border-b border-white/5 bg-[#030014]/50 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 transition-all duration-300">
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-fuchsia-600 rounded-xl flex items-center justify-center text-sm text-white font-black shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-300">CF</div>
          <span className="text-white font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">CodeFlow</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-10 text-sm font-medium">
          <Link to="/dashboard" className="text-white hover:text-indigo-400 transition-colors">Dashboard</Link>
          <Link to="/marketplace" className="text-slate-400 hover:text-white transition-colors">Marketplace</Link>
          <Link to="/docs" className="text-slate-400 hover:text-white transition-colors">Documentation</Link>
          <Link to="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link>
        </nav>

        <div className="flex items-center gap-6">
          <Bell className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors hidden sm:block hover:scale-110 duration-200" />
          <Settings className="w-5 h-5 text-slate-400 hover:text-white cursor-pointer transition-colors hidden sm:block hover:scale-110 duration-200" />
          <Link to="/dashboard">
            <button className="bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold px-5 py-2.5 rounded-full transition-all duration-300 text-sm backdrop-blur-md hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {isAuthed ? "Go to Dashboard" : "Create Room"}
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center relative z-10">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 py-28 flex flex-col items-center text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            CodeFlow v2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-slate-400 mb-8 tracking-tighter leading-tight drop-shadow-sm">
            Code in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-500 to-fuchsia-500">Flow</span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            The ultimate platform for developers to collaborate on architecture, write code, and run terminals in real-time. Zero latency, infinite creativity.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link to={isAuthed ? "/dashboard" : "/signup"}>
              <button className="group bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white font-semibold px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:shadow-[0_0_40px_rgba(99,102,241,0.6)] hover:-translate-y-1">
                {isAuthed ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-300 hover:border-white/20 backdrop-blur-md hover:-translate-y-1">
              <Play className="w-5 h-5 text-cyan-400" /> Watch Demo
            </button>
          </div>
        </section>

        {/* Feature Grid - Premium Bento Style */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Shared Editor (Spans 2 cols) */}
          <div className="md:col-span-2 group relative flex flex-col overflow-hidden rounded-[32px] bg-zinc-950/50 border border-white/10 p-1 transition-all hover:border-white/20">
            {/* Subtle Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative flex h-full flex-col rounded-[28px] bg-zinc-950 p-8 pt-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 shadow-inner">
                  <FileCode2 className="w-6 h-6 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Multi-player Editor</h3>
              </div>
              <p className="text-zinc-400 text-base mb-10 max-w-md leading-relaxed">
                True zero-latency collaborative typing. See your team's cursors fly across the screen with framework-aware syntax highlighting.
              </p>
              
              {/* Mockup Window */}
              <div className="flex-1 rounded-t-xl bg-zinc-900 border-x border-t border-white/10 shadow-2xl relative overflow-hidden flex flex-col mt-auto group-hover:-translate-y-2 transition-transform duration-500">
                <div className="h-10 border-b border-white/5 bg-zinc-900/50 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <div className="mx-auto text-[10px] font-medium text-zinc-500 font-mono tracking-widest uppercase">server.js</div>
                </div>
                <div className="p-6 font-mono text-[13px] leading-loose text-zinc-300">
                  <span className="text-fuchsia-400">const</span> <span className="text-blue-400">express</span> = <span className="text-cyan-400">require</span>(<span className="text-emerald-400">'express'</span>);<br/>
                  <span className="text-fuchsia-400">const</span> <span className="text-blue-400">app</span> = <span className="text-indigo-400">express</span>();<br/><br/>
                  <span className="text-zinc-500 italic">// Real-time cursor from Sarah</span><br/>
                  app.<span className="text-cyan-400">listen</span>(<span className="text-amber-400">3000</span>, () =&gt; {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-blue-400">console</span>.<span className="text-cyan-400">log</span>(<span className="text-emerald-400">'Server running in flow...'</span><span className="border-l-[2px] border-indigo-500 animate-pulse ml-0.5"></span>);<br/>
                  {"});"}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Chat */}
          <div className="group relative flex flex-col overflow-hidden rounded-[32px] bg-zinc-950/50 border border-white/10 p-1 transition-all hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative flex h-full flex-col rounded-[28px] bg-zinc-950 p-8 pt-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 shadow-inner">
                  <Mic className="w-6 h-6 text-fuchsia-400" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Spatial Audio</h3>
              </div>
              <p className="text-zinc-400 text-base mb-10 leading-relaxed">
                Integrated audio channels linked to your working directory.
              </p>
              
              <div className="flex-1 flex flex-col gap-4 justify-end mt-auto">
                <div className="bg-zinc-900 border border-white/10 rounded-2xl p-4 flex items-center justify-between shadow-lg group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 text-white flex items-center justify-center font-bold text-sm shadow-inner">S</div>
                    <span className="font-medium text-white">Sarah</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center font-bold text-sm">M</div>
                    <span className="font-medium text-white">Mike</span>
                  </div>
                  <Mic className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Terminal */}
          <div className="group relative flex flex-col overflow-hidden rounded-[32px] bg-zinc-950/50 border border-white/10 p-1 transition-all hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative flex h-full flex-col rounded-[28px] bg-zinc-950 p-8 pt-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 shadow-inner">
                  <Terminal className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Cloud Terminal</h3>
              </div>
              <p className="text-zinc-400 text-base mb-10 leading-relaxed">
                Secure pty sessions mapped to your root. Run builds instantly.
              </p>
              
              <div className="flex-1 rounded-t-xl bg-zinc-900 border-x border-t border-white/10 shadow-2xl relative overflow-hidden flex flex-col mt-auto group-hover:-translate-y-2 transition-transform duration-500">
                <div className="h-10 border-b border-white/5 bg-zinc-900/50 flex items-center px-4 gap-2">
                  <div className="mx-auto text-[10px] font-medium text-zinc-500 font-mono tracking-widest uppercase">bash</div>
                </div>
                <div className="p-6 font-mono text-[13px] leading-loose text-zinc-300">
                  <div className="text-white font-semibold">$ npm run dev</div>
                  <div className="text-zinc-400 mt-3">VITE v4.3.2 ready in 320 ms</div>
                  <div className="mt-5 flex gap-3 text-zinc-300">
                    <span className="text-emerald-400 font-bold">➜</span>
                    <span className="font-semibold">Local:</span>
                    <span className="text-cyan-400 underline decoration-cyan-400/30 underline-offset-4">http://localhost:5173/</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Whiteboard (Spans 2 cols) */}
          <div className="md:col-span-2 group relative flex flex-col overflow-hidden rounded-[32px] bg-zinc-950/50 border border-white/10 p-1 transition-all hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative flex h-full flex-col rounded-[28px] bg-zinc-950 p-8 pt-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-white/10 shadow-inner">
                  <Layout className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Infinite Whiteboard</h3>
              </div>
              <p className="text-zinc-400 text-base mb-10 max-w-md leading-relaxed">
                Map out complex architecture, database schemas, and component trees visually before you ever write a single line of code.
              </p>
              
              <div className="flex-1 bg-zinc-900 border border-white/10 rounded-2xl p-10 flex items-center justify-center relative shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-0 grid-bg opacity-20" />
                <div className="flex items-center gap-12 w-full max-w-md relative z-10">
                  <div className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-5 text-center shadow-xl">
                    <div className="text-sm font-semibold text-white mb-1">Client</div>
                    <div className="text-[10px] text-zinc-400 font-mono">React App</div>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-zinc-600 relative flex items-center justify-center">
                    <div className="absolute bg-zinc-900 px-4 py-1 rounded-full border border-zinc-700 text-zinc-400 text-[10px] font-mono tracking-widest shadow-md">REST</div>
                  </div>
                  <div className="flex-1 bg-zinc-800 border border-white/10 rounded-xl p-5 text-center shadow-xl">
                    <div className="text-sm font-semibold text-white mb-1">Server</div>
                    <div className="text-[10px] text-zinc-400 font-mono">Node Engine</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </main>

      <footer className="border-t border-white/5 bg-[#030014] py-10 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-zinc-500 relative z-10 mt-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-xs text-black font-black shadow-lg">CF</div>
          <span className="font-bold text-white tracking-tight text-lg">CodeFlow</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-10 font-medium">
          <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-white cursor-pointer transition-colors">API Docs</span>
          <span className="hover:text-white cursor-pointer transition-colors">System Status</span>
        </div>
        <div className="font-medium">© 2026 CodeFlow. Crafted for Hackers.</div>
      </footer>
    </div>
  );
}
