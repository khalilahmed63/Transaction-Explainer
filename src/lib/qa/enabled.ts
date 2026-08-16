/**
 * Internal QA is opt-in via server env.
 * Prefer enabling on Vercel Preview; keep disabled in Production.
 */
export function isInternalQaEnabled(): boolean {
  const value = process.env.ENABLE_INTERNAL_QA?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}
