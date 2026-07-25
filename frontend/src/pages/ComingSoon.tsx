import { Link } from "react-router-dom";
import { ArrowLeft, Rocket } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6 text-slate-200">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-fuchsia-500/10 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md text-center">
        <div className="w-16 h-16 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
          <Rocket className="w-8 h-8 text-indigo-400" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Coming Soon</h1>
        <p className="text-zinc-400 mb-8 leading-relaxed">
          We're working hard to bring this feature to life. Check back soon for updates!
        </p>

        <Link to="/">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
