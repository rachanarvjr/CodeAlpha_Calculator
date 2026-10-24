// --- Calculation Engine (Separated from UI Logic) ---
class CalculatorEngine {
    static add(a, b) {
        return a + b;
    }

    static subtract(a, b) {
        return a - b;
    }

    static multiply(a, b) {
        return a * b;
    }

    static divide(a, b) {
        if (b === 0) {
            throw new Error("Cannot divide by zero");
        }
        return a / b;
    }

    static compute(operator, prev, current) {
        const prevNum = parseFloat(prev);
        const currentNum = parseFloat(current);

        if (isNaN(prevNum) || isNaN(currentNum)) return null;

        let result;
        switch (operator) {
            case '+':
                result = this.add(prevNum, currentNum);
                break;
            case '-':
                result = this.subtract(prevNum, currentNum);
                break;
            case '*':
                result = this.multiply(prevNum, currentNum);
                break;
            case '/':
                result = this.divide(prevNum, currentNum);
                break;
            default:
                return null;
        }

        // Handle floating point precision issues (e.g. 0.1 + 0.2)
        return parseFloat(result.toFixed(10));
    }
}

// --- UI Controller & Application State ---
class CalculatorUI {
    constructor() {
        this.previousOperandElement = document.getElementById('previous-operand');
        this.currentOperandElement = document.getElementById('current-operand');
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.resetScreenNext = false;
    }

    delete() {
        if (this.resetScreenNext) return;
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') {
            this.clear();
            return;
        }
        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero' || this.resetScreenNext) {
            this.currentOperand = '';
            this.resetScreenNext = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number;
        } else {
            this.currentOperand += number;
        }
    }

    chooseOperation(operator) {
        if (this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') return;
        if (this.currentOperand === '') return;

        if (this.previousOperand !== '') {
            this.compute();
        }

        this.operation = operator;
        this.previousOperand = `${this.currentOperand} ${operator}`;
        this.currentOperand = '';
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        try {
            const op = this.previousOperand.slice(-1);
            computation = CalculatorEngine.compute(op, prev, current);
            this.currentOperand = computation.toString();
            this.operation = undefined;
            this.previousOperand = '';
            this.resetScreenNext = true;
        } catch (error) {
            this.currentOperand = error.message;
            this.previousOperand = '';
            this.operation = undefined;
            this.resetScreenNext = true;
        }
    }

    changeSign() {
        if (this.currentOperand === '0' || this.currentOperand === 'Error' || this.currentOperand === 'Cannot divide by zero') return;
        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    percentage() {
        const currentNum = parseFloat(this.currentOperand);
        if (isNaN(currentNum)) return;
        this.currentOperand = (currentNum / 100).toString();
    }

    updateDisplay() {
        this.currentOperandElement.textContent = this.currentOperand;
        this.previousOperandElement.textContent = this.previousOperand;
    }
}

// --- Initialization & Event Binding ---
const calculator = new CalculatorUI();

// Button Click Listeners
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const value = button.getAttribute('data-value');
        const action = button.getAttribute('data-action');

        if (button.classList.contains('number')) {
            calculator.appendNumber(value);
        } else if (action === 'operator') {
            calculator.chooseOperation(value);
        } else if (action === 'calculate') {
            calculator.compute();
        } else if (action === 'clear') {
            calculator.clear();
        } else if (action === 'delete') {
            calculator.delete();
        } else if (action === 'sign') {
            calculator.changeSign();
        }
        calculator.updateDisplay();
    });
});

// Keyboard Support
document.addEventListener('keydown', (e) => {
    if ((e.key >= '0' && e.key <= '9') || e.key === '.') {
        calculator.appendNumber(e.key);
    } else if (e.key === '+' || e.key === '-' || e.key === '*') {
        calculator.chooseOperation(e.key);
    } else if (e.key === '/') {
        e.preventDefault(); // Prevent quick find shortcut in browser
        calculator.chooseOperation('/');
    } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        calculator.compute();
    } else if (e.key === 'Backspace') {
        calculator.delete();
    } else if (e.key === 'Escape') {
        calculator.clear();
    }
    calculator.updateDisplay();
});