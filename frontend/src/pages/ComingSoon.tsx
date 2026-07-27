import { Link } from "react-router-dom";
import { ArrowLeft, Rocket } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-[#030014] flex flex-col items-center justify-center p-6 text-white/90">
      <div className="absolute inset-0 bg-gradient-to-br from-white/10/10 via-transparent to-transparent/10 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col items-center max-w-md text-center">
        <div className="w-16 h-16 bg-zinc-900 border border-[#1E293B] rounded-2xl flex items-center justify-center mb-6 shadow-2xl">
          <Rocket className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4 tracking-tight">Coming Soon</h1>
        <p className="text-white/60 mb-8 leading-relaxed">
          We're working hard to bring this feature to life. Check back soon for updates!
        </p>

        <Link to="/">
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-[#1E293B] rounded-full transition-all text-sm font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
