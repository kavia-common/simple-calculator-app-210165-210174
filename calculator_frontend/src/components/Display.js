/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-FE-DISPLAY-001
// User Story: As a user, I want to see current input/expression and result.
// Acceptance Criteria: Expression and value areas; handles error text gracefully.
// GxP Impact: YES - Accurate, legible representation of values.
// Risk Level: LOW
// Validation Protocol: VP-FE-DISP-001
// ============================================================================
*/

import React from "react";

/**
// PUBLIC_INTERFACE
 * Display
 * Purpose: Shows expression and current display value.
 * GxP Critical: Yes
 * Parameters:
 *  - expression: string
 *  - value: string
 *  - isError?: boolean
 * Returns: JSX.Element
 * Throws: none
 * Audit: Read-only; no audit logging here.
 */
export default function Display({ expression, value, isError = false }) {
  return (
    <div className="calc-display" role="region" aria-label="calculator display">
      <div className="expression" aria-live="polite" data-testid="display-expression">
        {expression}
      </div>
      <div
        className="value"
        aria-live="polite"
        style={{ color: isError ? "var(--color-error)" : "var(--color-text)" }}
        data-testid="display-value"
      >
        {value}
      </div>
    </div>
  );
}
