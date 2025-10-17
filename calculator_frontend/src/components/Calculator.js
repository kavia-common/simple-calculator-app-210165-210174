/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-CALC-UI-001
// User Story: As a user, I can use a calculator UI with buttons and keyboard.
// Acceptance Criteria: Multi-digit, decimal, + - × ÷, equals, clear, backspace.
// GxP Impact: YES - Input accuracy, audit trail logging.
// Risk Level: MEDIUM
// Validation Protocol: VP-CALC-UI-001
// ============================================================================
*/

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Display from "./Display";
import Keypad from "./Keypad";
import {
  initialState,
  inputDigit,
  inputDecimal,
  chooseOperator,
  evaluate,
  clearAll,
  backspace,
} from "../utils/calcEngine";
import { logAudit } from "../utils/audit";

/**
// PUBLIC_INTERFACE
 * Calculator
 * Purpose: Compose the display and keypad; manage state transitions and keyboard.
 * GxP Critical: Yes
 * Parameters: none
 * Returns: JSX.Element
 * Throws: none
 * Audit: Logs user actions with before/after snapshots of state essentials.
 */
export default function Calculator() {
  const [state, setState] = useState(initialState);

  const safeStateView = useCallback((s) => {
    // Limit what we log to values relevant for audit without PII
    return {
      display: s.display,
      expression: s.expression,
      accumulator: s.accumulator,
      operator: s.operator,
      operand: s.operand,
      error: s.error,
    };
  }, []);

  const onDigit = useCallback(
    (d) => {
      setState((prev) => {
        const next = inputDigit(prev, d);
        logAudit({
          action: "INPUT_DIGIT",
          before: safeStateView(prev),
          after: safeStateView(next),
        });
        return next;
      });
    },
    [safeStateView]
  );

  const onDecimal = useCallback(() => {
    setState((prev) => {
      const next = inputDecimal(prev);
      logAudit({
        action: "INPUT_DECIMAL",
        before: safeStateView(prev),
        after: safeStateView(next),
      });
      return next;
    });
  }, [safeStateView]);

  const onOperator = useCallback(
    (op) => {
      setState((prev) => {
        const next = chooseOperator(prev, op);
        logAudit({
          action: "OPERATOR",
          before: safeStateView(prev),
          after: safeStateView(next),
          reason: `Operator ${op}`,
        });
        return next;
      });
    },
    [safeStateView]
  );

  const onEquals = useCallback(() => {
    setState((prev) => {
      const next = evaluate(prev);
      logAudit({
        action: "EVALUATE",
        before: safeStateView(prev),
        after: safeStateView(next),
      });
      return next;
    });
  }, [safeStateView]);

  const onClear = useCallback(() => {
    setState((prev) => {
      const next = clearAll();
      logAudit({
        action: "CLEAR",
        before: safeStateView(prev),
        after: safeStateView(next),
        reason: "User pressed clear",
      });
      return next;
    });
  }, [safeStateView]);

  const onBackspace = useCallback(() => {
    setState((prev) => {
      const next = backspace(prev);
      logAudit({
        action: "BACKSPACE",
        before: safeStateView(prev),
        after: safeStateView(next),
      });
      return next;
    });
  }, [safeStateView]);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      const key = e.key;
      if (/^[0-9]$/.test(key)) {
        onDigit(key);
      } else if (key === ".") {
        onDecimal();
      } else if (key === "+" || key === "-" || key === "*" || key === "/") {
        onOperator(key);
      } else if (key === "Enter" || key === "=") {
        onEquals();
      } else if (key === "Backspace") {
        onBackspace();
      } else if (key === "Escape") {
        onClear();
      } else {
        return;
      }
      // Prevent default to avoid UI glitches
      e.preventDefault();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onDigit, onDecimal, onOperator, onEquals, onBackspace, onClear]);

  const isError = Boolean(state.error);
  const displayValue = state.display;
  const expression = state.expression;

  const footerHint = useMemo(
    () => "Hint: Use keyboard — digits, + - * /, Enter (=), Backspace, Esc (clear).",
    []
  );

  return (
    <div className="calc-wrapper" role="application" aria-label="Simple Calculator">
      <Display expression={expression} value={displayValue} isError={isError} />
      <Keypad
        onDigit={onDigit}
        onDecimal={onDecimal}
        onEquals={onEquals}
        onClear={onClear}
        onBackspace={onBackspace}
        onOperator={onOperator}
      />
      <div className="footer-hint" aria-hidden="true">
        {footerHint}
      </div>
    </div>
  );
}
