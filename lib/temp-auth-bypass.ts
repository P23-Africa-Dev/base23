/**
 * TEMPORARY UI-review bypass.
 *
 * Set to `true` so app screens can be opened without signing in
 * (middleware + axios session-expired redirect are both skipped).
 *
 * Set back to `false` (or delete usages) to restore normal auth.
 */
export const TEMP_AUTH_BYPASS = true;
