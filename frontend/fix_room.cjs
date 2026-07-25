const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Room.tsx');

let content = fs.readFileSync(file, 'utf8');

// The file is currently a mess around lines 30-60.
// Let's completely replace everything between `type RoomMember = {` and `function getUserColor`

const startStr = 'type RoomMember = {';
const endStr = 'function getUserColor(userId: string, name?: string): string {';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.slice(0, startIndex);
  const after = content.slice(endIndex);

  const correctBlock = `type RoomMember = {
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

`;

  fs.writeFileSync(file, before + correctBlock + after);
  console.log('patched');
} else {
  console.log('could not find bounds');
}
