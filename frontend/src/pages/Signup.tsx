import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (res.ok) {
        navigate('/dashboard');
      } else {
        toast.error('Signup failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0F111A] text-[#E2E8F0] font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Left Pane */}
      <div className="hidden lg:flex flex-1 relative bg-[#0B0C10] border-r border-[#1E293B] items-center justify-center overflow-hidden grid-bg">
        {/* Logo Top Left */}
        <div className="absolute top-8 left-10 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#6366F1] rounded flex items-center justify-center text-sm text-white font-bold">CF</div>
          <span className="text-white font-bold text-2xl tracking-tight">CodeFlow</span>
        </div>
        
        {/* Code Snippet Card (Aesthetic) */}
        <div className="bg-[#151822] border border-[#1E293B] rounded-xl shadow-2xl w-[450px] overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
          <div className="h-10 border-b border-[#1E293B] flex items-center px-4 bg-[#0F111A]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F87171]"></div>
              <div className="w-3 h-3 rounded-full bg-[#34D399]"></div>
              <div className="w-3 h-3 rounded-full bg-[#60A5FA]"></div>
            </div>
            <span className="ml-4 text-xs font-mono text-[#94A3B8]">user_model.ts</span>
          </div>
          <div className="p-6 font-mono text-sm leading-relaxed text-[#94A3B8]">
            <span className="text-[#C084FC]">import</span> {"{ Schema, model }"} <span className="text-[#C084FC]">from</span> <span className="text-[#34D399]">'mongoose'</span>;<br/><br/>
            <span className="text-[#60A5FA]">const</span> UserSchema = <span className="text-[#C084FC]">new</span> Schema({"{\n"}
            &nbsp;&nbsp;name: {"{ type: "}<span className="text-[#60A5FA]">String</span>{", required: "}<span className="text-[#34D399]">true</span>{" },\n"}
            &nbsp;&nbsp;email: {"{ type: "}<span className="text-[#60A5FA]">String</span>{", required: "}<span className="text-[#34D399]">true</span>{", unique: "}<span className="text-[#34D399]">true</span>{" },\n"}
            &nbsp;&nbsp;password: {"{ type: "}<span className="text-[#60A5FA]">String</span>{", required: "}<span className="text-[#34D399]">true</span>{" },\n"}
            &nbsp;&nbsp;createdAt: {"{ type: "}<span className="text-[#60A5FA]">Date</span>{", default: "}<span className="text-[#E2E8F0]">Date</span>.now{" }\n"}
            {"});\n\n"}
            <span className="text-[#C084FC]">export default</span> model(<span className="text-[#34D399]">'User'</span>, UserSchema);
          </div>
        </div>
      </div>

      {/* Right Pane */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-12 relative">
        <Link to="/" className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <div className="w-6 h-6 bg-[#6366F1] rounded flex items-center justify-center text-xs text-white font-bold">CF</div>
          <span className="text-white font-bold text-lg tracking-tight">CodeFlow</span>
        </Link>
        
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-[#94A3B8] text-sm">Join CodeFlow and start collaborating.</p>
          </div>

          {/* Toggle Pills */}
          <div className="flex bg-[#151822] border border-[#1E293B] p-1 rounded-lg mb-8">
            <Link to="/login" className="flex-1 py-2 text-sm font-semibold rounded-md text-[#94A3B8] hover:text-white text-center transition-colors">
              Login
            </Link>
            <button className="flex-1 py-2 text-sm font-semibold rounded-md bg-[#1E293B] text-white shadow">
              Signup
            </button>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input 
                  type="text"
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-md py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-colors" 
                  placeholder="Jane Doe" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input 
                  type="email"
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-md py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-colors" 
                  placeholder="dev@company.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  required 
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-white">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#475569]" />
                <input 
                  type="password"
                  className="w-full bg-[#1E293B] border border-[#334155] rounded-md py-2.5 pl-10 pr-4 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#6366F1] transition-colors" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
            </div>

            <button className="mt-2 w-full bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-bold py-3 rounded-md flex items-center justify-center gap-2 transition-colors">
              Create Account <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-[#1E293B]"></div>
            <span className="text-xs text-[#94A3B8] font-medium">Or signup with</span>
            <div className="flex-1 h-px bg-[#1E293B]"></div>
          </div>

          <div className="flex gap-4">
            <button className="flex-1 bg-[#0F111A] border border-[#1E293B] hover:bg-[#1E293B] text-white py-2.5 rounded-md flex items-center justify-center gap-2 text-sm transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg> GitHub
            </button>
            <button className="flex-1 bg-[#0F111A] border border-[#1E293B] hover:bg-[#1E293B] text-white py-2.5 rounded-md flex items-center justify-center gap-2 text-sm transition-colors">
              <div className="w-4 h-4 flex items-center justify-center bg-white rounded-full">
                <svg className="w-3 h-3" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
              Google
            </button>
          </div>
          
          <p className="text-center text-[#475569] text-xs mt-10">
            By entering, you agree to the <span className="text-[#94A3B8] cursor-pointer">Terms of Service</span> & <span className="text-[#94A3B8] cursor-pointer">Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
}
