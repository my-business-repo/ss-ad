/**
 * Generate a formatted user_id from an auto-increment ID
 * Format: 1 -> "1000001", 2 -> "1000002", etc.
 * @param id - The auto-increment ID from the database
 * @returns Formatted user_id string
 */
export function generateUserId(id: number): string {
    return (1000000 + id).toString();
}

/**
 * Parse a user_id back to the original ID
 * Format: "1000001" -> 1, "1000002" -> 2, etc.
 * @param userId - The formatted user_id string
 * @returns Original ID number
 */
export function parseUserId(userId: string): number {
    return parseInt(userId) - 1000000;
}
