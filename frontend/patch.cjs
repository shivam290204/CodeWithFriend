const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/pages/Room.tsx');

let content = fs.readFileSync(file, 'utf8');

// I will just read the file, locate ChatMessage type, and reconstruct everything until fromBase64
const chatMessageIndex = content.indexOf('type ChatMessage = {');
const fromBase64Index = content.indexOf('function fromBase64(base64: string): Uint8Array {');

if (chatMessageIndex !== -1 && fromBase64Index !== -1) {
  const before = content.slice(0, chatMessageIndex);
  const after = content.slice(fromBase64Index);
  const insert = `type ChatMessage = {
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

`;
  fs.writeFileSync(file, before + insert + after);
  console.log('patched');
} else {
  console.log('could not find indexes');
}
