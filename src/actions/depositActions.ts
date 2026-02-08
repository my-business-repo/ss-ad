'use server';

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Fetch all deposit transactions
 */
export async function getDeposits() {
    const deposits = await db.transaction.findMany({
        where: {
            type: 'DEPOSIT'
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

    console.log(deposits);

    return deposits;
}

/**
 * Fetch a single deposit transaction by ID
 */
export async function getDepositById(id: number) {
    const deposit = await db.transaction.findFirst({
        where: {
            id,
            type: 'DEPOSIT'
        },
        include: {
            account: {
                include: {
                    customer: true
                }
            }
        }
    });

    console.log(deposit);

    return deposit;
}

/**
 * Approve a deposit transaction
 */
export async function approveDeposit(transactionId: number, adminId: number) {
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

            // Update account balance
            await tx.account.update({
                where: { id: transaction.accountId },
                data: {
                    balance: {
                        increment: transaction.amount
                    }
                }
            });
        });

        // Revalidate the deposit pages
        revalidatePath('/trading/deposit');
        revalidatePath(`/trading/deposit/${transactionId}`);

        return { success: true };
    } catch (error) {
        console.error('Error approving deposit:', error);
        return { success: false, error: 'Failed to approve deposit' };
    }
}

/**
 * Reject a deposit transaction
 */
export async function rejectDeposit(transactionId: number, adminId: number, reason?: string) {
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

        // Revalidate the deposit pages
        revalidatePath('/trading/deposit');
        revalidatePath(`/trading/deposit/${transactionId}`);

        return { success: true };
    } catch (error) {
        console.error('Error rejecting deposit:', error);
        return { success: false, error: 'Failed to reject deposit' };
    }
}
