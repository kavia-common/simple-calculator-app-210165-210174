/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-FE-KEY-001
// User Story: As a user, I need accessible keys with focus and ARIA labels.
// Acceptance Criteria: Button role, aria-labels, keyboard focus styles.
// GxP Impact: YES - Accessibility and input reliability support data integrity.
// Risk Level: LOW
// Validation Protocol: VP-FE-ACC-001
// ============================================================================
*/

import React from "react";

/**
// PUBLIC_INTERFACE
 * Key
 * Purpose: Render a calculator key button.
 * GxP Critical: No
 * Parameters:
 *  - label: string (visible)
 *  - ariaLabel?: string (for screen readers)
 *  - onPress: function (invoked on click)
 *  - variant?: 'default'|'primary'|'secondary'|'danger'
 *  - dataTestId?: string
 * Returns: JSX.Element
 * Throws: none
 * Audit: Action is logged at higher level (Calculator) not here.
 */
export default function Key({
  label,
  ariaLabel,
  onPress,
  variant = "default",
  dataTestId,
}) {
  return (
    <button
      type="button"
      className="key"
      data-variant={variant}
      aria-label={ariaLabel || label}
      onClick={onPress}
      data-testid={dataTestId}
    >
      {label}
    </button>
  );
}
