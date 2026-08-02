const fs = require('fs');
let content = fs.readFileSync('views/ScheduledView.tsx', 'utf8');

content = content.replace(
    `import { formatCurrency } from '../constants';`,
    `import { formatCurrency, parseLocalDate } from '../constants';`
);

content = content.replace(
    `const isDue = new Date(item.nextDueDate) <= new Date();`,
    `const isDue = parseLocalDate(item.nextDueDate) <= new Date();`
);

content = content.replace(
    `if(item.endDate && new Date(nextDueDate) > new Date(item.endDate)) {`,
    `if(item.endDate && parseLocalDate(nextDueDate) > parseLocalDate(item.endDate)) {`
);

content = content.replace(
    `const dueDate = new Date(item.nextDueDate);`,
    `const dueDate = parseLocalDate(item.nextDueDate);`
);

fs.writeFileSync('views/ScheduledView.tsx', content);
