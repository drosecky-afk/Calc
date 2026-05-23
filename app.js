(function () {
  const resultEl = document.getElementById('result');
  const historyEl = document.getElementById('history');

  let current = '0';
  let previous = null;
  let operator = null;
  let justEvaluated = false;

  const OP_SYMBOL = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  function format(value) {
    if (value === '' || value == null) return '0';
    if (value === 'Error') return 'Error';
    const num = Number(value);
    if (!isFinite(num)) return 'Error';
    let str;
    if (Math.abs(num) >= 1e12 || (num !== 0 && Math.abs(num) < 1e-6)) {
      str = num.toExponential(6);
    } else {
      str = String(value);
    }
    return str.replace('.', ',');
  }

  function render() {
    resultEl.textContent = format(current);
    if (previous != null && operator) {
      historyEl.textContent = `${format(previous)} ${OP_SYMBOL[operator]}`;
    } else {
      historyEl.textContent = '';
    }
  }

  function inputNum(n) {
    if (current === 'Error') current = '0';
    if (justEvaluated) {
      current = n;
      justEvaluated = false;
      return;
    }
    if (current === '0') current = n;
    else if (current.length < 12) current += n;
  }

  function inputDot() {
    if (current === 'Error') current = '0';
    if (justEvaluated) {
      current = '0.';
      justEvaluated = false;
      return;
    }
    if (!current.includes('.')) current += '.';
  }

  function clearAll() {
    current = '0';
    previous = null;
    operator = null;
    justEvaluated = false;
  }

  function toggleSign() {
    if (current === '0' || current === 'Error') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
  }

  function percent() {
    if (current === 'Error') return;
    current = String(Number(current) / 100);
  }

  function compute(a, b, op) {
    a = Number(a); b = Number(b);
    let r;
    switch (op) {
      case '+': r = a + b; break;
      case '-': r = a - b; break;
      case '*': r = a * b; break;
      case '/':
        if (b === 0) return 'Error';
        r = a / b; break;
      default: return b;
    }
    if (!isFinite(r)) return 'Error';
    return String(Math.round(r * 1e10) / 1e10);
  }

  function setOperator(op) {
    if (current === 'Error') return;
    if (previous != null && operator && !justEvaluated) {
      const r = compute(previous, current, operator);
      previous = r;
      current = r;
    } else {
      previous = current;
    }
    operator = op;
    justEvaluated = true;
  }

  function equals() {
    if (operator == null || previous == null) return;
    const r = compute(previous, current, operator);
    current = r;
    previous = null;
    operator = null;
    justEvaluated = true;
  }

  document.querySelector('.keys').addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    switch (action) {
      case 'num': inputNum(btn.dataset.num); break;
      case 'dot': inputDot(); break;
      case 'clear': clearAll(); break;
      case 'sign': toggleSign(); break;
      case 'percent': percent(); break;
      case 'op': setOperator(btn.dataset.op); break;
      case 'equals': equals(); break;
    }
    render();
  });

  document.addEventListener('keydown', (e) => {
    const k = e.key;
    if (/^[0-9]$/.test(k)) { inputNum(k); render(); return; }
    if (k === '.' || k === ',') { inputDot(); render(); return; }
    if (['+', '-', '*', '/'].includes(k)) { setOperator(k); render(); return; }
    if (k === 'Enter' || k === '=') { e.preventDefault(); equals(); render(); return; }
    if (k === 'Escape' || k === 'c' || k === 'C') { clearAll(); render(); return; }
    if (k === '%') { percent(); render(); return; }
    if (k === 'Backspace') {
      if (justEvaluated || current === 'Error') { clearAll(); }
      else { current = current.length > 1 ? current.slice(0, -1) : '0'; }
      render();
    }
  });

  render();
})();
