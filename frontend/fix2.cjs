const fs = require('fs');
let code = fs.readFileSync('e:/CodeWithFriends/frontend/src/pages/Room.tsx', 'utf8');

const lines = code.split('\n');

const replacement = `    case "html":
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
    const raw = sessionStorage.getItem(\`codesync_preloaded_room_\${code}\`);
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
  const localUserIdRef = useRef<string>(\`\${Date.now()}-\${Math.random().toString(16).slice(2)}\`);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

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

  useEffect(() => {
    if (sidebarOpen) leftPanelRef.current?.expand();
    else leftPanelRef.current?.collapse();
  }, [sidebarOpen]);

  useEffect(() => {
    if (chatOpen) rightPanelRef.current?.expand();
    else rightPanelRef.current?.collapse();
  }, [chatOpen]);

  const [currentUserName, setCurrentUserName] = useState("Developer");
  const [panelSizes, setPanelSizes] = useState<number[]>([20, 60, 20]);
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
    const id = \`\${Date.now()}-\${Math.random().toString(16).slice(2)}\`;
    setToasts((curr) => [...curr, { id, text }]);
    setTimeout(() => {
      setToasts((curr) => curr.filter((t) => t.id !== id));
    }, 3500);
  }, []);`;

// Rebuild file
const newLines = [];
let foundLoadRoom = false;

for (let i = 0; i < lines.length; i++) {
  if (i <= 139) { // 0 to 139 are lines 1 to 140
    newLines.push(lines[i]);
  } else if (!foundLoadRoom) {
    if (lines[i].includes('const loadRoom = useCallback(async () => {')) {
      newLines.push(replacement);
      newLines.push(lines[i]);
      foundLoadRoom = true;
    }
  } else {
    newLines.push(lines[i]);
  }
}

// Just to be safe, replace all carriage returns that might have duplicated
const finalCode = newLines.join('\n').replace(/\r\n/g, '\n');

fs.writeFileSync('e:/CodeWithFriends/frontend/src/pages/Room.tsx', finalCode);
console.log("Successfully rebuilt the file!");
