///
//// ============================================================================
//// REQUIREMENT TRACEABILITY
//// ============================================================================
//// Requirement ID: REQ-CALC-001
//// User Story: As a user, I need a calculator that supports +, -, ×, ÷, decimals,
////             clear, backspace, and equals with keyboard support.
//// Acceptance Criteria: See work item; includes division by zero safe handling.
//// GxP Impact: YES - Accuracy of results is critical.
//// Risk Level: MEDIUM
//// Validation Protocol: VP-CALC-001
//// ============================================================================
////
//// IMPORTS AND DEPENDENCIES
//// None - pure logic
//// ============================================================================
///

/**
 * Calculator finite-state model.
 * state: {
 *   display: string,         // current display text
 *   expression: string,      // human-readable expression
 *   operand: string|null,    // current input number as string
 *   accumulator: number|null,// stored value
 *   operator: '+'|'-'|'*'|'/'|null,
 *   memory: number|null,     // calculator memory register
 *   error: string|null       // error message to show when error state
 * }
 */

// PUBLIC_INTERFACE
export function initialState() {
  /** Returns a new initial calculator state. */
  return {
    display: "0",
    expression: "",
    operand: null,
    accumulator: null,
    operator: null,
    memory: null,
    error: null,
  };
}

// PUBLIC_INTERFACE
export function inputDigit(state, digit) {
  /** Accept a numeric digit (0-9). Only mutates operand and display; resets error if present. */
  if (!/^[0-9]$/.test(String(digit))) return state;
  if (state.error) {
    // Reset on digit after error; do not carry previous accumulator/operator
    return {
      ...initialState(),
      display: digit === "0" ? "0" : digit,
      operand: digit === "0" ? "0" : digit,
    };
  }
  const current = state.operand ?? "0";
  const next = current === "0" ? digit : current + digit;
  return {
    ...state,
    operand: next,
    display: next,
  };
}

// PUBLIC_INTERFACE
export function inputDecimal(state) {
  /** Adds a decimal point to current operand. Only mutates operand and display; resets error if present. */
  if (state.error) {
    // Reset error and start new decimal operand
    return {
      ...initialState(),
      display: "0.",
      operand: "0.",
    };
  }
  const current = state.operand ?? "0";
  if (current.includes(".")) return state;
  const next = current + ".";
  return {
    ...state,
    operand: next,
    display: next,
  };
}

// PUBLIC_INTERFACE
export function chooseOperator(state, op) {
  /**
   * Selects an operator and manages chaining.
   * Strategy:
   * - If accumulator, operator, and operand exist: compute interim result; accumulator=result; clear operand; display=result; set operator=op.
   * - If only operand exists: move it to accumulator; clear operand; set operator=op.
   * - If neither exists: use current display as base accumulator; set operator=op.
   * - If just toggling operator: update operator only.
   */
  if (!["+", "-", "*", "/"].includes(op)) return state;
  if (state.error) {
    // Ignore operator while in error state
    return state;
  }

  const hasOperand = state.operand != null;
  const operandNum = hasOperand ? Number(state.operand) : null;
  if (hasOperand && Number.isNaN(operandNum)) {
    // Defensive NaN guard
    return {
      ...state,
      error: "Invalid number",
      display: "Error",
      operand: null,
      operator: null,
      accumulator: null,
    };
  }

  // Case 1: chain compute when accumulator, operator and operand are present
  if (state.accumulator != null && state.operator && hasOperand) {
    const interim = computeBinary(state.accumulator, state.operator, operandNum);
    if (interim.error) {
      return {
        ...state,
        error: interim.error,
        display: "Error",
        expression: `${sanitizeNumber(state.accumulator)} ${symbolFor(state.operator)} ${sanitizeNumber(operandNum)} =`,
        operand: null,
        operator: null,
        accumulator: null,
      };
    }
    return {
      ...state,
      accumulator: interim.value,
      operand: null,
      operator: op,
      display: String(interim.value),
      error: null,
      expression: "", // not finalized during chaining
    };
  }

  // Case 2: only operand exists -> move it to accumulator and set operator
  if (hasOperand) {
    return {
      ...state,
      accumulator: operandNum,
      operator: op,
      operand: null,
      display: String(operandNum),
      expression: "",
    };
  }

  // Case 3: neither operand nor accumulator -> use current display as base accumulator
  if (state.accumulator == null) {
    const base = Number(state.display || 0);
    if (Number.isNaN(base)) {
      return {
        ...state,
        error: "Invalid number",
        display: "Error",
        operand: null,
        operator: null,
        accumulator: null,
      };
    }
    return {
      ...state,
      accumulator: base,
      operator: op,
      operand: null,
      display: String(base),
      expression: "",
    };
  }

  // Case 4: toggle operator without computing
  return {
    ...state,
    operator: op,
  };
}

