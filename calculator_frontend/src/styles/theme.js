/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-FE-001
// User Story: As a user, I want a modern, themed calculator UI to perform basic operations.
// Acceptance Criteria: Ocean Professional color scheme applied; accessible focus states; responsive.
// GxP Impact: YES - UI must be consistent and readable for accurate data entry.
// Risk Level: LOW
// Validation Protocol: VP-FE-STYLE-001
// ============================================================================
//
// IMPORTS AND DEPENDENCIES
// None (pure constants)
// ============================================================================
*/

/**
 * Ocean Professional theme constants.
 * Note: In a TS project these would be typed; for JS we export as plain object.
 */
export const theme = {
  name: "Ocean Professional",
  colors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    success: "#06b6d4",
    error: "#EF4444",
    background: "#f9fafb",
    surface: "#ffffff",
    text: "#111827",
  },
  shadows: {
    sm: "0 1px 2px rgba(0,0,0,0.06)",
    md: "0 4px 8px rgba(0,0,0,0.08)",
    lg: "0 10px 15px rgba(0,0,0,0.1)",
  },
  radii: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    pill: "9999px",
  },
  transition: "all 0.2s ease",
};
