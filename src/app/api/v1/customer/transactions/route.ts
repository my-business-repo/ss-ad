import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { handleCors, addCorsHeaders } from '@/lib/cors';

// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

export async function GET(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const { searchParams } = new URL(req.url);
        const accountId = searchParams.get('accountId');
        const statusFilter = searchParams.get('status');
        const typeFilter = searchParams.get('type');

        // TODO: Verify customer authentication and filter by customer's accounts only
        // For now, allowing all if no accountId specified

        // Build where clause
        const where: any = {};

        if (accountId) {
            where.accountId = parseInt(accountId);
        }

        if (statusFilter) {
            where.status = statusFilter as any;
        }

        if (typeFilter) {
            where.type = typeFilter as any;
        }

        // Fetch transactions
        const transactions = await db.transaction.findMany({
            where,
            include: {
                account: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Format response
        const formattedTransactions = transactions.map((txn) => ({
            transaction_id: txn.transaction_id,
            account_id: txn.account.account_id,
            type: txn.type,
            amount: txn.amount,
            status: txn.status,
            proof_image_url: txn.proofImageUrl,
            admin_note: txn.adminNote,
            created_at: txn.createdAt,
            processed_at: txn.processedAt,
        }));

        const response = NextResponse.json({
            transactions: formattedTransactions,
        });
        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Error fetching transactions:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
