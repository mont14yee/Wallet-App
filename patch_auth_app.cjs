const fs = require('fs');
let appCode = fs.readFileSync('App.tsx', 'utf8');

appCode = appCode.replace(/    useEffect\(\(\) => \{\s+if \(\!userProfile\.email\) return;\s+try \{\s+localStorage\.setItem\(`wallet-[^`]+`, JSON\.stringify\([a-zA-Z]+\)\);\s+\} catch \(error\) \{\s+console\.error\("Failed to save [^"]+", error\);\s+\}\s+\}, \[[a-zA-Z]+, userProfile\.email\]\);\n/g, '');

fs.writeFileSync('App.tsx', appCode);
