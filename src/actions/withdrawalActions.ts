'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Fetch all withdrawal transactions
 */
export async function getWithdrawals() {
    const withdrawals = await db.transaction.findMany({
        where: {
            type: 'WITHDRAWAL'
        },
        include: {
            account: {
                include: {
                    customer: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return withdrawals;
}

/**
 * Fetch a single withdrawal transaction by ID
 */
export async function getWithdrawalById(id: number) {
    const withdrawal = await db.transaction.findFirst({
        where: {
            id,
            type: 'WITHDRAWAL'
        },
        include: {
            account: {
                include: {
                    customer: true
                }
            }
        }
    });

    return withdrawal;
}

/**
 * Approve a withdrawal transaction
 */
export async function approveWithdrawal(transactionId: number, adminId: number) {
    try {
        // Get the transaction
        const transaction = await db.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            return { success: false, error: 'Transaction not found' };
        }

        if (transaction.status !== 'PENDING') {
            return { success: false, error: 'Transaction is not pending' };
        }

        // Update transaction and account balance in a transaction
        await db.$transaction(async (tx) => {
            // Update transaction status
            await tx.transaction.update({
                where: { id: transactionId },
                data: {
                    status: 'APPROVED',
                    processedBy: adminId,
                    processedAt: new Date()
                }
            });

            // Deduct from account balance
            await tx.account.update({
                where: { id: transaction.accountId },
                data: {
                    balance: {
                        decrement: transaction.amount
                    }
                }
            });
        });

        // Revalidate the withdrawal pages
        revalidatePath('/trading/withdrawal');
        revalidatePath(`/trading/withdrawal/${transactionId}`);

        return { success: true };
    } catch (error) {
        console.error('Error approving withdrawal:', error);
        return { success: false, error: 'Failed to approve withdrawal' };
    }
}

/**
 * Reject a withdrawal transaction
 */
export async function rejectWithdrawal(transactionId: number, adminId: number, reason?: string) {
    try {
        // Get the transaction
        const transaction = await db.transaction.findUnique({
            where: { id: transactionId }
        });

        if (!transaction) {
            return { success: false, error: 'Transaction not found' };
        }

        if (transaction.status !== 'PENDING') {
            return { success: false, error: 'Transaction is not pending' };
        }

        // Update transaction status
        await db.transaction.update({
            where: { id: transactionId },
            data: {
                status: 'REJECTED',
                processedBy: adminId,
                processedAt: new Date(),
                adminNote: reason || 'Rejected by admin'
            }
        });

        // Revalidate the withdrawal pages
        revalidatePath('/trading/withdrawal');
        revalidatePath(`/trading/withdrawal/${transactionId}`);

        return { success: true };
    } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        return { success: false, error: 'Failed to reject withdrawal' };
    }
}
