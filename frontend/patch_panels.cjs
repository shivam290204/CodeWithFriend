const fs = require('fs');
const path = require('path');

const roomFile = path.join(__dirname, 'src/pages/Room.tsx');
let content = fs.readFileSync(roomFile, 'utf8');

// Replace the imports
content = content.replace(
  /import \{ Panel, PanelGroup, PanelResizeHandle \} from "react-resizable-panels";/g,
  'import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";'
);

fs.writeFileSync(roomFile, content);
console.log('Patched panels');
