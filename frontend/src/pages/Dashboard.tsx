import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Settings, User, Bell, LayoutDashboard, Store, BookOpen, Folder, Search, GitBranch, Users, Bug, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export default function Dashboard() {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState('');
  const [folderName, setFolderName] = useState('');

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

  const handleCreateFolder = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = folderName.trim() || 'New Folder';
    try {
      const data = await import('@/lib/api').then(m => m.fetchJson<{roomCode: string}>('/api/rooms', {
        method: 'POST',
        body: JSON.stringify({ name: finalName, language: 'javascript' })
      }));
      toast.success(`Created folder ${data.roomCode}`);
      navigate(`/room/${data.roomCode}`);
    } catch (err: any) {
      if (err.message && err.message.includes('401')) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        import('@/lib/api').then(m => toast.error(m.getApiErrorMessage(err, 'Failed to create folder')));
      }
    }
  };

  return (
    <div className="flex h-screen bg-[#080420] text-[#E2E8F0] font-sans selection:bg-[#6366F1] selection:text-white">
      {/* Left Sidebar (Appears disabled/faded out based on mockup context, but present) */}
      <div className="w-[250px] border-r border-[#1E293B] bg-[#0c0630] flex flex-col hidden md:flex shrink-0">
        <div className="h-14 flex items-center px-4 border-b border-[#1E293B] cursor-pointer">
          <div className="flex items-center gap-4">
            <Link to="/" title="Back to Home" className="text-[#94A3B8] hover:text-white transition-colors bg-[#1E293B] hover:bg-[#334155] p-1.5 rounded-md flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity">
              <img src="/logo.png" alt="CodeFlow" className="h-7 w-auto scale-125 origin-left object-contain" />
              CodeFlow
            </Link>
          </div>
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
      <div className="flex-1 flex flex-col h-full bg-[#080420]">
        {/* Top Navbar */}
        <header className="h-14 border-b border-[#1E293B] bg-[#080420] flex justify-between items-center px-6 sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-8">
            <div className="md:hidden flex items-center gap-4">
              <Link to="/" title="Back to Home" className="text-[#94A3B8] hover:text-white transition-colors bg-[#1E293B] hover:bg-[#334155] p-1.5 rounded-md flex items-center justify-center">
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <Link to="/" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity">
                <img src="/logo.png" alt="CodeFlow" className="h-7 w-auto scale-125 origin-left object-contain" />
                CodeFlow
              </Link>
            </div>

          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 hidden sm:flex">
              <div className="p-2 rounded-lg border border-[#1E293B] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all">
                <Bell className="w-4 h-4 text-white/60 hover:text-white" />
              </div>
              <div className="p-2 rounded-lg border border-[#1E293B] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all">
                <Settings className="w-4 h-4 text-white/60 hover:text-white" />
              </div>
              <div className="p-2 rounded-lg border border-[#1E293B] bg-white/[0.02] hover:bg-white/[0.05] cursor-pointer transition-all">
                <User className="w-4 h-4 text-white/60 hover:text-white" />
              </div>
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
              <button onClick={() => handleCreateFolder()} className="sm:hidden bg-white/10 hover:bg-white/20 border border-[#1E293B] text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors">
                <Plus className="w-4 h-4" /> Create Folder
              </button>
              <button onClick={() => handleCreateFolder()} className="hidden sm:flex bg-white/10 hover:bg-white/20 border border-[#1E293B] text-white font-semibold px-5 py-2.5 rounded-lg items-center gap-2 text-sm transition-colors">
                <Plus className="w-4 h-4" /> Create Folder
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Join Session Card */}
              <div className="bg-[#151822] border border-[#1E293B] rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10/5 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-[#60A5FA]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Join Folder</h2>
                </div>
                <p className="text-[#94A3B8] text-sm mb-6 max-w-sm">
                  Enter a folder code provided by your team lead to instantly sync your workspace.
                </p>
                <form onSubmit={handleJoin} className="flex gap-3">
                  <input
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter the code"
                    className="flex-1 bg-white text-black font-mono px-4 py-2.5 rounded shadow-inner outline-none border-2 border-transparent focus:border-[#60A5FA] transition-colors text-sm"
                  />
                  <button type="submit" className="bg-white/10 hover:bg-white/20 border border-[#1E293B] text-white font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
                    Join
                  </button>
                </form>
              </div>

              {/* Create New Folder Card */}
              <div className="bg-[#151822] border border-[#1E293B] rounded-xl p-6 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10/5 rounded-full blur-3xl"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-[#34D399]">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Create New Folder</h2>
                </div>
                <p className="text-[#94A3B8] text-sm mb-6 max-w-sm">
                  Start a fresh collaborative project environment.
                </p>

                <form onSubmit={handleCreateFolder} className="flex flex-col gap-3">
                  <input
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter Folder Name"
                    className="w-full bg-white text-black font-mono px-4 py-2.5 rounded shadow-inner outline-none border-2 border-transparent focus:border-[#60A5FA] transition-colors text-sm"
                  />
                  <button type="submit" className="w-full bg-white/10 hover:bg-white/20 border border-[#1E293B] text-white font-semibold py-2.5 rounded-lg transition-colors text-sm">
                    Create Folder
                  </button>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
