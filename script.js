// ---------- CONFIGURAÇÃO DOS BOTÕES: Nomes, valores, ações ----------
const buttonsConfig = [
    // Linha 1: funções unárias/limpeza
    { label: "AC",   action: "clear",        value: "clear",     type: "control" },
    { label: "±",    action: "negate",       value: "negate",    type: "unary" },
    { label: "%",    action: "percent",      value: "percent",   type: "unary" },
    { label: "√",    action: "sqrt",         value: "sqrt",      type: "unary" },
    { label: "^",    action: "power",        value: "^",         type: "operator" },
    // Linha 2: numerais e operadores
    { label: "7",    action: "number",       value: "7",         type: "digit" },
    { label: "8",    action: "number",       value: "8",         type: "digit" },
    { label: "9",    action: "number",       value: "9",         type: "digit" },
    { label: "÷",    action: "operator",     value: "/",         type: "operator" },
    { label: "×",    action: "operator",     value: "*",         type: "operator" },
    // Linha 3
    { label: "4",    action: "number",       value: "4",         type: "digit" },
    { label: "5",    action: "number",       value: "5",         type: "digit" },
    { label: "6",    action: "number",       value: "6",         type: "digit" },
    { label: "-",    action: "operator",     value: "-",         type: "operator" },
    { label: "+",    action: "operator",     value: "+",         type: "operator" },
    // Linha 4
    { label: "1",    action: "number",       value: "1",         type: "digit" },
    { label: "2",    action: "number",       value: "2",         type: "digit" },
    { label: "3",    action: "number",       value: "3",         type: "digit" },
    { label: "=",    action: "equals",       value: "=",         type: "equal" },
    { label: "π",    action: "constant",     value: "π",         type: "const" },
    // Linha 5
    { label: "0",    action: "number",       value: "0",         type: "digit" },
    { label: ".",    action: "decimal",      value: ".",         type: "digit" },
    { label: "e",    action: "constant",     value: "e",         type: "const" },
    { label: "⌫",    action: "backspace",    value: "back",      type: "control" },
    { label: "x²",   action: "square",       value: "square",    type: "unary" }
];

// Estado da calculadora
let currentInput = "0";
let previousValue = null;
let currentOperator = null;
let waitingForOperand = false;
let expressionHistory = "";
let lastResult = null;

// Elementos DOM
const resultDiv = document.getElementById("resultDisplay");
const expressionSpan = document.getElementById("expressionDisplay");

// Atualiza display principal
function updateDisplay() {
    let displayValue = currentInput;
    if (displayValue === "") displayValue = "0";
    if (displayValue.length > 18 && !displayValue.includes("e")) {
        let num = parseFloat(displayValue);
        if (!isNaN(num)) displayValue = num.toExponential(12);
    }
    resultDiv.innerText = displayValue;
    
    if (expressionHistory) {
        expressionSpan.innerText = expressionHistory;
    } else if (previousValue !== null && currentOperator) {
        expressionSpan.innerText = `${formatNumberForExpr(previousValue)} ${currentOperator} `;
    } else {
        expressionSpan.innerText = "";
    }
}

function formatNumberForExpr(num) {
    if (num === null || num === undefined) return "";
    if (typeof num === "number") {
        if (Math.abs(num) > 1e12) return num.toExponential(8);
        return num.toString();
    }
    return num.toString();
}

// Operações básicas
function calculate(a, op, b) {
    a = parseFloat(a);
    b = parseFloat(b);
    if (isNaN(a) || isNaN(b)) return NaN;
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': 
            if (b === 0) return NaN;
            return a / b;
        case '^': return Math.pow(a, b);
        default: return NaN;
    }
}

// Executa operação pendente
function performPendingOperation() {
    if (previousValue !== null && currentOperator !== null && !waitingForOperand) {
        let currentVal = parseFloat(currentInput);
        if (isNaN(currentVal)) {
            clearAll();
            return;
        }
        let result = calculate(previousValue, currentOperator, currentVal);
        if (isNaN(result) || !isFinite(result)) {
            resultDiv.innerText = "ERRO";
            expressionSpan.innerText = "Indefinido";
            currentInput = "Erro";
            previousValue = null;
            currentOperator = null;
            waitingForOperand = true;
            return;
        }
        currentInput = result.toString();
        previousValue = null;
        currentOperator = null;
        waitingForOperand = true;
        lastResult = result;
        updateDisplay();
    }
}

