const fs = require('fs');
let serverCode = fs.readFileSync('server.ts', 'utf8');

const regex = /app\.post\("\/api\/convert-currency"[\s\S]*?\}\);\s*\n\s*\/\/\s*Vite middleware for development/m;
serverCode = serverCode.replace(regex, '// Vite middleware for development');

fs.writeFileSync('server.ts', serverCode);
