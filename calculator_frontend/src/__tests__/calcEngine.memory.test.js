/// ============================================================================
/// REQUIREMENT TRACEABILITY
/// ============================================================================
/// Requirement ID: REQ-CALC-MEM-001
/// User Story: As a user, I can use calculator memory functions MC, MR, M+, M−.
/// Acceptance Criteria: Memory stored in state; MC nulls memory; MR recalls when not in error;
///                      M+ adds displayed value; M− subtracts displayed value; audit not tested here.
/// GxP Impact: YES - Supports accurate calculations workflow, with audit at UI level.
/// Risk Level: MEDIUM
/// Validation Protocol: VP-CALC-MEM-001
/// ============================================================================

import {
  initialState,
  inputDigit,
  inputDecimal,
  chooseOperator,
  evaluate,
  memoryClear,
  memoryRecall,
  memoryAdd,
  memorySubtract,
} from '../utils/calcEngine';

describe('calcEngine memory functions', () => {
  test('initial memory is null', () => {
    const s = initialState();
    expect(s.memory).toBeNull();
  });

  test('MC clears memory to null', () => {
    let s = { ...initialState(), memory: 10 };
    s = memoryClear(s);
    expect(s.memory).toBeNull();
  });

  test('MR with null memory is no-op', () => {
    let s = initialState();
    s = inputDigit(s, '5');
    const after = memoryRecall(s);
    expect(after.display).toBe('5');
    expect(after.operand).toBe('5');
  });

  test('MR recalls memory into display and operand when memory present', () => {
    let s = initialState();
    s = { ...s, memory: 42.5 };
    s = memoryRecall(s);
    expect(s.display).toBe('42.5');
    expect(s.operand).toBe('42.5');
  });

  test('M+ adds current displayed number to memory; null memory treated as 0', () => {
    let s = initialState();
    // display 3.2
    s = inputDigit(s, '3');
    s = inputDecimal(s);
    s = inputDigit(s, '2');
    s = memoryAdd(s);
    expect(s.memory).toBeCloseTo(3.2);

    // add negative value after compute
    s = chooseOperator(s, '-');
    s = inputDigit(s, '5');
    s = evaluate(s); // 3.2 - 5 = -1.8, displayed -1.8
    s = memoryAdd(s);
    expect(s.memory).toBeCloseTo(3.2 + (-1.8), 10);
  });

  test('M− subtracts current displayed number from memory; null memory treated as 0', () => {
    let s = initialState();
    s = inputDigit(s, '9');
    s = memorySubtract(s); // memory becomes -9
    expect(s.memory).toBe(-9);

    // subtract a decimal value
    s = inputDigit(s, '1'); // starts new operand editing "1" (since operand becomes "1")
    s = inputDecimal(s);
    s = inputDigit(s, '5'); // "1.5"
    s = memorySubtract(s);
    expect(s.memory).toBeCloseTo(-10.5, 10);
  });

  test('Memory ops ignored when in error state', () => {
    // Cause division by zero error
    let s = initialState();
    s = inputDigit(s, '9');
    s = chooseOperator(s, '/');
    s = inputDigit(s, '0');
    s = evaluate(s);
    expect(s.error).toBeTruthy();

    const s1 = memoryAdd(s);
    const s2 = memorySubtract(s);
    const s3 = memoryRecall(s);
    // none should change memory or display beyond error state
    expect(s1).toBe(s); // pure no-op return allowed, but we at least check equality by reference is not guaranteed
    expect(s2.error).toBe('Division by zero');
    expect(s3.display).toBe('Error');
    expect(s.memory).toBeNull();
  });
});
