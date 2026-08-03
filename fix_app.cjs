const fs = require('fs');

let appCode = fs.readFileSync('App.tsx', 'utf8');

// import generateId from ./constants
if (!appCode.includes('generateId')) {
    appCode = appCode.replace(/import \{.*?\} from '\.\/constants';/g, match => {
        return match.replace(" {", " { generateId,");
    });
}

appCode = appCode.replace(/id: Date\.now\(\)/g, "id: generateId()");

fs.writeFileSync('App.tsx', appCode);
