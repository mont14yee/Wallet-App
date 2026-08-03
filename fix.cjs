const fs = require('fs');
let s = fs.readFileSync('components/charts/CategoryChart.tsx', 'utf8');

// Let's replace the common style issues:
s = s.replace(/style=\{ /g, 'style={{ ');
s = s.replace(/color: payload\[0\]\.fill \}\}/g, 'color: payload[0].fill }}'); // wait, the original was `style={{ color: payload[0].fill }}`.
s = s.replace(/style=\{ width/g, 'style={{ width');
s = s.replace(/style=\{ filter/g, 'style={{ filter');
s = s.replace(/style=\{ transition/g, 'style={{ transition');
s = s.replace(/wrapperStyle=\{ color/g, 'wrapperStyle={{ color');
fs.writeFileSync('components/charts/CategoryChart.tsx', s);
