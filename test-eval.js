const safeEvaluate = (expression) => {
    if (/[^0-9.+\-*/%()]/.test(expression)) {
        throw new Error("Invalid characters in expression");
    }

    const tokens = [];
    let num = '';
    for (let i = 0; i < expression.length; i++) {
        const char = expression[i];
        if (/[0-9.]/.test(char)) {
            num += char;
        } else {
            if (num) {
                tokens.push(num);
                num = '';
            }
            if (/[+\-*/%()]/.test(char)) {
                tokens.push(char);
            }
        }
    }
    if (num) tokens.push(num);

    let pos = 0;
    const peek = () => tokens[pos];
    const consume = () => tokens[pos++];
    
    const parsePrimary = () => {
        const token = consume();
        if (!token) throw new Error("Unexpected end of expression");
        if (token === '-') return -parsePrimary();
        if (token === '+') return parsePrimary();
        if (token === '(') {
            const val = parseExpression();
            if (consume() !== ')') throw new Error("Expected )");
            if (peek() === '%') {
                consume();
                return val / 100;
            }
            return val;
        }
        let val = parseFloat(token);
        if (peek() === '%') {
            consume();
            val = val / 100;
        }
        return val;
    };

    const parseFactor = () => {
        let val = parsePrimary();
        while (peek() === '*' || peek() === '/') {
            const op = consume();
            const right = parsePrimary();
            if (op === '*') val *= right;
            else if (op === '/') val /= right;
        }
        return val;
    };

    const parseExpression = () => {
        let val = parseFactor();
        while (peek() === '+' || peek() === '-') {
            const op = consume();
            const right = parseFactor();
            if (op === '+') val += right;
            else if (op === '-') val -= right;
        }
        return val;
    };

    return parseExpression();
};

console.log(safeEvaluate("1+2"));
console.log(safeEvaluate("50%"));
console.log(safeEvaluate("(100+50)%"));
console.log(safeEvaluate("100-20%*100")); // wait, 20% * 100 = 0.2 * 100 = 20, 100 - 20 = 80
