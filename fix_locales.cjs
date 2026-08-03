const fs = require('fs');

function removeDuplicates(filename) {
    let content = fs.readFileSync(filename, 'utf8');
    let lines = content.split('\n');
    let seen = new Set();
    let newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        let match = line.match(/^\s*([a-zA-Z0-9_]+)\s*:/);
        if (match) {
            let key = match[1];
            if (seen.has(key)) {
                continue; // Skip duplicate
            }
            seen.add(key);
        }
        newLines.push(line);
    }
    fs.writeFileSync(filename, newLines.join('\n'));
}

removeDuplicates('locales/en.ts');
removeDuplicates('locales/am.ts');
