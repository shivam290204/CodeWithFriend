import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Play, Terminal, Mic, Layout, Database, Settings, Bell, Server, FileCode2 } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0F111A] text-[#E2E8F0] font-sans selection:bg-[#6366F1] selection:text-white flex flex-col">
      {/* Navbar */}
      <header className="h-16 border-b border-[#1E293B] bg-[#0F111A]/90 backdrop-blur sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 bg-[#6366F1] rounded flex items-center justify-center text-xs text-white font-bold">CF</div>
          <span className="text-white font-bold text-xl tracking-tight">CodeFlow</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link to="/dashboard" className="text-white">Dashboard</Link>
          <span className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">Marketplace</span>
          <span className="text-[#94A3B8] hover:text-white cursor-pointer transition-colors">Documentation</span>
        </nav>

        <div className="flex items-center gap-5">
          <Bell className="w-5 h-5 text-[#94A3B8] hover:text-white cursor-pointer transition-colors hidden sm:block" />
          <Settings className="w-5 h-5 text-[#94A3B8] hover:text-white cursor-pointer transition-colors hidden sm:block" />
          <Link to="/dashboard">
            <button className="bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-semibold px-4 py-2 rounded transition-colors text-sm">
              Create Room
            </button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20 flex flex-col items-center text-center mt-10">
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 tracking-tight">
            Code in the Flow
          </h1>
          
          <p className="text-[#94A3B8] text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            The best platform for developers to collaborate on code and projects in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link to="/signup">
              <button className="bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-semibold px-6 py-3 rounded flex items-center gap-2 transition-colors">
                Get Started <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <button className="bg-[#0F111A] border border-[#334155] hover:bg-[#1E293B] text-white font-semibold px-6 py-3 rounded flex items-center gap-2 transition-colors">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="w-full max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Shared Editor (Spans 2 cols) */}
          <div className="lg:col-span-2 bg-[#151822] border border-[#1E293B] rounded-xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#1E293B] rounded-lg">
                <FileCode2 className="w-5 h-5 text-[#60A5FA]" />
              </div>
              <h3 className="text-lg font-bold text-white">Shared Editor</h3>
            </div>
            <p className="text-[#94A3B8] text-sm mb-6">
              Experience zero-latency collaborative typing with intelligent syntax highlighting optimized for MERN.
            </p>
            <div className="flex-1 bg-[#0F111A] border border-[#1E293B] rounded-lg p-4 font-mono text-xs overflow-hidden relative">
              <div className="flex gap-2 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
                <span className="ml-auto text-[#475569] text-[10px]">server.js</span>
              </div>
              <div className="text-[#94A3B8] leading-loose">
                <span className="text-[#60A5FA]">const</span> express = <span className="text-[#C084FC]">require</span>(<span className="text-[#34D399]">'express'</span>);<br/>
                <span className="text-[#60A5FA]">const</span> app = express();<br/>
                <span className="text-[#475569]">// Real-time cursor from Sarah</span><br/>
                app.<span className="text-[#60A5FA]">listen</span>(<span className="text-[#F87171]">3000</span>, () =&gt; {"{"}<br/>
                &nbsp;&nbsp;console.<span className="text-[#60A5FA]">log</span>(<span className="text-[#34D399]">'Server running in flow...'</span><span className="border-l-2 border-[#34D399] animate-pulse"></span>);<br/>
                {"});"}
              </div>
            </div>
          </div>

          {/* Voice Chat */}
          <div className="bg-[#151822] border border-[#1E293B] rounded-xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#1E293B] rounded-lg">
                <Mic className="w-5 h-5 text-[#34D399]" />
              </div>
              <h3 className="text-lg font-bold text-white">Voice Chat</h3>
            </div>
            <p className="text-[#94A3B8] text-sm mb-6">
              Integrated spatial audio channels linked directly to your active working directory.
            </p>
            <div className="flex-1 flex flex-col gap-3 justify-end mt-12">
              <div className="bg-[#0F111A] border border-[#1E293B] rounded p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#BFDBFE] text-[#1E3A8A] flex items-center justify-center text-[10px] font-bold">S</div>
                  <span className="text-xs text-[#E2E8F0]">Sarah</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-[#34D399]"></div>
              </div>
              <div className="bg-[#0F111A] border border-[#1E293B] rounded p-3 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#E9D5FF] text-[#581C87] flex items-center justify-center text-[10px] font-bold">M</div>
                  <span className="text-xs text-[#E2E8F0]">Mike</span>
                </div>
                <Mic className="w-3 h-3 text-[#475569]" />
              </div>
            </div>
          </div>

          {/* Integrated Terminal */}
          <div className="bg-[#151822] border border-[#1E293B] rounded-xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#1E293B] rounded-lg">
                <Terminal className="w-5 h-5 text-[#A78BFA]" />
              </div>
              <h3 className="text-lg font-bold text-white">Integrated Terminal</h3>
            </div>
            <p className="text-[#94A3B8] text-sm mb-6">
              Secure, containerized pty sessions mapped to your project root.
            </p>
            <div className="mt-auto bg-[#0F111A] border border-[#1E293B] rounded-lg p-4 font-mono text-[11px] leading-relaxed">
              <div className="text-[#34D399]">$ npm run dev</div>
              <div className="text-[#475569]">VITE v4.3.2 ready in 320 ms</div>
              <div className="mt-2 text-[#94A3B8] flex gap-2">
                <span className="text-white">➜</span>
                <span>Local:</span>
                <span className="text-[#60A5FA]">http://localhost:5173/</span>
              </div>
            </div>
          </div>

          {/* Real-time Whiteboard (Spans 2 cols) */}
          <div className="lg:col-span-2 bg-[#151822] border border-[#1E293B] rounded-xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[#1E293B] rounded-lg">
                <Layout className="w-5 h-5 text-[#F472B6]" />
              </div>
              <h3 className="text-lg font-bold text-white">Real-time Whiteboard</h3>
            </div>
            <p className="text-[#94A3B8] text-sm mb-6 max-w-xl">
              Map out architecture, database schemas, and component trees visually before writing a single line of code.
            </p>
            <div className="flex-1 bg-[#0F111A] border border-[#1E293B] rounded-lg p-6 flex items-center justify-center">
              <div className="flex items-center gap-8 w-full max-w-md opacity-80">
                <div className="border border-[#475569] rounded p-3 text-xs text-[#94A3B8] font-mono">React App</div>
                <div className="flex-1 border-t border-dashed border-[#475569] relative flex items-center justify-center">
                  <div className="absolute bg-[#0F111A] px-2 text-[#475569] text-xs font-mono">⇄</div>
                </div>
                <div className="border border-[#34D399] rounded p-3 text-xs text-[#34D399] font-mono">MongoDB</div>
              </div>
            </div>
          </div>

        </section>

        {/* Stack Section */}
        
      </main>

      <footer className="border-t border-[#1E293B] py-6 px-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#475569]">
        <div className="font-bold text-white text-sm">CodeFlow</div>
        <div className="flex items-center gap-6">
          <span className="hover:text-[#94A3B8] cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-[#94A3B8] cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-[#94A3B8] cursor-pointer transition-colors">API Docs</span>
          <span className="hover:text-[#94A3B8] cursor-pointer transition-colors">System Status</span>
        </div>
        <div>© 2026 CodeFlow. Built for the Coding Community.</div>
      </footer>
    </div>
  );
}
