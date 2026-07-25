const fs = require('fs');
const path = require('path');

function replaceNextJs(filePath, isRoom) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove use client
  content = content.replace(/'use client';?\n?/g, '');
  content = content.replace(/"use client";?\n?/g, '');

  // Replace next/link
  content = content.replace(/import\s+Link\s+from\s+["']next\/link["']/g, 'import { Link } from "react-router-dom"');

  // Replace next/navigation
  content = content.replace(/import\s+{\s*(useRouter|useParams)[^}]*}\s+from\s+["']next\/navigation["']/g, 'import { useNavigate as useRouter, useParams } from "react-router-dom"');

  // Remove Clerk
  content = content.replace(/import\s+{([^}]*)}\s+from\s+["']@clerk\/nextjs["'];?/g, '');
  
  // Replace Clerk components with simple alternatives or remove them
  content = content.replace(/<SignedOut>([\s\S]*?)<\/SignedOut>/g, '$1');
  content = content.replace(/<SignedIn>([\s\S]*?)<\/SignedIn>/g, '');
  content = content.replace(/<SignInButton[^>]*>([\s\S]*?)<\/SignInButton>/g, '<Link to="/login">$1</Link>');
  content = content.replace(/<SignUpButton[^>]*>([\s\S]*?)<\/SignUpButton>/g, '<Link to="/signup">$1</Link>');
  content = content.replace(/<UserButton[^>]*\/>/g, '<button>Logout</button>');

  // Replace next/dynamic
  content = content.replace(/import\s+dynamic\s+from\s+["']next\/dynamic["'];?/g, '');
  content = content.replace(/const\s+MonacoEditor\s*=\s*dynamic\([^,]+,\s*{[^}]*}\s*\);?/g, 'import MonacoEditor from "@monaco-editor/react";');

  // Replace next-themes
  content = content.replace(/import\s+{\s*useTheme\s*}\s+from\s+["']next-themes["'];?/g, '');
  // mock useTheme
  if (isRoom) {
    content = content.replace(/const\s+{\s*theme,\s*setTheme\s*}\s*=\s*useTheme\(\);?/g, 'const theme = "dark"; const setTheme = () => {};');
  } else {
    content = content.replace(/<ThemeToggle\s*\/>/g, '');
    content = content.replace(/import\s+{\s*ThemeToggle\s*}\s+from\s+["'][^"']+ThemeToggle["'];?/g, '');
  }

  // Handle useRouter push (Next router uses push('/path'), React Router useNavigate uses navigate('/path'))
  content = content.replace(/router\.push\(/g, 'router(');

  return content;
}

const homePath = path.join(__dirname, 'src', 'app', 'page.tsx');
if (fs.existsSync(homePath)) {
  const homeContent = replaceNextJs(homePath, false);
  fs.mkdirSync(path.join(__dirname, 'src', 'pages'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Home.tsx'), homeContent);
}

const roomPath = path.join(__dirname, 'src', 'app', 'room', '[roomCode]', 'page.tsx');
if (fs.existsSync(roomPath)) {
  const roomContent = replaceNextJs(roomPath, true);
  fs.mkdirSync(path.join(__dirname, 'src', 'pages'), { recursive: true });
  fs.writeFileSync(path.join(__dirname, 'src', 'pages', 'Room.tsx'), roomContent);
}

console.log("Refactoring complete");