// Entrada numérica
function inputNumber(num) {
    if (currentInput === "Erro") clearAll();
    if (waitingForOperand) {
        currentInput = num;
        waitingForOperand = false;
    } else {
        if (currentInput === "0" && num !== ".") {
            currentInput = num;
        } else {
            currentInput += num;
        }
    }
    if (currentInput.length > 20 && !currentInput.includes("e")) {
        currentInput = currentInput.slice(0, 20);
    }
    updateDisplay();
}

function inputDecimal() {
    if (currentInput === "Erro") clearAll();
    if (waitingForOperand) {
        currentInput = "0.";
        waitingForOperand = false;
        updateDisplay();
        return;
    }
    if (!currentInput.includes(".")) {
        currentInput += ".";
    }
    updateDisplay();
}

function backspace() {
    if (currentInput === "Erro") {
        clearAll();
        return;
    }
    if (waitingForOperand) return;
    if (currentInput.length === 1 || (currentInput.length === 2 && currentInput.startsWith("-"))) {
        currentInput = "0";
    } else {
        currentInput = currentInput.slice(0, -1);
        if (currentInput === "" || currentInput === "-") currentInput = "0";
    }
    updateDisplay();
}

function negate() {
    if (currentInput === "Erro") clearAll();
    let num = parseFloat(currentInput);
    if (isNaN(num)) return;
    num = -num;
    currentInput = num.toString();
    if (waitingForOperand) {
        waitingForOperand = false;
    }
    updateDisplay();
}

function percent() {
    if (currentInput === "Erro") clearAll();
    let num = parseFloat(currentInput);
    if (isNaN(num)) return;
    num = num / 100;
    currentInput = num.toString();
    updateDisplay();
}

function sqrtOp() {
    if (currentInput === "Erro") clearAll();
    let num = parseFloat(currentInput);
    if (isNaN(num) || num < 0) {
        resultDiv.innerText = "ERRO";
        expressionSpan.innerText = "sqrt domínio";
        currentInput = "Erro";
        waitingForOperand = true;
        previousValue = null;
        currentOperator = null;
        updateDisplay();
        return;
    }
    let res = Math.sqrt(num);
    currentInput = res.toString();
    waitingForOperand = true;
    previousValue = null;
    currentOperator = null;
    updateDisplay();
    expressionHistory = `√(${num.toFixed(6)}) = ${res.toFixed(8)}`;
    updateDisplay();
}

function squareOp() {
    if (currentInput === "Erro") clearAll();
    let num = parseFloat(currentInput);
    if (isNaN(num)) return;
    let res = num * num;
    currentInput = res.toString();
    waitingForOperand = true;
    previousValue = null;
    currentOperator = null;
    updateDisplay();
    expressionHistory = `${num}² = ${res}`;
    updateDisplay();
}

function constant(value) {
    if (currentInput === "Erro") clearAll();
    let constVal = (value === 'π') ? Math.PI : Math.E;
    if (waitingForOperand || currentInput === "0") {
        currentInput = constVal.toString();
        waitingForOperand = false;
    } else {
        currentInput += constVal.toString();
    }
    updateDisplay();
}

function setOperator(op) {
    if (currentInput === "Erro") {
        clearAll();
        return;
    }
    if (previousValue !== null && currentOperator !== null && !waitingForOperand) {
        let currentVal = parseFloat(currentInput);
        if (!isNaN(currentVal)) {
            let result = calculate(previousValue, currentOperator, currentVal);
            if (isNaN(result) || !isFinite(result)) {
                resultDiv.innerText = "ERRO";
                expressionSpan.innerText = "Math Error";
                currentInput = "Erro";
                previousValue = null;
                currentOperator = null;
                waitingForOperand = true;
                updateDisplay();
                return;
            }
            previousValue = result;
            currentInput = result.toString();
            waitingForOperand = true;
            updateDisplay();
        } else {
            clearAll();
            return;
        }
    }
    currentOperator = op;
    previousValue = parseFloat(currentInput);
    if (isNaN(previousValue)) {
        clearAll();
        return;
    }
    waitingForOperand = true;
    expressionHistory = `${formatNumberForExpr(previousValue)} ${op}`;
    updateDisplay();
}

