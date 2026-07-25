const fs = require('fs');
const path = require('path');

const homePath = path.join(__dirname, 'src/pages/Home.tsx');
let home = fs.readFileSync(homePath, 'utf8');
home = home.replace(/<Link([^>]*)href=/g, '<Link$1to=');
fs.writeFileSync(homePath, home);

const roomPath = path.join(__dirname, 'src/pages/Room.tsx');
let room = fs.readFileSync(roomPath, 'utf8');
room = room.replace(/<Link([^>]*)href=/g, '<Link$1to=');

// Fix panel group order which is obsolete in new react-resizable-panels
room = room.replace(/ order=\{[0-9]+\}/g, '');

// fix router("/dashboard") error Expected 0 arguments, but got 1 -> Wait, useNavigate returns a function that takes 1 arg.
// Why did it say "Expected 0 arguments, but got 1"?
// Ah, `const router = useRouter();` - wait, in refactor.cjs I replaced `import { useRouter }` with `import { useNavigate as useRouter }`.
// The call is `router("/dashboard")`. Wait, maybe `useRouter` is being imported incorrectly or some type issue.
// "src/pages/Room.tsx(950,47): error TS2554: Expected 0 arguments, but got 1." -> this is `router("/dashboard")` ? Or is it `router.push`?
// Let's change `router("/dashboard")` to `router("/dashboard")` just in case, wait, if it says Expected 0 arguments, it might be `e.preventDefault()` or something.
// We will look closer at the build error.
fs.writeFileSync(roomPath, room);
