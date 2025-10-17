/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-CALC-001
// User Story: As a user, I need a calculator that supports +, -, ×, ÷, decimals,
//             clear, backspace, and equals with keyboard support.
// Acceptance Criteria: See work item; includes division by zero safe handling.
// GxP Impact: YES - Accuracy of results is critical.
// Risk Level: MEDIUM
// Validation Protocol: VP-CALC-001
// ============================================================================
//
// IMPORTS AND DEPENDENCIES
// None - pure logic
// ============================================================================
 */

/**
 * Calculator finite-state model.
 * state: {
 *   display: string,         // current display text
 *   expression: string,      // human-readable expression
 *   operand: string|null,    // current input number as string
 *   accumulator: number|null,// stored value
 *   operator: '+'|'-'|'*'|'/'|null,
 *   error: string|null       // error message to show when error state
 * }
 */

/**
// PUBLIC_INTERFACE
 * initialState
 * Returns a new initial calculator state.
 * GxP Critical: Yes
 * Returns: State object
 */
export function initialState() {
  return {
    display: "0",
    expression: "",
    operand: null,
    accumulator: null,
    operator: null,
    error: null,
  };
}

/**
// PUBLIC_INTERFACE
 * inputDigit
 * Purpose: Accept a numeric digit (0-9) input.
 * GxP Critical: Yes
 * Parameters:
 *  - state: current state object
 *  - digit: string in '0'..'9'
 * Returns: new state
 * Throws: none, validates digit
 * Audit: Should be logged by UI layer (INPUT_DIGIT)
 */
export function inputDigit(state, digit) {
  if (!/^[0-9]$/.test(String(digit))) return state;
  if (state.error) {
    // Reset on digit after error
    return {
      ...initialState(),
      display: digit === "0" ? "0" : digit,
      operand: digit === "0" ? "0" : digit,
    };
  }
  const current = state.operand ?? state.display ?? "0";
  const next = current === "0" ? digit : current + digit;
  return {
    ...state,
    operand: next,
    display: next,
  };
}

/**
// PUBLIC_INTERFACE
 * inputDecimal
 * Adds a decimal point to current operand.
 * GxP Critical: Yes
 */
export function inputDecimal(state) {
  if (state.error) {
    return {
      ...initialState(),
      display: "0.",
      operand: "0.",
    };
  }
  const current = state.operand ?? state.display ?? "0";
  if (current.includes(".")) return state;
  const next = current + ".";
  return {
    ...state,
    operand: next,
    display: next,
  };
}

/**
// PUBLIC_INTERFACE
 * chooseOperator
 * Purpose: Selects an operator and manages chaining.
 * GxP Critical: Yes
 * Parameters: op in ['+','-','*','/']
 */
export function chooseOperator(state, op) {
  if (!["+", "-", "*", "/"].includes(op)) return state;
  if (state.error) {
    // Ignore operator while in error
    return state;
  }
  const operandNum = state.operand != null ? Number(state.operand) : null;

  // If we have both accumulator and operand, compute intermediate result
  if (state.operator && operandNum != null && state.accumulator != null) {
    const interim = computeBinary(state.accumulator, state.operator, operandNum);
    if (interim.error) {
      return {
        ...state,
        error: interim.error,
        display: "Error",
        expression: formatExpression(state.expression, state.operator, state.operand),
      };
    }
    return {
      display: String(interim.value),
      expression: "",
      operand: null,
      accumulator: interim.value,
      operator: op,
      error: null,
    };
  }

  // Move operand into accumulator if present; otherwise if no accumulator, keep display as accumulator
  if (operandNum != null) {
    return {
      ...state,
      accumulator: operandNum,
      operator: op,
      operand: null,
      expression: "",
      display: String(operandNum),
    };
  }

  if (state.accumulator == null) {
    const base = Number(state.display || 0);
    return {
      ...state,
      accumulator: base,
      operator: op,
      operand: null,
      expression: "",
      display: String(base),
    };
  }

  // Just change the operator if user toggles it
  return {
    ...state,
    operator: op,
  };
}

/**
// PUBLIC_INTERFACE
 * evaluate
 * Purpose: Computes accumulator (operator) operand.
 * GxP Critical: Yes
 */
export function evaluate(state) {
  if (state.error) return state;
  const a = state.accumulator != null ? state.accumulator : Number(state.display || 0);
  const b = state.operand != null ? Number(state.operand) : null;
  const op = state.operator;
  if (op == null || b == null) {
    // Nothing to compute; normalize display
    return {
      ...state,
      accumulator: a,
      operand: null,
      operator: null,
      expression: "",
      display: String(a),
    };
  }
  const result = computeBinary(a, op, b);
  const expr = `${sanitizeNumber(a)} ${symbolFor(op)} ${sanitizeNumber(b)} =`;
  if (result.error) {
    return {
      ...state,
      error: result.error,
      display: "Error",
      expression: expr,
      operand: null,
      operator: null,
      accumulator: null,
    };
  }
  return {
    display: String(result.value),
    expression: expr,
    operand: null,
    accumulator: result.value,
    operator: null,
    error: null,
  };
}

/**
// PUBLIC_INTERFACE
 * clearAll
 * Purpose: Resets state to initial.
 * GxP Critical: No
 */
export function clearAll() {
  return initialState();
}

/**
// PUBLIC_INTERFACE
 * backspace
 * Purpose: Removes last character from operand; no-op on error or when no operand.
 * GxP Critical: No
 */
export function backspace(state) {
  if (state.error) return state;
  const curr = state.operand;
  if (curr == null) return state;
  if (curr.length <= 1) {
    return { ...state, operand: "0", display: "0" };
  }
  const next = curr.slice(0, -1);
  return { ...state, operand: next, display: next };
}

// Helpers

function sanitizeNumber(n) {
  const s = String(n);
  return s.replace(/[^0-9.\-]/g, "");
}

function symbolFor(op) {
  return op === "*" ? "×" : op === "/" ? "÷" : op;
}

/**
 * Computes binary operation with safe division.
 * Returns { value: number } or { error: string }
 */
function computeBinary(a, op, b) {
  if (typeof a !== "number" || typeof b !== "number" || Number.isNaN(a) || Number.isNaN(b)) {
    return { error: "Invalid number" };
  }
  switch (op) {
    case "+":
      return { value: a + b };
    case "-":
      return { value: a - b };
    case "*":
      return { value: a * b };
    case "/":
      if (b === 0) return { error: "Division by zero" };
      return { value: a / b };
    default:
      return { error: "Unknown operator" };
  }
}

function formatExpression(expr, op, operandStr) {
  if (!operandStr) return expr;
  const symbol = symbolFor(op);
  return `${expr} ${symbol} ${sanitizeNumber(operandStr)}`.trim();
}
