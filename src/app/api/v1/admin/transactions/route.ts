import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status') || 'PENDING';
        const typeFilter = searchParams.get('type');

        // Build where clause
        const where: any = {
            status: statusFilter as any,
        };

        if (typeFilter) {
            where.type = typeFilter as any;
        }

        // Fetch transactions with account and customer details
        const transactions = await db.transaction.findMany({
            where,
            include: {
                account: {
                    include: {
                        customer: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Format response
        const formattedTransactions = transactions.map((txn: any) => ({
            id: txn.id,
            transaction_id: txn.transaction_id,
            customer_name: txn.account.customer.name,
            customer_email: txn.account.customer.email,
            account_id: txn.account.account_id,
            type: txn.type,
            amount: txn.amount,
            status: txn.status,
            proof_image_url: txn.proofImageUrl,
            admin_note: txn.adminNote,
            processed_by: txn.processedBy,
            processed_at: txn.processedAt,
            created_at: txn.createdAt,
        }));

        return NextResponse.json({
            transactions: formattedTransactions,
        });

    } catch (error) {
        console.error('Error fetching transactions:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
