import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Docs() {
  return (
    <div className="min-h-screen bg-[#080420] text-white font-sans overflow-x-hidden selection:bg-white/20">
      <div className="max-w-4xl mx-auto px-6 py-20 relative z-10">
        
        {/* Header */}
        <Link to="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-12 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">Documentation</h1>
        <p className="text-xl text-white/60 mb-16 border-b border-[#1E293B] pb-8">
          Everything you need to know about the PeerPod project and its architecture.
        </p>

        {/* Content Sections */}
        <div className="space-y-16">
          
          <section className="space-y-6">
            <h2 className="text-2xl font-semibold border-l-2 border-white/20 pl-4">About the Project</h2>
            <p className="text-white/70 leading-relaxed text-lg">
              PeerPod is a collaborative, real-time code editor designed to connect developers across the globe. Built for high performance and minimal latency, it allows multiple users to edit, compile, and execute code simultaneously within the same session.
            </p>
            <p className="text-white/70 leading-relaxed text-lg">
              Our mission is to eliminate the friction of technical interviews, pair programming, and remote debugging by providing a seamless, instantly accessible coding environment directly in the browser.
            </p>
          </section>

          <section className="space-y-6">
            <h2 className="text-2xl font-semibold border-l-2 border-white/20 pl-4">Core Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 border border-[#1E293B] bg-white/[0.02] rounded-lg">
                <h3 className="text-lg font-medium mb-2">Real-time Synchronization</h3>
                <p className="text-white/60 text-sm">Experience zero-latency typing and cursor tracking using advanced WebSocket architecture and operational transformation algorithms.</p>
              </div>
              <div className="p-6 border border-[#1E293B] bg-white/[0.02] rounded-lg">
                <h3 className="text-lg font-medium mb-2">Multi-language Execution</h3>
                <p className="text-white/60 text-sm">Safely compile and execute code across multiple languages including JavaScript, Python, C++, and Go within isolated sandboxes.</p>
              </div>
              <div className="p-6 border border-[#1E293B] bg-white/[0.02] rounded-lg">
                <h3 className="text-lg font-medium mb-2">Secure Authentication</h3>
                <p className="text-white/60 text-sm">Robust security model utilizing JWTs for stateless, secure session management and access control.</p>
              </div>
              <div className="p-6 border border-[#1E293B] bg-white/[0.02] rounded-lg">
                <h3 className="text-lg font-medium mb-2">Minimalist Design</h3>
                <p className="text-white/60 text-sm">A distraction-free, high-contrast monochrome interface designed strictly to keep your focus on the code.</p>
              </div>
            </div>
          </section>


          <section className="space-y-6">
            <h2 className="text-2xl font-semibold border-l-2 border-white/20 pl-4">Technical Stack</h2>
            <div className="space-y-4 text-white/70">
              <p>The platform is engineered using the MERN stack and modern technologies:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Database:</strong> MongoDB</li>
                <li><strong>Backend:</strong> Express.js & Node.js</li>
                <li><strong>Frontend:</strong> React.js (with Tailwind CSS)</li>
                <li><strong>Real-time:</strong> Socket.IO</li>
              </ul>
            </div>
          </section>

        </div>
        
        {/* Footer */}
        <div className="mt-24 pt-8 border-t border-[#1E293B] text-center text-white/40 text-sm">
          PeerPod Platform. All systems operational.
        </div>
      </div>
    </div>
  );
}
