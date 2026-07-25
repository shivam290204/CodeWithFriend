const fs = require('fs');
let code = fs.readFileSync('e:/CodeWithFriends/frontend/src/pages/Room.tsx', 'utf8');

const targetStr = `function getPlaceholderComment(lang: string): string {
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
  const [copyingCode, setCopyingCode] = useState(false);`;

const replacement = `function getPlaceholderComment(lang: string): string {
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
  const [copyingCode, setCopyingCode] = useState(false);`;

if (!code.includes(targetStr)) {
  console.log('Target string not found!');
  process.exit(1);
}

code = code.replace(targetStr, replacement);
fs.writeFileSync('e:/CodeWithFriends/frontend/src/pages/Room.tsx', code);
console.log('Fixed successfully');
