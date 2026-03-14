import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { handleCors, addCorsHeaders } from '@/lib/cors';

// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

// Helper to authenticate user
async function authenticate(req: Request) {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
        return null;
    }

    return decoded.id;
}

export async function GET(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // 1. Verify customer authentication
        const customerId = await authenticate(req);
        if (!customerId) {
            const response = NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        const { searchParams } = new URL(req.url);
        const statusFilter = searchParams.get('status');
        const typeFilter = searchParams.get('type');

        // 2. Get all accounts for this authenticated customer
        const accounts = await db.account.findMany({
            where: { customerId: Number(customerId) },
            select: { id: true }
        });

        const accountIds = accounts.map(a => a.id);

        if (accountIds.length === 0) {
            const response = NextResponse.json({ transactions: [] });
            return addCorsHeaders(response, req);
        }

        // 3. Build where clause - always scoped to this customer's accounts
        const where: any = {
            accountId: { in: accountIds }
        };

        if (statusFilter) {
            where.status = statusFilter as any;
        }

        if (typeFilter) {
            where.type = typeFilter as any;
        }

        // 4. Fetch transactions
        const transactions = await db.transaction.findMany({
            where,
            include: {
                account: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // 5. Format response
        const formattedTransactions = transactions.map((txn: any) => ({
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
