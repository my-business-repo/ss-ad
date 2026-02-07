import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const transactionId = parseInt(id);

        if (isNaN(transactionId)) {
            return NextResponse.json(
                { error: 'Invalid transaction ID' },
                { status: 400 }
            );
        }

        // TODO: Verify admin authentication and get admin ID
        // For now, we'll use a placeholder
        const adminId = 1; // Replace with actual authenticated admin ID

        // Find transaction with account details
        const transaction = await db.transaction.findUnique({
            where: { id: transactionId },
            include: {
                account: true,
            },
        });

        if (!transaction) {
            return NextResponse.json(
                { error: 'Transaction not found' },
                { status: 404 }
            );
        }

        // Verify transaction is pending
        if (transaction.status !== 'PENDING') {
            return NextResponse.json(
                { error: `Transaction is already ${transaction.status.toLowerCase()}` },
                { status: 400 }
            );
        }

        // Calculate new balance based on transaction type
        const balanceChange = transaction.type === 'DEPOSIT'
            ? transaction.amount
            : -transaction.amount;

        // For withdrawal, verify sufficient balance
        if (transaction.type === 'WITHDRAWAL' && transaction.account.balance < transaction.amount) {
            return NextResponse.json(
                { error: 'Insufficient balance for withdrawal' },
                { status: 400 }
            );
        }

        // Use transaction to ensure atomicity
        const result = await db.$transaction([
            // Update transaction status
            db.transaction.update({
                where: { id: transactionId },
                data: {
                    status: 'APPROVED',
                    processedBy: adminId,
                    processedAt: new Date(),
                },
            }),
            // Update account balance
            db.account.update({
                where: { id: transaction.accountId },
                data: {
                    balance: {
                        increment: balanceChange,
                    },
                },
            }),
        ]);

        const [updatedTransaction, updatedAccount] = result;

        return NextResponse.json({
            message: 'Transaction approved successfully',
            transaction: {
                transaction_id: updatedTransaction.transaction_id,
                type: updatedTransaction.type,
                amount: updatedTransaction.amount,
                status: updatedTransaction.status,
                processed_at: updatedTransaction.processedAt,
            },
            account: {
                account_id: updatedAccount.account_id,
                new_balance: updatedAccount.balance,
            },
        });

    } catch (error) {
        console.error('Error approving transaction:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
