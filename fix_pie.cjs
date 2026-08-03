const fs = require('fs');
let s = fs.readFileSync('components/charts/CategoryChart.tsx', 'utf8');
s = s.replace(/<Pie\n/g, '<AnyPie\n');
s = s.replace(/<Pie\r\n/g, '<AnyPie\r\n');
fs.writeFileSync('components/charts/CategoryChart.tsx', s);
