/**
 * Helper to get and clean the NEXTAUTH_SECRET
 * Removes quotes that may be present in environment variables
 */
export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET || "";
  return secret.replace(/^["']|["']$/g, "") || "dev-secret";
}
