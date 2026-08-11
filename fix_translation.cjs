const fs = require('fs');
let content = fs.readFileSync('components/charts/SettingsAndAboutView.tsx', 'utf8');
content = content.replace("{t('logout') || 'Log Out'}", "'Log Out'");
fs.writeFileSync('components/charts/SettingsAndAboutView.tsx', content);
