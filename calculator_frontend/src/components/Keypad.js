/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-FE-KEYPAD-001
// User Story: As a user, I want a numeric keypad with operations and controls.
// Acceptance Criteria: Digits, decimal, equals, clear, backspace, operators.
// GxP Impact: YES - Input accuracy and clarity.
// Risk Level: LOW
// Validation Protocol: VP-FE-KEYPAD-001
// ============================================================================
*/

import React from "react";
import Key from "./Key";

/**
// PUBLIC_INTERFACE
 * Keypad
 * Purpose: Render keypad layout; callback props handle actions.
 * GxP Critical: Yes
 * Parameters: callbacks for digits, decimal, equals, clear, backspace, operators
 * Returns: JSX.Element
 */
export default function Keypad({
  onDigit,
  onDecimal,
  onEquals,
  onClear,
  onBackspace,
  onOperator,
}) {
  const digitKeys = [
    ["7", "8", "9"],
    ["4", "5", "6"],
    ["1", "2", "3"],
  ];

  return (
    <div className="calc-body">
      <div className="keypad-grid" aria-label="numeric keypad">
        {digitKeys.flat().map((d) => (
          <Key
            key={d}
            label={d}
            ariaLabel={`digit ${d}`}
            onPress={() => onDigit(d)}
            dataTestId={`key-${d}`}
          />
        ))}
        <Key
          label="0"
          ariaLabel="digit 0"
          onPress={() => onDigit("0")}
          dataTestId="key-0"
        />
        <Key label="." ariaLabel="decimal" onPress={onDecimal} dataTestId="key-decimal" />
        <Key
          label="="
          ariaLabel="equals"
          onPress={onEquals}
          variant="primary"
          dataTestId="key-equals"
        />
      </div>
      <div className="ops-grid" aria-label="operators and controls">
        <Key
          label="C"
          ariaLabel="clear"
          onPress={onClear}
          variant="danger"
          dataTestId="key-clear"
        />
        <Key
          label="⌫"
          ariaLabel="backspace"
          onPress={onBackspace}
          variant="secondary"
          dataTestId="key-backspace"
        />
        <Key
          label="+"
          ariaLabel="add"
          onPress={() => onOperator("+")}
          variant="secondary"
          dataTestId="key-plus"
        />
        <Key
          label="−"
          ariaLabel="subtract"
          onPress={() => onOperator("-")}
          variant="secondary"
          dataTestId="key-minus"
        />
        <Key
          label="×"
          ariaLabel="multiply"
          onPress={() => onOperator("*")}
          variant="secondary"
          dataTestId="key-multiply"
        />
        <Key
          label="÷"
          ariaLabel="divide"
          onPress={() => onOperator("/")}
          variant="secondary"
          dataTestId="key-divide"
        />
      </div>
    </div>
  );
}
