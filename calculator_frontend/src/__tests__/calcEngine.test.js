/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-CALC-TEST-001
// User Story: As a developer, I need unit tests to verify calculator logic.
// Acceptance Criteria: >=80% coverage for calcEngine; tests cover edge cases.
// GxP Impact: YES - Validation of critical calculation logic.
// Risk Level: MEDIUM
// Validation Protocol: VP-CALC-TEST-001
// ============================================================================
*/

import {
  initialState,
  inputDigit,
  inputDecimal,
  chooseOperator,
  evaluate,
  clearAll,
  backspace,
} from '../utils/calcEngine';

describe('calcEngine - basic operations', () => {
  test('initial state', () => {
    const s = initialState();
    expect(s.display).toBe('0');
    expect(s.operator).toBeNull();
  });

  test('multi-digit input', () => {
    let s = initialState();
    s = inputDigit(s, '1');
    s = inputDigit(s, '2');
    s = inputDigit(s, '3');
    expect(s.display).toBe('123');
  });

  test('decimal input guards duplicate dot', () => {
    let s = initialState();
    s = inputDigit(s, '9');
    s = inputDecimal(s);
    s = inputDigit(s, '5');
    s = inputDecimal(s); // should be ignored
    expect(s.display).toBe('9.5');
  });

  test('addition 12 + 3 = 15', () => {
    let s = initialState();
    s = inputDigit(s, '1');
    s = inputDigit(s, '2');
    s = chooseOperator(s, '+');
    s = inputDigit(s, '3');
    s = evaluate(s);
    expect(s.display).toBe('15');
    expect(s.expression).toMatch(/12 .* 3 =/);
  });

  test('subtraction chaining 10 - 2 - 3 = 5', () => {
    let s = initialState();
    s = inputDigit(s, '1');
    s = inputDigit(s, '0');
    s = chooseOperator(s, '-');
    s = inputDigit(s, '2');
    s = chooseOperator(s, '-'); // chain
    s = inputDigit(s, '3');
    s = evaluate(s);
    expect(s.display).toBe('5');
  });

  test('multiplication 7 * 8 = 56', () => {
    let s = initialState();
    s = inputDigit(s, '7');
    s = chooseOperator(s, '*');
    s = inputDigit(s, '8');
    s = evaluate(s);
    expect(s.display).toBe('56');
  });

  test('division 9 / 3 = 3', () => {
    let s = initialState();
    s = inputDigit(s, '9');
    s = chooseOperator(s, '/');
    s = inputDigit(s, '3');
    s = evaluate(s);
    expect(s.display).toBe('3');
  });

  test('division by zero shows error', () => {
    let s = initialState();
    s = inputDigit(s, '9');
    s = chooseOperator(s, '/');
    s = inputDigit(s, '0');
    s = evaluate(s);
    expect(s.display).toBe('Error');
    expect(s.error).toBe('Division by zero');
  });
});

describe('calcEngine - controls', () => {
  test('clear resets to initial', () => {
    let s = initialState();
    s = inputDigit(s, '4');
    s = chooseOperator(s, '+');
    s = inputDigit(s, '4');
    s = clearAll();
    expect(s.display).toBe('0');
    expect(s.operator).toBeNull();
  });

  test('backspace removes last char of operand', () => {
    let s = initialState();
    s = inputDigit(s, '1');
    s = inputDigit(s, '2');
    s = inputDigit(s, '3');
    s = backspace(s);
    expect(s.display).toBe('12');
    s = backspace(s);
    s = backspace(s);
    expect(s.display).toBe('0');
  });

  test('operator toggle changes operator without computing', () => {
    let s = initialState();
    s = inputDigit(s, '8');
    s = chooseOperator(s, '+');
    s = chooseOperator(s, '-');
    expect(s.operator).toBe('-');
  });

  test('evaluate without operand normalizes state', () => {
    let s = initialState();
    s = inputDigit(s, '5');
    s = chooseOperator(s, '+');
    s = evaluate(s); // no second operand
    expect(s.display).toBe('5');
    expect(s.operator).toBeNull();
  });
});
