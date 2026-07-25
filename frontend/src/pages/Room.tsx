// @ts-nocheck



import { Link } from "react-router-dom";
import { useNavigate as useRouter, useParams } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";
// @ts-ignore


import Whiteboard from "@/components/Whiteboard";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { MonacoBinding } from "y-monaco";
import * as monaco from "monaco-editor";
import { ArrowLeft, Users, MessageSquare, Code2, Play, Terminal, Square, X, Send, Check, Copy, Mic, MicOff, Palette, Type, Keyboard, FileInput, Download, PenTool, Folder, Search, Settings, Share, ChevronDown, FileCode, Sun, Bell, User, GitBranch, Bug } from "lucide-react";
import { toast } from "sonner";
import { fetchJson, getApiErrorMessage, getWsBase, readStoredName } from "@/lib/api";

import MonacoEditor from "@monaco-editor/react";

type RoomMember = {
  id?: string;
  userId?: string;
  user?: { id?: string; name?: string; email?: string };
  name?: string;
  role?: string;
  email?: string;
};

type RoomDetails = {
  roomCode?: string;
  code?: string;
  name?: string;
  language?: string;
  members?: RoomMember[];
  host?: RoomMember | null;
  isMember?: boolean;
};

type PresencePayload = {
  userId?: string;
  name?: string;
  color?: string;
  role?: string;
};

type PresenceMessage = {
  type?: string;
  payload?: PresencePayload;
};

type ChatMessage = {
  id?: string;
  text?: string;
  message?: string;
  content?: string;
  author?: string | { name?: string };
  createdAt?: string;
  timestamp?: string;
};

type ToastItem = {
  id: string;
  text: string;
};

const LANGUAGE_OPTIONS = [
  "javascript",
  "typescript",
  "python",
  "cpp",
  "json",
  "markdown",
  "html",
  "css",
];

const EXTENSION_BY_LANGUAGE: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  python: "py",
  cpp: "cpp",
  json: "json",
  markdown: "md",
  html: "html",
  css: "css",
};

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return typeof window !== "undefined" ? window.btoa(binary) : Buffer.from(bytes).toString("base64");
}

function fromBase64(base64: string): Uint8Array {
  if (typeof window !== "undefined") {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }
  return new Uint8Array(Buffer.from(base64, "base64"));
}

// Distinct, vibrant accent colors for dark editor backgrounds
const VIBRANT_PALETTE = [
  "#06b6d4", // cyan
  "#10b981", // emerald
  "#a855f7", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#eab308", // yellow
  "#f43f5e", // rose
];

function getUserColor(userId: string, name?: string): string {
  const key = userId || name || "default";
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash << 5) - hash + key.charCodeAt(i);
    hash |= 0;
  }
  return VIBRANT_PALETTE[Math.abs(hash) % VIBRANT_PALETTE.length];
}



function getPlaceholderComment(lang: string): string {
  switch (lang) {
    case "python":
      return "# Start typing to begin coding together...";
    case "html":
    case "markdown":
      return "<!-- Start typing to begin coding together... -->";
    case "css":
      return "/* Start typing to begin coding together... */";
    default:
      return "// Start typing to begin coding together...";
  }
}

function getPreloadedRoom(code: string): { room: RoomDetails | null; language: string; members: RoomMember[]; loaded: boolean } {
  if (typeof window === "undefined" || !code) return { room: null, language: "javascript", members: [], loaded: false };
  try {
    const raw = sessionStorage.getItem(`codesync_preloaded_room_${code}`);
    if (raw) {
      const data = JSON.parse(raw);
      return {
        room: data as RoomDetails,
        language: data.language || "javascript",
        members: data.members || [],
        loaded: true
      };
    }
  } catch { /* ignore */ }
  return { room: null, language: "javascript", members: [], loaded: false };
}

