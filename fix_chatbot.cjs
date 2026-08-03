const fs = require('fs');

let chatbotCode = fs.readFileSync('components/Chatbot.tsx', 'utf8');

if (!chatbotCode.includes('generateId')) {
    // try to add import
    chatbotCode = "import { generateId } from '../constants';\n" + chatbotCode;
}

chatbotCode = chatbotCode.replace(/id: Date\.now\(\) \+ 1/g, "id: generateId()");
chatbotCode = chatbotCode.replace(/id: Date\.now\(\)/g, "id: generateId()");

fs.writeFileSync('components/Chatbot.tsx', chatbotCode);
