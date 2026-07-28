import React, { useState, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VoiceAssistantControlBar,
  useConnectionState,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { fetchJson } from '@/lib/api';
import { Mic, PhoneOff, Phone, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const VoiceChat = ({ roomCode }: { roomCode: string }) => {
  const [token, setToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connectToVoice = async () => {
    try {
      setConnecting(true);
      // Fetch token from our backend
      const data = await fetchJson(`/api/voice/token?roomCode=${roomCode}`);
      if (data.token) {
        setToken(data.token);
      } else {
        throw new Error('No token returned');
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to connect to voice chat. Check API credentials.');
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setToken(null);
  };

  if (!token) {
    return (
      <button
        onClick={connectToVoice}
        disabled={connecting}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors"
        style={{
          background: 'var(--bg-raised)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
        }}
      >
        {connecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
        Voice Chat
      </button>
    );
  }

  // Uses LIVEKIT_URL which we will inject via Vite env vars, or just hardcode the URL for now since it's safe
  const liveKitUrl = 'wss://peerpod-k31z59iy.livekit.cloud';

  return (
    <LiveKitRoom
      video={false}
      audio={true}
      token={token}
      serverUrl={liveKitUrl}
      connect={true}
      onDisconnected={disconnect}
      className="flex items-center gap-2"
    >
      <div className="flex items-center gap-2 px-2 py-1 rounded-md" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <RoomAudioRenderer />
        <VoiceAssistantControlBar />
        <button
          onClick={disconnect}
          className="p-1.5 rounded-md hover:bg-red-500/20 text-red-400 transition-colors"
          title="Leave voice"
        >
          <PhoneOff className="w-4 h-4" />
        </button>
      </div>
    </LiveKitRoom>
  );
};
