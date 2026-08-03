const fs = require('fs');

const enContent = fs.readFileSync('locales/en.ts', 'utf8');
const amContent = fs.readFileSync('locales/am.ts', 'utf8');

const enKeys = [...enContent.matchAll(/^\s*([a-zA-Z0-9_]+)\s*:/gm)].map(m => m[1]);
const amKeys = new Set([...amContent.matchAll(/^\s*([a-zA-Z0-9_]+)\s*:/gm)].map(m => m[1]));

let missingKeysStr = '';
for (const key of enKeys) {
  if (!amKeys.has(key)) {
    missingKeysStr += `    ${key}: '${key}',\n`;
  }
}

// insert missing keys before the last brace
const newAmContent = amContent.replace(/};\s*$/, missingKeysStr + '};\n');
fs.writeFileSync('locales/am.ts', newAmContent);
