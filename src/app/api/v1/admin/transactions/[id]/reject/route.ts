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

        const body = await req.json();
        const { reason } = body;

        if (!reason || reason.trim() === '') {
            return NextResponse.json(
                { error: 'Rejection reason is required' },
                { status: 400 }
            );
        }

        // TODO: Verify admin authentication and get admin ID
        // For now, we'll use a placeholder
        const adminId = 1; // Replace with actual authenticated admin ID

        // Find transaction
        const transaction = await db.transaction.findUnique({
            where: { id: transactionId },
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

        // Update transaction to rejected (no balance change)
        const updatedTransaction = await db.transaction.update({
            where: { id: transactionId },
            data: {
                status: 'REJECTED',
                adminNote: reason,
                processedBy: adminId,
                processedAt: new Date(),
            },
        });

        return NextResponse.json({
            message: 'Transaction rejected successfully',
            transaction: {
                transaction_id: updatedTransaction.transaction_id,
                type: updatedTransaction.type,
                amount: updatedTransaction.amount,
                status: updatedTransaction.status,
                admin_note: updatedTransaction.adminNote,
                processed_at: updatedTransaction.processedAt,
            },
        });

    } catch (error) {
        console.error('Error rejecting transaction:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
