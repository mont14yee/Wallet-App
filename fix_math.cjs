const fs = require('fs');

let content = fs.readFileSync('views/CurrencyConverterView.tsx', 'utf8');
content = content.replace(
    'const convertedAmount = multiplyMoney(numAmount / fromRate, toRate);',
    'const convertedAmount = (numAmount / fromRate) * toRate;'
);
fs.writeFileSync('views/CurrencyConverterView.tsx', content);
