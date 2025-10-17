/**
// ============================================================================
// REQUIREMENT TRACEABILITY
// ============================================================================
// Requirement ID: REQ-GXP-AUDIT-001
// User Story: As a compliance officer, I need an audit trail of user actions.
// Acceptance Criteria: In-memory audit log with ISO timestamps, action types,
//                     before/after state capture where applicable.
// GxP Impact: YES - Audit trail is fundamental to ALCOA+ principles.
// Risk Level: MEDIUM
// Validation Protocol: VP-AUD-001
// ============================================================================
//
// IMPORTS AND DEPENDENCIES
// None
// ============================================================================
 */

/**
// PUBLIC_INTERFACE
 * logAudit
 * Records an audit entry in memory. In a production scenario this should
 * be persisted securely with user identity and e-signature binding where required.
 *
 * GxP Critical: Yes
 * Parameters:
 *  - entry: {
 *      action: string,              // e.g., INPUT_DIGIT, OPERATION, EVALUATE, CLEAR
 *      userId?: string,             // from auth context; defaults to 'anonymous'
 *      before?: object,             // state before action (sanitized)
 *      after?: object,              // state after action (sanitized)
 *      reason?: string              // optional reason for change
 *    }
 * Returns: void
 * Throws: none
 * Audit: Stores ISO timestamp and the provided fields.
 */
export function logAudit(entry) {
  const nowIso = new Date().toISOString();
  const normalized = {
    timestamp: nowIso,
    userId: entry?.userId || "anonymous",
    action: String(entry?.action || "UNKNOWN"),
    before: entry?.before ?? null,
    after: entry?.after ?? null,
    reason: entry?.reason ?? null,
  };
  _auditStore.push(normalized);
}

/**
// PUBLIC_INTERFACE
 * getAuditTrail
 * Returns a shallow copy of the current audit entries.
 *
 * GxP Critical: Yes
 * Parameters: none
 * Returns: Array<object>
 * Throws: none
 * Audit: Read operation logged as READ action.
 */
export function getAuditTrail() {
  const snapshot = [..._auditStore];
  _auditStore.push({
    timestamp: new Date().toISOString(),
    userId: "system",
    action: "READ_AUDIT",
    before: null,
    after: { count: snapshot.length },
    reason: "UI_READ",
  });
  return snapshot;
}

/**
// PUBLIC_INTERFACE
 * clearAuditTrail
 * Clears the in-memory audit log. For testing and controlled reset only.
 *
 * GxP Critical: No (testing utility)
 * Parameters: none
 * Returns: void
 * Throws: none
 * Audit: WRITE action indicating clearing of log.
 */
export function clearAuditTrail() {
  _auditStore.length = 0;
  _auditStore.push({
    timestamp: new Date().toISOString(),
    userId: "system",
    action: "CLEAR_AUDIT",
    before: null,
    after: null,
    reason: "TEST_RESET",
  });
}

const _auditStore = [];
