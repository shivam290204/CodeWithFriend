import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Settings, User, Bell, LayoutDashboard, Store, BookOpen, Folder, Search, GitBranch, Users, Bug, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    navigate(`/room/${joinCode.trim().toUpperCase()}`);
  };

  useEffect(() => {
    import('@/lib/api').then(({ probeAuth }) => {
      probeAuth().then(isAuthed => {
        if (!isAuthed) {
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        }
      });
    });
  }, [navigate]);

  const handleCreate = async () => {
    try {
      const data = await import('@/lib/api').then(m => m.fetchJson<{roomCode: string}>('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Session', language: 'javascript' })
      }));
      toast.success(`Created room ${data.roomCode}`);
      navigate(`/room/${data.roomCode}`);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        import('@/lib/api').then(m => toast.error(m.getApiErrorMessage(err, 'Failed to create room')));
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#0F111A] text-[#E2E8F0] font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Left Sidebar (Appears disabled/faded out based on mockup context, but present) */}
      <div className="w-[250px] border-r border-[#1E293B] bg-[#0B0C10] flex flex-col hidden md:flex shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-[#1E293B] cursor-pointer">
          <div className="flex items-center gap-4">
            <Link to="/" title="Back to Home" className="text-[#94A3B8] hover:text-white transition-colors bg-[#1E293B] hover:bg-[#334155] p-1.5 rounded-md flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 bg-[#6366F1] rounded flex items-center justify-center text-xs text-white">CF</div>
              CodeFlow
            </Link>
          </div>
        </div>
        
        <div className="p-4 border-b border-[#1E293B] bg-[#1E293B]/20">
          <h2 className="text-sm font-semibold text-white mb-1">Project Alpha</h2>
          <p className="text-xs text-[#94A3B8]">main branch</p>
          <button className="mt-4 w-full flex items-center justify-center gap-2 py-1.5 bg-[#1E293B] hover:bg-[#334155] rounded border border-[#334155] text-sm text-[#E2E8F0] transition-colors">
            <Plus className="w-4 h-4" /> New File
          </button>
        </div>

        <div className="flex-1 py-2 overflow-y-auto">
          <div className="px-4 py-2 flex items-center gap-3 text-sm text-[#94A3B8] hover:text-white cursor-pointer hover:bg-[#1E293B]/50 transition-colors">
            <Folder className="w-4 h-4" /> Explorer
          </div>
          <div className="px-4 py-2 flex items-center gap-3 text-sm text-[#94A3B8] hover:text-white cursor-pointer hover:bg-[#1E293B]/50 transition-colors">
            <Search className="w-4 h-4" /> Search
          </div>
          <div className="px-4 py-2 flex items-center gap-3 text-sm text-[#94A3B8] hover:text-white cursor-pointer hover:bg-[#1E293B]/50 transition-colors">
            <GitBranch className="w-4 h-4" /> Git
          </div>
          <div className="px-4 py-2 flex items-center gap-3 text-sm text-white bg-[#1E293B] border-l-2 border-[#6366F1] cursor-pointer">
            <Users className="w-4 h-4 text-[#818CF8]" /> Collab
          </div>
          <div className="px-4 py-2 flex items-center gap-3 text-sm text-[#94A3B8] hover:text-white cursor-pointer hover:bg-[#1E293B]/50 transition-colors">
            <Bug className="w-4 h-4" /> Debug
          </div>
        </div>

        <div className="py-2 border-t border-[#1E293B]">
          <div className="px-4 py-2 flex items-center gap-3 text-sm text-[#94A3B8] hover:text-white cursor-pointer hover:bg-[#1E293B]/50 transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </div>
          <div className="px-4 py-2 flex items-center gap-3 text-sm text-[#94A3B8] hover:text-white cursor-pointer hover:bg-[#1E293B]/50 transition-colors">
            <User className="w-4 h-4" /> User
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full bg-[#0F111A]">
        {/* Top Navbar */}
        <header className="h-14 border-b border-[#1E293B] bg-[#0F111A] flex justify-between items-center px-6 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="md:hidden flex items-center gap-4">
              <Link to="/" title="Back to Home" className="text-[#94A3B8] hover:text-white transition-colors bg-[#1E293B] hover:bg-[#334155] p-1.5 rounded-md flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity">
                <div className="w-6 h-6 bg-[#6366F1] rounded flex items-center justify-center text-xs">CF</div>
                CodeFlow
              </Link>
            </div>
            <nav className="hidden sm:flex gap-6 text-sm">
              <span className="text-white border-b-2 border-[#6366F1] pb-[17px] pt-[19px] cursor-pointer">Dashboard</span>
              <span className="text-[#94A3B8] hover:text-white cursor-pointer py-[18px] transition-colors">Marketplace</span>
              <span className="text-[#94A3B8] hover:text-white cursor-pointer py-[18px] transition-colors">Documentation</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleCreate} className="hidden sm:block bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-semibold px-4 py-1.5 rounded text-sm transition-colors">
              Create Room
            </button>
            <Bell className="w-5 h-5 text-[#94A3B8] hover:text-white cursor-pointer transition-colors" />
            <Settings className="w-5 h-5 text-[#94A3B8] hover:text-white cursor-pointer transition-colors" />
            <div className="w-7 h-7 rounded-full bg-[#334155] border border-[#475569] flex items-center justify-center overflow-hidden cursor-pointer">
              <User className="w-4 h-4 text-[#94A3B8]" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-8 lg:p-12">
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-start mb-10">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, Developer.</h1>
                <p className="text-[#94A3B8] text-sm">Ready to jump into a collaboration session?</p>
              </div>
              <button onClick={handleCreate} className="sm:hidden bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-semibold px-4 py-2 rounded flex items-center gap-2 text-sm transition-colors">
                <Plus className="w-4 h-4" /> Create Room
              </button>
              <button onClick={handleCreate} className="hidden sm:flex bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-semibold px-5 py-2.5 rounded-lg items-center gap-2 text-sm transition-colors shadow-[0_0_15px_rgba(191,219,254,0.15)]">
                <Plus className="w-4 h-4" /> Create Room
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Join Session Card */}
              <div className="bg-[#151822] border border-[#1E293B] rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-[#60A5FA]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Join Session</h2>
                </div>
                <p className="text-[#94A3B8] text-sm mb-6 max-w-sm">
                  Enter a room code provided by your team lead or collaborator to instantly sync your editor.
                </p>
                <form onSubmit={handleJoin} className="flex gap-3">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. xY7-kP2-mN9"
                    className="flex-1 bg-white text-black font-mono px-4 py-2.5 rounded shadow-inner outline-none border-2 border-transparent focus:border-[#60A5FA] transition-colors text-sm"
                  />
                  <button type="submit" className="bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-semibold px-6 py-2.5 rounded transition-colors text-sm">
                    Join
                  </button>
                </form>
              </div>

              {/* Create New Room Card */}
              <div className="bg-[#151822] border border-[#1E293B] rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-[#34D399]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Create New Room</h2>
                </div>
                <p className="text-[#94A3B8] text-sm mb-6 max-w-sm">
                  Start a fresh collaboration environment. You can select your language inside the room.
                </p>

                <button onClick={handleCreate} className="w-full bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-semibold py-2.5 rounded transition-colors text-sm">
                  Create Room
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
