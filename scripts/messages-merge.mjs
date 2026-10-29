// Adds the messages of a JSON file to messages/fr.json, keeping existing keys: node scripts/messages-merge.mjs <file>
import fs from 'node:fs';
const target = 'messages/fr.json';
const current = JSON.parse(fs.readFileSync(target, 'utf8'));
const added = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
for (const [k, v] of Object.entries(added)) if (!(k in current)) current[k] = v;
fs.writeFileSync(target, JSON.stringify(current, null, 2) + '\n');
console.log(Object.keys(current).length - 1, 'messages');