export default function RoomPage() {
  const params = useParams<{ roomCode: string }>();
  const router = useRouter();
  const roomCode = params?.roomCode as string;
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const yDocRef = useRef<Y.Doc | null>(null);
  const bindingRef = useRef<MonacoBinding | null>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const awarenessRef = useRef<Awareness | null>(null);
  const localUserIdRef = useRef<string>(`${Date.now()}-${Math.random().toString(16).slice(2)}`);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<any>(null);
  const rightPanelRef = useRef<any>(null);

  // Tracking cursor activity and known users
  const lastActivityMapRef = useRef<Map<number, number>>(new Map());
  const cursorInactiveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownUserIdsRef = useRef<Set<string>>(new Set());

  // UI States
  const [loading, setLoading] = useState(true);
  const [joiningRoom, setJoiningRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [room, setRoom] = useState<RoomDetails | null>(null);
  const [language, setLanguage] = useState("javascript");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [presence, setPresence] = useState<PresenceMessage[]>([]);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [chatOpen, setChatOpen] = useState(true);



  const [currentUserName, setCurrentUserName] = useState("Developer");
  const [panelSizes, setPanelSizes] = useState<number[]>([25, 50, 25]);
  const [copyingCode, setCopyingCode] = useState(false);
  const [docEmpty, setDocEmpty] = useState(true);
  const [, setAwarenessTick] = useState(0);
  const [wsStatus, setWsStatus] = useState<"connected" | "reconnecting" | "disconnected">("disconnected");
  const [isRunning, setIsRunning] = useState(false);
  const [outputPanelOpen, setOutputPanelOpen] = useState(false);
  const [outputLogs, setOutputLogs] = useState<{ id: string; type: "info" | "stdout" | "stderr" | "success"; text: string; time?: string }[]>([]);
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  // New collaborative workspace & UI polish states
  const theme = "dark"; const setTheme = (val: string) => {};
  const [editorTheme, setEditorTheme] = useState("codesync-dark");
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [editorKeybinding, setEditorKeybinding] = useState("default");
  const [stdinText, setStdinText] = useState("");
  const [showStdin, setShowStdin] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [settingsMenuOpen, setSettingsMenuOpen] = useState(false);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  const showToast = useCallback((text: string) => {
    toast.success(text);
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setToasts((curr) => [...curr, { id, text }]);
    setTimeout(() => {
      setToasts((curr) => curr.filter((t) => t.id !== id));
    }, 3500);
  }, []);
  const loadRoom = useCallback(async () => {
    if (!roomCode) return;
    const storedName = readStoredName();
    setCurrentUserName(storedName);
    const pre = getPreloadedRoom(roomCode);
    if (pre.loaded && pre.room) {
      setRoom(pre.room);
      setLanguage(pre.language);
      if (pre.members.length) setMembers(pre.members);
      setLoading(false);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await fetchJson<RoomDetails>(`/api/rooms/${roomCode}`);
      setRoom({ ...data, isMember: true });
      setMembers(data.members || []);
      setLanguage(data.language || "javascript");
      
      try {
        const history = await fetchJson<any[]>(`/api/rooms/${roomCode}/messages`);
        if (Array.isArray(history)) {
          setMessages(history.map(msg => ({
            id: msg.id || msg._id || Math.random().toString(),
            text: msg.text || msg.message || msg.content || '',
            author: msg.senderName || msg.author || 'User',
            createdAt: msg.createdAt || msg.timestamp
          })));
        }
      } catch (err) {
        console.warn("Failed to load message history");
      }
    } catch (err: any) {
      const errorMsg = getApiErrorMessage(err, "Unable to load room details.");
      if (errorMsg.includes("403") || errorMsg.includes("Access denied")) {
        setRoom({ roomCode, isMember: false });
        setError(null); // Clear error to show the Join UI
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  }, [roomCode]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleJoinNonMember = async () => {
    setJoiningRoom(true);
    setError(null);
    try {
      await fetchJson("/api/rooms/join", {
        method: "POST",
        body: JSON.stringify({ roomCode }),
      });
      showToast("Successfully joined room!");
      await loadRoom();
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to join room."));
    } finally {
      setJoiningRoom(false);
    }
  };

  useEffect(() => {
    if (!roomCode || !currentUserName || (room && room.isMember === false)) return;

    setWsStatus("reconnecting");
    let isMounted = true;
    let activeSocket: WebSocket | null = null;

    const ydoc = new Y.Doc();
    yDocRef.current = ydoc;
    const awareness = new Awareness(ydoc);
    awarenessRef.current = awareness;

    const localColor = getUserColor(localUserIdRef.current, currentUserName);
    awareness.setLocalStateField("user", {
      name: currentUserName,
      color: localColor,
      userId: localUserIdRef.current,
    });

    // Track activity changes for fading remote cursors
    awareness.on("change", ({ added, updated, removed }: { added: number[]; updated: number[]; removed: number[] }) => {
      const now = Date.now();
      [...added, ...updated].forEach((clientID) => {
        lastActivityMapRef.current.set(clientID, now);
      });
      removed.forEach((clientID) => {
        lastActivityMapRef.current.delete(clientID);
      });
      setAwarenessTick((t) => t + 1);
    });

    awareness.on("update", ({ added, updated }: { added: number[]; updated: number[] }) => {
      const now = Date.now();
      [...added, ...updated].forEach((clientID) => {
        lastActivityMapRef.current.set(clientID, now);
      });
    });

    // Track Y.Doc text changes for empty state
    const ytext = ydoc.getText("monaco");
    const updateEmptyState = () => {
      setDocEmpty(ytext.toString().length === 0);
    };
    ytext.observe(updateEmptyState);
    updateEmptyState();

    fetchJson<{wsToken: string}>("/api/auth/ws-token")
      .then((res) => res.wsToken)
      .catch(() => null)
      .then((token) => {
      if (!isMounted) return;
      const socket = new WebSocket(
        `${getWsBase()}/ws/room/${roomCode}?token=${encodeURIComponent(token || "")}`
      );
      activeSocket = socket;
      socketRef.current = socket;

      socket.onopen = async () => {
        setWsStatus("connected");
        socket.send(
          JSON.stringify({
            type: "presence",
            payload: {
              userId: localUserIdRef.current,
              name: currentUserName,
              color: localColor,
              role: "MEMBER",
            },
          })
        );

        // Real-time chat session starts clean without historical persistence
      };

      socket.onclose = () => {
        setWsStatus("disconnected");
      };

      socket.onerror = () => {
        setWsStatus("disconnected");
      };

      socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === "yjs-update") {
            Y.applyUpdate(ydoc, fromBase64(message.payload), "remote");
          } else if (message.type === "chat-message") {
            const text =
              typeof message.payload === "string"
                ? message.payload
                : message.payload?.text || message.message || message.text || "";
            const author =
              typeof message.payload === "object" && message.payload?.author
                ? message.payload.author
                : message.author || "Collaborator";
            if (text) {
              setMessages((current) => [
                ...current,
                { id: `${Date.now()}-${Math.random()}`, text, author },
              ]);
            }
          } else if (message.type === "presence" || message.type === "user-joined") {
            const payload = message.payload || {};
            const uid = String(payload.userId || "");
            const uName = payload.name || "";

            if (
              !uName ||
              uName === "Collaborator" ||
              uName === "Peer" ||
              uName === "A participant" ||
              uid === localUserIdRef.current ||
              uName.toLowerCase() === currentUserName.toLowerCase()
            ) {
              return;
            }

            if (!knownUserIdsRef.current.has(uid) && knownUserIdsRef.current.size > 0) {
              showToast(`${uName} joined the room`);
            }
            if (uid) knownUserIdsRef.current.add(uid);

            setPresence((current) => {
              const next = current.filter(
                (entry) =>
                  entry.payload?.userId !== uid && entry.payload?.name?.toLowerCase() !== uName.toLowerCase()
              );
              return [...next, { type: message.type, payload: { ...payload, userId: uid, name: uName } }];
            });
          } else if (message.type === "user-left") {
            const uid = message.payload?.userId;
            const uName = message.payload?.name || "A participant";
            if (uid) {
              if (knownUserIdsRef.current.has(uid)) {
                showToast(`${uName} left the room`);
                knownUserIdsRef.current.delete(uid);
              }
              setPresence((current) => current.filter((entry) => entry.payload?.userId !== uid));
            }
          } else if (message.type === "room-updated" || message.type === "language-changed") {
            setLanguage(message.payload?.language || language);
          }
        } catch {
          // Ignore malformed messages
        }
      };

      ydoc.on("update", (update, origin) => {
        if (origin !== "remote" && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "yjs-update", payload: toBase64(update) }));
        }
      });
    });

    // Periodic check for inactive remote cursors (>5s)
    cursorInactiveTimerRef.current = setInterval(() => {
      if (!awarenessRef.current) return;
      const now = Date.now();
      awarenessRef.current.getStates().forEach((state, clientID) => {
        if (clientID === awarenessRef.current?.clientID) return;
        const lastActive = lastActivityMapRef.current.get(clientID) || now;
        const isInactive = now - lastActive > 5000;
        const selEl = document.querySelectorAll(`.yRemoteSelection-${clientID}`);
        const headEl = document.querySelectorAll(`.yRemoteSelectionHead-${clientID}`);
        selEl.forEach((el) => el.classList.toggle("inactive-cursor", isInactive));
        headEl.forEach((el) => el.classList.toggle("inactive-cursor", isInactive));
      });
    }, 500);

    return () => {
      isMounted = false;
      try { if (bindingRef.current) bindingRef.current.destroy(); } catch {}
      try { if (cursorInactiveTimerRef.current) clearInterval(cursorInactiveTimerRef.current); } catch {}
      try { if (activeSocket) activeSocket.close(); else if (socketRef.current) socketRef.current.close(); } catch {}
      try { ydoc.destroy(); } catch {}
      bindingRef.current = null;
      socketRef.current = null;
      awarenessRef.current = null;
    };
  }, [roomCode, currentUserName, language, room, router, showToast]);

  useEffect(() => {
    if (!editorRef.current || !yDocRef.current) return;

    const model = editorRef.current.getModel();
    if (!model) return;
    const text = yDocRef.current.getText("monaco");
    if (bindingRef.current) {
      bindingRef.current.destroy();
    }

    const awareness = awarenessRef.current || new Awareness(yDocRef.current);
    awarenessRef.current = awareness;
    awareness.setLocalStateField("user", {
      name: currentUserName,
      color: awareness.getLocalState()?.user?.color || getUserColor(localUserIdRef.current, currentUserName),
      userId: localUserIdRef.current,
    });

    bindingRef.current = new MonacoBinding(text, model, new Set([editorRef.current]), awareness);
    setDocEmpty(model.getValueLength() === 0);
    model.onDidChangeContent(() => {
      setDocEmpty(model.getValueLength() === 0);
    });
  }, [roomCode, currentUserName]);

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model && language) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  const handleEditorWillMount = (monacoInstance: typeof monaco) => {
    monacoInstance.editor.defineTheme("codesync-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6272a4", fontStyle: "italic" },
        { token: "keyword", foreground: "ff79c6", fontStyle: "bold" },
        { token: "string", foreground: "f1fa8c" },
        { token: "number", foreground: "bd93f9" },
      ],
      colors: {
        "editor.background": "#0b0f19",
        "editor.foreground": "#f8f8f2",
        "editor.lineHighlightBackground": "#131a2b",
        "editorCursor.foreground": "#c3c0ff",
        "editor.selectionBackground": "#3b82f640",
      },
    });
    monacoInstance.editor.defineTheme("codesync-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "comment", foreground: "6a737d", fontStyle: "italic" },
        { token: "keyword", foreground: "d73a49", fontStyle: "bold" },
        { token: "string", foreground: "032f62" },
        { token: "number", foreground: "005cc5" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#24292e",
        "editor.lineHighlightBackground": "#f6f8fa",
        "editorCursor.foreground": "#044289",
        "editor.selectionBackground": "#0366d625",
      },
    });
  };

  const handleEditorDidMount = (editor: monaco.editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
    monaco.editor.setTheme(editorTheme);

    const model = editor.getModel();
    if (!model) return;
    if (language) {
      monaco.editor.setModelLanguage(model, language);
    }
    const text = yDocRef.current?.getText("monaco");
    if (!text) return;
    if (bindingRef.current) {
      bindingRef.current.destroy();
    }
    const awareness = awarenessRef.current || new Awareness(yDocRef.current!);
    awarenessRef.current = awareness;
    bindingRef.current = new MonacoBinding(text, model, new Set([editor]), awareness);
    setDocEmpty(model.getValueLength() === 0);
    model.onDidChangeContent(() => {
      setDocEmpty(model.getValueLength() === 0);
    });
  };

  const handleLanguageChange = async (nextLanguage: string) => {
    setLanguage(nextLanguage);
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, nextLanguage);
      }
    }
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({ type: "room-updated", payload: { language: nextLanguage } })
      );
    }
    try {
      await fetchJson(`/api/rooms/${roomCode}/language`, {
        method: "POST",
        body: JSON.stringify({ language: nextLanguage }),
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Unable to update language."));
    }
  };

  const handleRunCode = async () => {
    setOutputPanelOpen(true);
    setIsRunning(true);
    setExecutionTime(null);
    const startTime = performance.now();
    const code = editorRef.current?.getValue() || yDocRef.current?.getText("monaco").toString() || "";

    if (!code.trim()) {
      setOutputLogs([{ id: `${Date.now()}`, type: "info", text: "No code to execute.", time: new Date().toLocaleTimeString() }]);
      setIsRunning(false);
      return;
    }

    setOutputLogs([{ id: `${Date.now()}`, type: "info", text: `Running code (${language.toUpperCase()})...`, time: new Date().toLocaleTimeString() }]);

    try {
      const data = await fetchJson<any>("/api/execute", {
        method: "POST",
        body: JSON.stringify({ language, code, stdin: stdinText }),
      });

      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));

      const newLogs: { id: string; type: "info" | "stdout" | "stderr" | "success"; text: string; time?: string }[] = [];

      if (data.stdout) {
        newLogs.push({ id: `${Date.now()}-out`, type: "stdout", text: data.stdout.trim(), time: new Date().toLocaleTimeString() });
      }
      if (data.stderr) {
        newLogs.push({ id: `${Date.now()}-err`, type: "stderr", text: data.stderr.trim(), time: new Date().toLocaleTimeString() });
      }
      if (newLogs.length === 0 && !data.error && data.status === "success") {
        newLogs.push({ id: `${Date.now()}-empty`, type: "success", text: "Code executed successfully with no console output.", time: new Date().toLocaleTimeString() });
      } else if (data.error) {
        newLogs.push({ id: `${Date.now()}-msg`, type: "stderr", text: data.error, time: new Date().toLocaleTimeString() });
      } else if (newLogs.length === 0) {
        newLogs.push({ id: `${Date.now()}-empty`, type: "success", text: "Execution finished with no output.", time: new Date().toLocaleTimeString() });
      }

      setOutputLogs(newLogs);
    } catch (err: unknown) {
      const endTime = performance.now();
      setExecutionTime(Math.round(endTime - startTime));
      const errMsg = err instanceof Error ? err.message : String(err);

      if (language === "javascript" || language === "typescript") {
        try {
          const logs: string[] = [];
          const customConsole = {
            log: (...args: unknown[]) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ")),
            error: (...args: unknown[]) => logs.push("[ERROR] " + args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ")),
            warn: (...args: unknown[]) => logs.push("[WARN] " + args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ")),
            info: (...args: unknown[]) => logs.push(args.map(a => typeof a === "object" ? JSON.stringify(a, null, 2) : String(a)).join(" ")),
          };
          let jsCode = code;
          if (language === "typescript") {
            jsCode = code
              .replace(/:\s*[A-Z][a-zA-Z0-9_[\]<>|&]*/g, "")
              .replace(/interface\s+[a-zA-Z0-9_]+\s*\{[^}]*\}/g, "")
              .replace(/type\s+[a-zA-Z0-9_]+\s*=[^;]+;/g, "");
          }
          const runFn = new Function("console", jsCode);
          runFn(customConsole);
          if (logs.length === 0) {
            setOutputLogs([{ id: `${Date.now()}-fb`, type: "success", text: "Code executed locally with no console output.", time: new Date().toLocaleTimeString() }]);
          } else {
            setOutputLogs(logs.map((text, i) => ({
              id: `${Date.now()}-${i}`,
              type: text.startsWith("[ERROR]") ? "stderr" : "stdout",
              text,
              time: new Date().toLocaleTimeString()
            })));
          }
          return;
        } catch (localErr) {
          setOutputLogs([{ id: `${Date.now()}-err`, type: "stderr", text: `Runtime Error: ${localErr instanceof Error ? localErr.message : String(localErr)}`, time: new Date().toLocaleTimeString() }]);
          return;
        }
      }

      setOutputLogs([
        { id: `${Date.now()}-err`, type: "stderr", text: `Execution Error: ${errMsg}`, time: new Date().toLocaleTimeString() }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSendMessage = (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!messageText.trim() || !socketRef.current) return;
    const text = messageText.trim();
    socketRef.current.send(JSON.stringify({ type: "chat-message", payload: text }));
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-${Math.random()}`, text, author: currentUserName },
    ]);
    setMessageText("");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopyingCode(true);
    setTimeout(() => setCopyingCode(false), 1500);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-zinc-400">Connecting to collaborative environment…</p>
        </div>
      </div>
    );
  }

  if (error && !room) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100 font-sans">
        <div className="max-w-md rounded-xl border border-red-500/40 bg-zinc-900 p-8 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-red-400 font-bold">Room Error</p>
          <h1 className="mt-2 text-xl font-bold text-red-200">{error}</h1>
          <button
            onClick={() => router("/dashboard")}
            className="mt-6 rounded-lg bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-primary transition hover:brightness-110"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (room && room.isMember === false) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-100 font-sans">
        <div className="max-w-md rounded-xl border border-zinc-800 bg-zinc-900 p-8 text-center shadow-2xl">
          <p className="text-xs uppercase tracking-[0.2em] text-primary font-bold">Membership Required</p>
          <h1 className="mt-3 text-2xl font-bold">You are not yet in this session.</h1>
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            Join below to participate in real-time co-editing and sync with peers.
          </p>
          {error ? (
            <p className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={handleJoinNonMember}
              disabled={joiningRoom}
              className="rounded-lg bg-primary px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-on-primary transition hover:brightness-110 disabled:opacity-60"
            >
              {joiningRoom ? "Connecting…" : "Join Room Now"}
            </button>
            <button
              onClick={() => router("/dashboard")}
              className="rounded-lg border border-zinc-800 px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-zinc-200 transition hover:bg-zinc-800"
            >
              Dashboard
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Generate dynamic styles for each remote cursor based on current awareness
  const cursorStyleRules = Array.from(awarenessRef.current?.getStates().entries() || [])
    .map(([clientID, state]) => {
      if (clientID === awarenessRef.current?.clientID || !state.user) return "";
      const color = state.user.color || getUserColor(state.user.userId || "", state.user.name || "");
      const name = state.user.name || "Peer";
      return `
        .yRemoteSelection-${clientID} {
          background-color: ${color}26 !important;
        }
        .yRemoteSelectionHead-${clientID} {
          position: absolute !important;
          border-left: 2px solid ${color} !important;
          border-top: 2px solid ${color} !important;
          border-bottom: 2px solid ${color} !important;
          height: 100% !important;
          box-sizing: border-box !important;
        }
        .yRemoteSelectionHead-${clientID}::after {
          position: absolute;
          content: ${JSON.stringify(name)};
          background-color: ${color};
          color: #000;
          font-family: 'Geist', 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 600;
          padding: 1px 5px;
          border-radius: 3px;
          top: -18px;
          left: -2px;
          white-space: nowrap;
          pointer-events: none;
          z-index: 50;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `;
    })
    .join("\n");

  const remotePeers = presence.filter((entry) => {
    const uid = String(entry.payload?.userId || "");
    const rawName = entry.payload?.name || "";
    const uName = rawName.includes("@") && !rawName.includes(" ") ? rawName.split("@")[0] : rawName;
    return (
      uName &&
      uName !== "Collaborator" &&
      uName !== "Peer" &&
      uName !== "A participant" &&
      uid !== localUserIdRef.current &&
      uName.toLowerCase() !== currentUserName.toLowerCase()
    );
  });

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-zinc-950 text-zinc-100 font-sans selection:bg-primary/30">
      {/* Injected Remote Cursor Styles */}
      <style dangerouslySetInnerHTML={{ __html: cursorStyleRules }} />

      {/* Toast Notifications Queue */}
      <div className="fixed bottom-10 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-900/95 px-4 py-3 text-sm font-medium text-zinc-100 shadow-2xl backdrop-blur-md animate-fade-in"
          >
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* Top Navbar */}
      <header className="h-14 border-b border-[#1E293B] bg-[#0F111A] flex justify-between items-center px-6 sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" title="Back to Dashboard" className="text-[#94A3B8] hover:text-white transition-colors bg-[#1E293B] hover:bg-[#334155] p-1.5 rounded-md flex items-center justify-center">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Link to="/dashboard" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-80 transition-opacity">
              <div className="w-6 h-6 bg-[#6366F1] rounded flex items-center justify-center text-xs">CF</div>
              CodeFlow
            </Link>
          </div>
          <div className="hidden sm:flex items-center px-3 py-1 bg-[#1E293B] rounded-md text-xs font-semibold text-white">
            <Folder className="w-3.5 h-3.5 mr-2 text-[#6366F1]" />
            {room?.name || 'Project Alpha'} <span className="text-[#64748B] ml-2">({roomCode})</span>
          </div>
        </div>

        <nav className="hidden lg:flex gap-6 text-sm">
          <Link to="/dashboard" className="text-[#94A3B8] hover:text-white cursor-pointer py-4 transition-colors">Dashboard</Link>
          <span className="text-[#94A3B8] hover:text-white cursor-pointer py-4 transition-colors">Marketplace</span>
          <span className="text-[#94A3B8] hover:text-white cursor-pointer py-4 transition-colors">Documentation</span>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={handleCopyCode} className="hidden sm:flex bg-[#BFDBFE] hover:bg-[#93C5FD] text-[#1E3A8A] font-semibold px-4 py-1.5 rounded text-sm transition-colors items-center gap-2">
            {copyingCode ? <Check className="w-4 h-4" /> : <Users className="w-4 h-4" />}
            {copyingCode ? "Copied" : "Invite"}
          </button>
          
          <Bell className="w-5 h-5 text-[#94A3B8] hover:text-white cursor-pointer transition-colors" />
          <Settings className="w-5 h-5 text-[#94A3B8] hover:text-white cursor-pointer transition-colors" onClick={() => setSettingsMenuOpen(!settingsMenuOpen)} />
          
          {settingsMenuOpen && (
              <div className="absolute top-12 right-12 w-56 rounded-xl border border-[#1E293B] bg-[#0F111A] py-2 shadow-2xl z-50 flex flex-col">
                <div className="flex items-center justify-between px-4 py-2 hover:bg-[#1E293B] transition-colors">
                  <span className="text-xs font-medium text-white">App Theme</span>
                  <select
                    value={theme || "dark"}
                    onChange={(e) => setTheme(e.target.value)}
                    className="bg-[#0B0C10] border border-[#1E293B] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
                  >
                    <option value="dark">Dark</option>
                  </select>
                </div>
                <div className="flex items-center justify-between px-4 py-2 hover:bg-[#1E293B] transition-colors">
                  <span className="text-xs font-medium text-white">Editor Theme</span>
                  <select
                    value={editorTheme}
                    onChange={(e) => setEditorTheme(e.target.value)}
                    className="bg-[#0B0C10] border border-[#1E293B] text-white text-xs rounded px-1.5 py-1 focus:outline-none"
                  >
                    <option value="vs-dark">VS Dark</option>
                  </select>
                </div>
              </div>
          )}

          <div 
            className="w-7 h-7 rounded-full border border-[#334155] flex items-center justify-center overflow-hidden cursor-pointer text-[10px] font-bold text-white shadow-sm"
            style={{ backgroundColor: getUserColor(localUserIdRef.current, currentUserName) }}
            title={`${currentUserName} (You)`}
          >
            {currentUserName.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Activity Bar (Far Left) */}
        <div className="w-[50px] bg-[#0B0C10] border-r border-[#1E293B] flex flex-col items-center py-4 gap-6 shrink-0 z-10 hidden md:flex">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} title="Explorer" className={`transition-colors ${sidebarOpen ? 'text-white border-l-2 border-[#6366F1] -ml-[2px] pl-[2px]' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>
            <Folder className="w-6 h-6" />
          </button>
          <button title="Search" className="text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <Search className="w-6 h-6" />
          </button>
          <button title="Git" className="text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <GitBranch className="w-6 h-6" />
          </button>
          <button onClick={() => setChatOpen(!chatOpen)} title="Collaboration" className={`transition-colors relative ${chatOpen ? 'text-white' : 'text-[#64748B] hover:text-[#94A3B8]'}`}>
            <Users className="w-6 h-6" />
          </button>
          <button title="Debug" className="text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <Bug className="w-6 h-6" />
          </button>
          <div className="flex-1" />
          <button onClick={() => setSettingsMenuOpen(!settingsMenuOpen)} title="Settings" className="text-[#64748B] hover:text-[#94A3B8] transition-colors relative">
            <Settings className="w-6 h-6" />
          </button>
          <button title="User" className="text-[#64748B] hover:text-[#94A3B8] transition-colors">
            <User className="w-6 h-6" />
          </button>
        </div>

        {/* Resizable Panels Container */}
        <div className="flex-1 h-full min-w-0 relative">
          <PanelGroup
            direction="horizontal"
            onLayout={(sizes) => {
              if (sizes.length === 3) {
                setPanelSizes(sizes);
              }
            }}
          >
            {sidebarOpen && (
              <>
                <Panel
                  id="left-panel"
                  ref={leftPanelRef}
                  collapsible={true}
                  collapsedSize={0}
                  order={1}
                  defaultSize={50}
                  minSize={10}
                  maxSize={200}
                  className="bg-[#0F111A] flex flex-col overflow-hidden border-r border-[#1E293B]"
                >
                  <div className="h-9 flex items-center px-4 text-[11px] font-bold text-[#94A3B8] tracking-wider shrink-0 uppercase mt-2">
                    Explorer
                  </div>
                  
                  <div className="flex-1 overflow-y-auto mt-2">
                    {/* Mock Folder Tree */}
                    <div className="px-2 space-y-0.5">
                      <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#E2E8F0] hover:bg-[#1E293B] rounded cursor-pointer font-semibold">
                        <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                        <Folder className="w-4 h-4 text-[#6366F1]" fill="currentColor" fillOpacity={0.2} />
                        Project Alpha
                      </div>
                      
                      <div className="pl-6 space-y-0.5">
                        <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#94A3B8] hover:bg-[#1E293B] rounded cursor-pointer">
                          <ChevronDown className="w-3.5 h-3.5 text-[#64748B] -rotate-90" />
                          <Folder className="w-4 h-4 text-[#475569]" />
                          node_modules
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#94A3B8] hover:bg-[#1E293B] rounded cursor-pointer">
                          <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
                          <Folder className="w-4 h-4 text-[#38BDF8]" fill="currentColor" fillOpacity={0.2} />
                          src
                        </div>
                        
                        <div className="pl-6 space-y-0.5">
                          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#94A3B8] hover:bg-[#1E293B] rounded cursor-pointer">
                            <ChevronDown className="w-3.5 h-3.5 text-[#64748B] -rotate-90" />
                            <Folder className="w-4 h-4 text-[#A78BFA]" />
                            components
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-white bg-[#1E293B] rounded cursor-pointer">
                            <FileCode className="w-4 h-4 text-[#FDE047]" />
                            index.js
                          </div>
                          <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#94A3B8] hover:bg-[#1E293B] rounded cursor-pointer">
                            <FileCode className="w-4 h-4 text-[#38BDF8]" />
                            styles.css
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#94A3B8] hover:bg-[#1E293B] rounded cursor-pointer">
                          <FileCode className="w-4 h-4 text-[#F43F5E]" />
                          package.json
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 text-xs text-[#94A3B8] hover:bg-[#1E293B] rounded cursor-pointer">
                          <FileCode className="w-4 h-4 text-[#60A5FA]" />
                          README.md
                        </div>
                      </div>
                    </div>
                  </div>
                </Panel>
                <PanelResizeHandle className="w-1 bg-transparent hover:bg-[#6366F1] transition-colors cursor-col-resize relative z-20 shrink-0" />
              </>
            )}

            {/* Center Editor Panel */}
            <Panel
              id="center-panel"
              order={2}
              defaultSize={50}
              minSize={20}
              className="flex flex-col bg-[#0B0C10] relative"
            >
              {/* Editor Tabs & Toolbar */}
              <div className="h-10 bg-[#0F111A] flex items-center justify-between shrink-0 overflow-hidden pr-2">
                <div className="flex h-full">
                  <div className="h-full px-4 bg-[#0B0C10] text-white flex items-center gap-2 text-xs border-t-2 border-t-[#6366F1] cursor-pointer">
                    <FileCode className="w-4 h-4 text-[#FDE047]" />
                    <span className="font-medium">index.js</span>
                    <X className="w-3.5 h-3.5 text-[#64748B] hover:text-white ml-2" />
                  </div>
                  <div className="h-full px-4 bg-[#0F111A] text-[#94A3B8] flex items-center gap-2 text-xs border-r border-[#1E293B] cursor-pointer hover:bg-[#151822]">
                    <FileCode className="w-4 h-4 text-[#F43F5E]" />
                    <span className="font-medium">package.json</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-2">
                  <button
                    onClick={handleRunCode}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-wider disabled:opacity-50"
                  >
                    <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin': ''}`} />
                    <span>{isRunning ? "Running" : "Run"}</span>
                  </button>
                  <button
                    onClick={() => setWhiteboardOpen(!whiteboardOpen)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-400 hover:text-zinc-200 transition-colors uppercase tracking-wider"
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Whiteboard</span>
                  </button>
                </div>
              </div>

              {/* Editor Empty State Placeholder */}
              {docEmpty && !whiteboardOpen && (
                <div className="absolute top-12 left-16 pointer-events-none font-mono text-sm text-zinc-500 select-none z-10">
                  {getPlaceholderComment(language)}
                </div>
              )}

              {/* Main Content Area (Code or Whiteboard) */}
              <div className="flex-1 relative flex flex-col min-h-0">
                {whiteboardOpen ? (
                  <div className="flex-1 relative">
                    <Whiteboard yDoc={yDocRef.current} onClose={() => setWhiteboardOpen(false)} />
                  </div>
                ) : (
                  <div className="flex-1 relative">
                    <MonacoEditor
                      height="100%"
                      language={language}
                      theme={editorTheme}
                      options={{
                        minimap: { enabled: false },
                        fontSize: editorFontSize,
                        fontFamily: "var(--font-mono), 'JetBrains Mono', monospace",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        padding: { top: 16 },
                      }}
                      beforeMount={handleEditorWillMount}
                      onMount={handleEditorDidMount}
                    />
                  </div>
                )}
              </div>

              {/* Execution Terminal Panel */}
              {outputPanelOpen && (
                <div className="h-48 sm:h-56 bg-zinc-950 border-t border-zinc-800 flex flex-col shrink-0 font-mono text-xs z-20">
                  <div className="h-7 bg-zinc-900 border-b border-zinc-800 px-3 flex items-center justify-between text-zinc-300 shrink-0">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="font-bold uppercase tracking-wider text-[10px] text-zinc-400">Terminal</span>
                      {executionTime !== null && (
                        <span className="text-[9px] text-emerald-400 font-bold">
                          {executionTime}ms
                        </span>
                      )}
                      <button
                        onClick={() => setShowStdin((v) => !v)}
                        className={`text-[9px] uppercase font-bold transition-colors ${showStdin || stdinText.trim() ? "text-sky-400" : "text-zinc-500 hover:text-zinc-300"}`}
                      >
                        stdin {stdinText.trim() ? "(!)" : ""}
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => setOutputLogs([])} className="text-[9px] uppercase font-bold text-zinc-500 hover:text-zinc-300">Clear</button>
                      <button onClick={() => setOutputPanelOpen(false)}><X className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300" /></button>
                    </div>
                  </div>

                  {showStdin && (
                    <div className="border-b border-zinc-800 bg-zinc-900/50 p-2 shrink-0">
                      <textarea
                        value={stdinText}
                        onChange={(e) => setStdinText(e.target.value)}
                        placeholder="Standard Input..."
                        className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded p-1.5 text-zinc-300 font-mono text-[11px] focus:outline-none focus:border-zinc-600 resize-none custom-scrollbar"
                      />
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto p-3 space-y-1 select-text custom-scrollbar bg-zinc-950">
                    {isRunning ? (
                      <div className="flex items-center gap-2 text-zinc-400 py-2">
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
                        <span>Running...</span>
                      </div>
                    ) : outputLogs.length === 0 ? (
                      <div className="text-zinc-600 italic">No output yet.</div>
                    ) : (
                      outputLogs.map((log) => (
                        <div
                          key={log.id}
                          className={`flex items-start gap-2 whitespace-pre-wrap font-mono text-[11px] ${
                            log.type === "stderr"
                              ? "text-red-400"
                              : log.type === "success"
                                ? "text-emerald-400"
                                : log.type === "info"
                                  ? "text-sky-400"
                                  : "text-zinc-300"
                          }`}
                        >
                          <span className="flex-1">{log.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Panel>

            {chatOpen && (
              <>
                <PanelResizeHandle className="w-[1px] bg-zinc-800 hover:bg-primary transition-colors cursor-col-resize relative z-20 shrink-0" />
                
                <Panel
                  id="right-panel"
                  ref={rightPanelRef}
                  collapsible={true}
                  collapsedSize={0}
                  order={3}
                  defaultSize={50}
                  minSize={10}
                  maxSize={300}
                  className="bg-[#0F111A] flex flex-col overflow-hidden border-l border-[#1E293B]"
                >
                  {/* Team Section */}
                  <div className="h-9 flex items-center justify-between px-4 text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase shrink-0 border-b border-[#1E293B]">
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" />
                      <span>Team ({remotePeers.length + 1})</span>
                    </div>
                    <X className="w-3.5 h-3.5 cursor-pointer hover:text-white transition-colors" onClick={() => setChatOpen(false)} />
                  </div>
                  
                  <div className="max-h-[150px] overflow-y-auto px-4 py-2 border-b border-[#1E293B]">
                    {/* You */}
                    <div className="flex items-center justify-between text-xs py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-[#1E293B] border border-[#334155] flex items-center justify-center font-bold text-[10px] text-white" style={{ backgroundColor: getUserColor(localUserIdRef.current, currentUserName) }}>
                          {currentUserName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-[#E2E8F0] font-medium">{currentUserName} <span className="text-[#64748B] text-[10px]">(You)</span></span>
                      </div>
                    </div>
                    {/* Peers */}
                    {remotePeers.map((entry, index) => {
                      const uid = entry.payload?.userId || `${index}`;
                      const rawUName = entry.payload?.name || "Peer";
                      const uName = rawUName.includes("@") && !rawUName.includes(" ") ? rawUName.split("@")[0] : rawUName;
                      const uColor = entry.payload?.color || getUserColor(uid, uName);
                      return (
                        <div key={uid} className="flex items-center justify-between text-xs py-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded bg-[#1E293B] border border-[#334155] flex items-center justify-center font-bold text-[10px] text-white" style={{ backgroundColor: uColor }}>
                              {uName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="text-[#E2E8F0] font-medium">{uName}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Chat Section */}
                  <div className="h-9 flex items-center justify-between px-4 text-[11px] font-bold text-[#94A3B8] tracking-wider uppercase shrink-0 border-b border-[#1E293B]">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Room Chat</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center text-[#64748B]">
                        <MessageSquare className="w-6 h-6 mb-2 opacity-50" />
                        <p className="text-[11px]">No messages yet.</p>
                      </div>
                    ) : (
                      messages.map((message) => {
                        const authorName = typeof message.author === "string" ? message.author : message.author?.name || "System";
                        const authorId = typeof message.author === "string" ? authorName : (message.author as any)?.id || authorName;
                        const authorColor = getUserColor(authorId, authorName);
                        return (
                          <div key={message.id || Math.random()} className="flex flex-col">
                            <div className="flex items-baseline gap-2 mb-0.5">
                              <span className="text-[11px] font-bold" style={{ color: authorColor }}>{authorName}</span>
                              {message.timestamp && <span className="font-mono text-[9px] text-[#64748B]">{message.timestamp}</span>}
                            </div>
                            <p className="text-xs text-[#E2E8F0] leading-relaxed break-words">{message.text || message.message || message.content}</p>
                          </div>
                        );
                      })
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  <form onSubmit={handleSendMessage} className="p-3 shrink-0">
                    <div className="relative">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        placeholder="Message room..."
                        className="w-full bg-[#151822] border border-[#1E293B] rounded-md px-3 py-2 text-xs text-white focus:border-[#6366F1] focus:outline-none transition-colors pr-10"
                      />
                      <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#6366F1] transition-colors p-1">
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </Panel>
              </>
            )}
          </PanelGroup>
        </div>
      </div>

      {/* CodeFlow Style Status Bar */}
      <footer className="h-6 bg-[#0B0C10] border-t border-[#1E293B] flex items-center justify-between text-[10px] font-mono text-[#64748B] shrink-0 select-none">
        <div className="flex items-center h-full">
          <div className="flex items-center gap-1.5 px-3 h-full hover:bg-[#1E293B] transition-colors cursor-pointer text-[#E2E8F0]">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span>CONNECTED</span>
          </div>
          <div className="flex items-center px-3 h-full hover:bg-[#1E293B] transition-colors cursor-pointer border-l border-[#1E293B]">
            Ln {cursorPos.line}, Col {cursorPos.col}
          </div>
          <div className="flex items-center px-3 h-full hover:bg-[#1E293B] transition-colors cursor-pointer border-l border-[#1E293B]">
            UTF-8
          </div>
        </div>
        
        <div className="flex items-center h-full">
          {/* Language Selector built into Status Bar */}
          <div className="flex items-center h-full hover:bg-[#1E293B] transition-colors cursor-pointer border-r border-[#1E293B] px-1">
            <select
              value={language}
              onChange={(e) => void handleLanguageChange(e.target.value)}
              className="bg-transparent uppercase font-bold text-[#94A3B8] focus:outline-none cursor-pointer pl-2 pr-1 py-1"
            >
              {LANGUAGE_OPTIONS.map((lang: string) => (
                <option key={lang} value={lang} className="bg-[#0F111A] text-[#E2E8F0]">{lang}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center px-3 h-full hover:bg-[#1E293B] transition-colors cursor-pointer">
            <div className="flex items-center gap-1.5">
              <Code2 className="w-3 h-3 text-[#6366F1]" />
              <span>Synchronized</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
