/**
 * Generate a formatted account_id from an auto-increment ID
 * Format: 1 -> "A0000001", 2 -> "A0000002", etc.
 * @param id - The auto-increment ID from the database
 * @returns Formatted account_id string (8 characters)
 */
export function generateAccountId(id: number): string {
    return 'A' + id.toString().padStart(7, '0');
}

/**
 * Parse an account_id back to the original ID
 * Format: "A0000001" -> 1, "A0000002" -> 2, etc.
 * @param accountId - The formatted account_id string
 * @returns Original ID number
 */
export function parseAccountId(accountId: string): number {
    return parseInt(accountId.substring(1));
}