function equals() {
    if (currentInput === "Erro") {
        clearAll();
        return;
    }
    if (previousValue !== null && currentOperator !== null && !waitingForOperand) {
        let currentVal = parseFloat(currentInput);
        if (isNaN(currentVal)) {
            clearAll();
            return;
        }
        let result = calculate(previousValue, currentOperator, currentVal);
        if (isNaN(result) || !isFinite(result)) {
            resultDiv.innerText = "ERRO";
            expressionSpan.innerText = "Operação inválida";
            currentInput = "Erro";
            previousValue = null;
            currentOperator = null;
            waitingForOperand = true;
            updateDisplay();
            return;
        }
        currentInput = result.toString();
        expressionHistory = `${formatNumberForExpr(previousValue)} ${currentOperator} ${formatNumberForExpr(currentVal)} = ${result}`;
        previousValue = null;
        currentOperator = null;
        waitingForOperand = true;
        lastResult = result;
        updateDisplay();
    } else if (!waitingForOperand && previousValue === null && currentOperator === null) {
        expressionHistory = "";
        updateDisplay();
    }
    updateDisplay();
}

function clearAll() {
    currentInput = "0";
    previousValue = null;
    currentOperator = null;
    waitingForOperand = false;
    expressionHistory = "";
    updateDisplay();
}

// Dispatcher de eventos
function handleButton(btn) {
    const action = btn.action;
    const val = btn.value;

    switch (action) {
        case "number": inputNumber(val); break;
        case "decimal": inputDecimal(); break;
        case "backspace": backspace(); break;
        case "clear": clearAll(); break;
        case "negate": negate(); break;
        case "percent": percent(); break;
        case "sqrt": sqrtOp(); break;
        case "square": squareOp(); break;
        case "constant": constant(val); break;
        case "operator": setOperator(val); break;
        case "equals": equals(); break;
        case "power": setOperator("^"); break;
        default: break;
    }
}

// Gera formas únicas para cada botão
function generateUniqueShapes() {
    const keys = document.querySelectorAll(".key");
    keys.forEach((key, idx) => {
        const r1 = 20 + (Math.sin(idx) * 40);
        const r2 = 30 + (Math.cos(idx * 1.7) * 35);
        const r3 = 15 + (Math.sin(idx * 2.3) * 45);
        const r4 = 25 + (Math.cos(idx * 0.9) * 50);
        const r5 = 40 + (Math.sin(idx * 1.1) * 30);
        const r6 = 20 + (Math.cos(idx * 1.4) * 45);
        const r7 = 10 + (Math.sin(idx * 2.8) * 55);
        const r8 = 35 + (Math.cos(idx * 0.5) * 40);
        
        const borderRadiusVal = `${Math.abs(r1)}% ${Math.abs(r2)}% ${Math.abs(r3)}% ${Math.abs(r4)}% / ${Math.abs(r5)}% ${Math.abs(r6)}% ${Math.abs(r7)}% ${Math.abs(r8)}%`;
        key.style.borderRadius = borderRadiusVal;
        key.style.transition = "border-radius 0.4s ease, transform 0.1s";
    });
}

// Monta a interface da calculadora
function buildCalculatorUI() {
    const gridContainer = document.getElementById("keyGrid");
    gridContainer.innerHTML = "";
    buttonsConfig.forEach((btn, idx) => {
        const button = document.createElement("button");
        button.className = "key";
        button.innerText = btn.label;
        button.setAttribute("data-action", btn.action);
        button.setAttribute("data-value", btn.value);
        if (btn.type === "unary") button.setAttribute("data-func", "unary");
        if (btn.action === "equals") button.style.fontSize = "1.8rem";
        if (btn.label === "π") button.style.fontFamily = "monospace";
        if (btn.label === "e") button.style.fontWeight = "bold";
        
        button.addEventListener("click", (e) => {
            e.preventDefault();
            handleButton(btn);
            button.style.transform = "scale(0.96)";
            setTimeout(() => { button.style.transform = ""; }, 100);
        });
        gridContainer.appendChild(button);
    });
    generateUniqueShapes();
    window.addEventListener('resize', () => generateUniqueShapes());
}

// Suporte a teclado físico
function handleKeyboard(e) {
    const key = e.key;
    const validDigits = /[0-9]/;
    if (validDigits.test(key)) {
        e.preventDefault();
        inputNumber(key);
    } else if (key === '.') {
        e.preventDefault();
        inputDecimal();
    } else if (key === '+' || key === '-' || key === '*' || key === '/') {
        e.preventDefault();
        setOperator(key);
    } else if (key === '^') {
        e.preventDefault();
        setOperator('^');
    } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        equals();
    } else if (key === 'Escape') {
        e.preventDefault();
        clearAll();
    } else if (key === 'Backspace') {
        e.preventDefault();
        backspace();
    } else if (key === '%') {
        e.preventDefault();
        percent();
    } else if (key === 's') {
        e.preventDefault();
        sqrtOp();
    }
}

// Inicialização
function init() {
    buildCalculatorUI();
    updateDisplay();
    window.addEventListener('keydown', handleKeyboard);
}

// Executa quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
