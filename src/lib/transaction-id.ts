/**
 * Generate a formatted transaction_id from an auto-increment ID
 * Format: 1 -> "TXN000000001", 2 -> "TXN000000002", etc.
 * @param id - The auto-increment ID from the database
 * @returns Formatted transaction_id string (12 characters)
 */
export function generateTransactionId(id: number): string {
    return 'TXN' + id.toString().padStart(9, '0');
}

/**
 * Parse a transaction_id back to the original ID
 * Format: "TXN000000001" -> 1, "TXN000000002" -> 2, etc.
 * @param transactionId - The formatted transaction_id string
 * @returns Original ID number
 */
export function parseTransactionId(transactionId: string): number {
    return parseInt(transactionId.substring(3));
}
