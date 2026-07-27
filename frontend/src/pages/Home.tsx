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
    <div className="min-h-screen bg-[#080420] text-white/90 font-sans selection:bg-white/10/30 overflow-x-hidden relative">
      
      {/* Ambient Background Glows (Removed) */}

      {/* Navbar */}
      <header className="h-20 border-b border-[#1E293B] bg-[#080420]/50 backdrop-blur-xl sticky top-0 z-50 flex items-center justify-between px-6 lg:px-12 transition-all duration-300">
        <div className="flex items-center gap-3 cursor-pointer group">
          <img src="/logo.png" alt="CodeFlow Logo" className="h-9 w-auto scale-125 origin-left object-contain group-hover:scale-[1.3] transition-transform duration-300 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]" />
          <span className="text-white font-bold text-2xl tracking-tight">CodeFlow</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 hidden sm:flex">
            <div className="p-2 rounded-lg border border-[#1E293B] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all">
              <Bell className="w-4 h-4 text-white/60 hover:text-white" />
            </div>
            <div className="p-2 rounded-lg border border-[#1E293B] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all">
              <Settings className="w-4 h-4 text-white/60 hover:text-white" />
            </div>
          </div>
          <Link to="/docs">
            <button className="bg-white/10 hover:bg-white/20 border border-[#1E293B] text-white font-semibold px-5 py-2.5 rounded-lg transition-all duration-300 text-sm backdrop-blur-md">
              Documentation
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center relative z-10">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 py-28 flex flex-col items-center text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-[#1E293B] text-xs font-medium text-white mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(99,102,241,0.15)]">
            <span className="w-2 h-2 rounded-full bg-white/10 animate-pulse" />
            CodeFlow v2.0 is now live
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-tight drop-shadow-sm">
            Code in the Flow
          </h1>
          
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed font-light">
            The ultimate platform for developers to collaborate on architecture, write code, and run terminals in real-time. Zero latency, infinite creativity.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Link to={isAuthed ? "/dashboard" : "/signup"}>
              <button className="group bg-white/5 border border-[#1E293B] hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-300 backdrop-blur-md hover:-translate-y-1">
                {isAuthed ? "Go to Dashboard" : "Get Started Free"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className="bg-transparent border border-[#1E293B] hover:bg-white/5 text-white font-medium px-8 py-4 rounded-full flex items-center gap-3 transition-all duration-300 backdrop-blur-md hover:-translate-y-1">
              <Play className="w-5 h-5 text-white" /> Watch Demo
            </button>
          </div>
        </section>

        {/* Feature Grid - Premium Bento Style */}
        <section className="w-full max-w-6xl mx-auto px-6 py-24 grid grid-cols-1 md:grid-cols-3 gap-6 border-y border-[#1E293B] mt-12 bg-white/[0.02]">
          
          {/* Shared Editor (Spans 2 cols) */}
          <div className="md:col-span-2 group relative flex flex-col overflow-hidden rounded-[32px] bg-zinc-950/50 border border-[#1E293B] p-1 transition-all hover:border-[#334155]">
            {/* Subtle Hover Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative flex h-full flex-col rounded-[28px] bg-zinc-950 p-8 pt-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-[#1E293B] shadow-inner">
                  <FileCode2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Multi-player Editor</h3>
              </div>
              <p className="text-white/60 text-base mb-10 max-w-md leading-relaxed">
                True zero-latency collaborative typing. See your team's cursors fly across the screen with framework-aware syntax highlighting.
              </p>
              
              {/* Mockup Window */}
              <div className="flex-1 rounded-t-xl bg-zinc-900 border-x border-t border-[#1E293B] shadow-2xl relative overflow-hidden flex flex-col mt-auto group-hover:-translate-y-2 transition-transform duration-500">
                <div className="h-10 border-b border-[#1E293B] bg-zinc-900/50 flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-white/10/80"></div>
                  <div className="mx-auto text-[10px] font-medium text-white/50 font-mono tracking-widest uppercase">server.js</div>
                </div>
                <div className="p-6 font-mono text-[13px] leading-loose text-white/80">
                  <span className="text-white">const</span> <span className="text-white">express</span> = <span className="text-white">require</span>(<span className="text-white">'express'</span>);<br/>
                  <span className="text-white">const</span> <span className="text-white">app</span> = <span className="text-white">express</span>();<br/><br/>
                  <span className="text-white/50 italic">// Real-time cursor from Sarah</span><br/>
                  app.<span className="text-white">listen</span>(<span className="text-amber-400">3000</span>, () =&gt; {"{"}<br/>
                  &nbsp;&nbsp;<span className="text-white">console</span>.<span className="text-white">log</span>(<span className="text-white">'Server running in flow...'</span><span className="border-l-[2px] border-[#1E293B] animate-pulse ml-0.5"></span>);<br/>
                  {"});"}
                </div>
              </div>
            </div>
          </div>

          {/* Voice Chat */}
          <div className="group relative flex flex-col overflow-hidden rounded-[32px] bg-zinc-950/50 border border-[#1E293B] p-1 transition-all hover:border-[#334155]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative flex h-full flex-col rounded-[28px] bg-zinc-950 p-8 pt-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-[#1E293B] shadow-inner">
                  <Mic className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Spatial Audio</h3>
              </div>
              <p className="text-white/60 text-base mb-10 leading-relaxed">
                Integrated audio channels linked to your working directory.
              </p>
              
              <div className="flex-1 flex flex-col gap-4 justify-end mt-auto">
                <div className="bg-zinc-900 border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between shadow-lg group-hover:-translate-y-1 transition-transform duration-300">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/10 to-transparent text-white flex items-center justify-center font-bold text-sm shadow-inner">S</div>
                    <span className="font-medium text-white">Sarah</span>
                  </div>
                  <div className="w-2.5 h-2.5 rounded-full bg-white/10 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"></div>
                </div>
                <div className="bg-zinc-900/50 border border-[#1E293B] rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4 opacity-50">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 text-white/60 flex items-center justify-center font-bold text-sm">M</div>
                    <span className="font-medium text-white">Mike</span>
                  </div>
                  <Mic className="w-4 h-4 text-zinc-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Terminal */}
          <div className="group relative flex flex-col overflow-hidden rounded-[32px] bg-zinc-950/50 border border-[#1E293B] p-1 transition-all hover:border-[#334155]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative flex h-full flex-col rounded-[28px] bg-zinc-950 p-8 pt-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-[#1E293B] shadow-inner">
                  <Terminal className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Cloud Terminal</h3>
              </div>
              <p className="text-white/60 text-base mb-10 leading-relaxed">
                Secure pty sessions mapped to your root. Run builds instantly.
              </p>
              
              <div className="flex-1 rounded-t-xl bg-zinc-900 border-x border-t border-[#1E293B] shadow-2xl relative overflow-hidden flex flex-col mt-auto group-hover:-translate-y-2 transition-transform duration-500">
                <div className="h-10 border-b border-[#1E293B] bg-zinc-900/50 flex items-center px-4 gap-2">
                  <div className="mx-auto text-[10px] font-medium text-white/50 font-mono tracking-widest uppercase">bash</div>
                </div>
                <div className="p-6 font-mono text-[13px] leading-loose text-white/80">
                  <div className="text-white font-semibold">$ npm run dev</div>
                  <div className="text-white/60 mt-3">VITE v4.3.2 ready in 320 ms</div>
                  <div className="mt-5 flex gap-3 text-white/80">
                    <span className="text-white font-bold">➜</span>
                    <span className="font-semibold">Local:</span>
                    <span className="text-white underline decoration-cyan-400/30 underline-offset-4">http://localhost:5173/</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-time Whiteboard (Spans 2 cols) */}
          <div className="md:col-span-2 group relative flex flex-col overflow-hidden rounded-[32px] bg-zinc-950/50 border border-[#1E293B] p-1 transition-all hover:border-[#334155]">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10/10 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative flex h-full flex-col rounded-[28px] bg-zinc-950 p-8 pt-10 overflow-hidden">
              <div className="flex items-center gap-4 mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-900 border border-[#1E293B] shadow-inner">
                  <Layout className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white tracking-tight">Infinite Whiteboard</h3>
              </div>
              <p className="text-white/60 text-base mb-10 max-w-md leading-relaxed">
                Map out complex architecture, database schemas, and component trees visually before you ever write a single line of code.
              </p>
              
              <div className="flex-1 bg-zinc-900 border border-[#1E293B] rounded-2xl p-10 flex items-center justify-center relative shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                <div className="absolute inset-0 grid-bg opacity-20" />
                <div className="flex items-center gap-12 w-full max-w-md relative z-10">
                  <div className="flex-1 bg-zinc-800 border border-[#1E293B] rounded-xl p-5 text-center shadow-xl">
                    <div className="text-sm font-semibold text-white mb-1">Client</div>
                    <div className="text-[10px] text-white/60 font-mono">React App</div>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-zinc-600 relative flex items-center justify-center">
                    <div className="absolute bg-zinc-900 px-4 py-1 rounded-full border border-zinc-700 text-white/60 text-[10px] font-mono tracking-widest shadow-md">REST</div>
                  </div>
                  <div className="flex-1 bg-zinc-800 border border-[#1E293B] rounded-xl p-5 text-center shadow-xl">
                    <div className="text-sm font-semibold text-white mb-1">Server</div>
                    <div className="text-[10px] text-white/60 font-mono">Node Engine</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </section>
      </main>

      <footer className="border-t border-[#1E293B] bg-[#080420] py-10 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-white/50 relative z-10 mt-12">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="CodeFlow Logo" className="h-8 w-auto scale-125 origin-left object-contain drop-shadow-md" />
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
