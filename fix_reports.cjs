const fs = require('fs');

let reportsCode = fs.readFileSync('views/ReportsView.tsx', 'utf8');

if (!reportsCode.includes('generateId')) {
    reportsCode = reportsCode.replace(/import \{.*?\} from '\.\.\/constants';/g, match => {
        return match.replace(" {", " { generateId,");
    });
}

reportsCode = reportsCode.replace(/id: Date\.now\(\)/g, "id: generateId()");

fs.writeFileSync('views/ReportsView.tsx', reportsCode);