// PUBLIC_INTERFACE
export function evaluate(state) {
  /**
   * Computes accumulator (operator) operand.
   * - If both operands present: compute and finalize expression 'a [symbol] b ='.
   * - On division by zero: set display 'Error' and clear accumulator/operator/operand; set error message.
   * - If missing second operand: normalize by clearing operator and keeping current accumulator/display.
   */
  if (state.error) return state;

  const op = state.operator;

  // If no operator, normalize to show current number
  if (!op) {
    const base = state.accumulator != null ? state.accumulator : Number(state.display || 0);
    if (Number.isNaN(base)) {
      return {
        ...state,
        error: "Invalid number",
        display: "Error",
        operand: null,
        operator: null,
        accumulator: null,
      };
    }
    return {
      ...state,
      accumulator: base,
      operand: null,
      operator: null,
      expression: "",
      display: String(base),
    };
  }

  // Operator present but missing second operand -> normalize by clearing operator
  if (state.operand == null) {
    const base = state.accumulator != null ? state.accumulator : Number(state.display || 0);
    if (Number.isNaN(base)) {
      return {
        ...state,
        error: "Invalid number",
        display: "Error",
        operand: null,
        operator: null,
        accumulator: null,
      };
    }
    return {
      ...state,
      accumulator: base,
      operand: null,
      operator: null,
      expression: "",
      display: String(base),
    };
  }

  const a = state.accumulator != null ? state.accumulator : Number(state.display || 0);
  const b = Number(state.operand);

  if (Number.isNaN(a) || Number.isNaN(b)) {
    return {
      ...state,
      error: "Invalid number",
      display: "Error",
      operand: null,
      operator: null,
      accumulator: null,
    };
  }

  const result = computeBinary(a, op, b);
  const expr = `${sanitizeNumber(a)} ${symbolFor(op)} ${sanitizeNumber(b)} =`;

  if (result.error) {
    // Division by zero or similar error
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
    ...state,
    display: String(result.value),
    expression: expr,
    operand: null,
    accumulator: result.value,
    operator: null,
    error: null,
  };
}

// PUBLIC_INTERFACE
export function clearAll() {
  /** Resets state to initial. */
  return initialState();
}

// PUBLIC_INTERFACE
export function backspace(state) {
  /** Removes last character from operand; no-op on error or when no operand. */
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

// PUBLIC_INTERFACE
export function memoryClear(state) {
  /** Clears memory register to null. */
  if (!state) return initialState();
  return { ...state, memory: null };
}

// PUBLIC_INTERFACE
export function memoryRecall(state) {
  /**
   * Recalls memory into current operand/display when not in error.
   * If memory is null -> no-op. If in error -> no-op.
   */
  if (state.error) return state;
  if (state.memory == null) return state;
  const valueStr = String(state.memory);
  return {
    ...state,
    operand: valueStr,
    display: valueStr,
  };
}

// PUBLIC_INTERFACE
export function memoryAdd(state) {
  /** Adds current displayed numeric value to memory (treat null as 0). */
  if (state.error) return state;
  const currentDisplay = Number(state.display || 0);
  const base = state.memory == null ? 0 : Number(state.memory);
  if (Number.isNaN(currentDisplay) || Number.isNaN(base)) return state;
  return { ...state, memory: base + currentDisplay };
}

// PUBLIC_INTERFACE
export function memorySubtract(state) {
  /** Subtracts current displayed numeric value from memory (treat null as 0). */
  if (state.error) return state;
  const currentDisplay = Number(state.display || 0);
  const base = state.memory == null ? 0 : Number(state.memory);
  if (Number.isNaN(currentDisplay) || Number.isNaN(base)) return state;
  return { ...state, memory: base - currentDisplay };
}
