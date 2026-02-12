import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateRandomTransactionId } from '@/lib/transaction-id';
import { handleCors, addCorsHeaders } from '@/lib/cors';

// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

const MINIMUM_AMOUNT = 1; // $1 minimum

// Helper to authenticate user
import { verifyToken } from '@/lib/jwt';

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
        const customerId = await authenticate(req);
        if (!customerId) {
            const response = NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
            return addCorsHeaders(response, req);
        }

        // Get all accounts for the customer
        const accounts = await db.account.findMany({
            where: { customerId: Number(customerId) },
            select: { id: true }
        });

        const accountIds = accounts.map(a => a.id);

        if (accountIds.length === 0) {
            const response = NextResponse.json({
                success: true,
                data: []
            }, { status: 200 });
            return addCorsHeaders(response, req);
        }

        // Get all withdrawal transactions for these accounts
        const withdrawals = await db.transaction.findMany({
            where: {
                accountId: { in: accountIds },
                type: 'WITHDRAWAL'
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                transaction_id: true,
                amount: true,
                status: true,
                address: true,
                createdAt: true,
                processedAt: true,
                adminNote: true,
                account: {
                    select: {
                        currency: true
                    }
                }
            }
        });

        const response = NextResponse.json({
            success: true,
            data: withdrawals
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Get withdrawals error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}

export async function POST(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const body = await req.json();
        const { accountId, amount, address } = body;

        // 1. Validation
        if (!accountId || !amount) {
            const response = NextResponse.json(
                { error: 'Account ID and amount are required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        if (!address || address.trim() === '') {
            const response = NextResponse.json(
                { error: 'Withdrawal address is required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount < MINIMUM_AMOUNT) {
            const response = NextResponse.json(
                { error: `Minimum withdrawal amount is $${MINIMUM_AMOUNT}` },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // 2. Verify account exists and check balance
        const account = await db.account.findUnique({
            where: { id: accountId },
            include: { customer: true },
        });

        if (!account) {
            const response = NextResponse.json(
                { error: 'Account not found' },
                { status: 404 }
            );
            return addCorsHeaders(response, req);
        }

        // TODO: Verify customer authentication (customer.id matches authenticated user)
        // For now, we'll skip authentication

        // 3. Check sufficient balance
        if (account.balance < parsedAmount) {
            const response = NextResponse.json(
                { error: 'Insufficient balance' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // 4. Generate unique transaction ID and create withdrawal transaction
        const transactionId = generateRandomTransactionId();

        const transaction = await db.transaction.create({
            data: {
                accountId,
                type: 'WITHDRAWAL',
                amount: parsedAmount,
                status: 'PENDING',
                address: address.trim(),
                transaction_id: transactionId,
            },
        });

        const response = NextResponse.json({
            message: 'Withdrawal request submitted successfully',
            transaction: {
                transaction_id: transaction.transaction_id,
                amount: transaction.amount,
                address: transaction.address,
                status: transaction.status,
                created_at: transaction.createdAt,
            },
        }, { status: 201 });

        // Trigger Notification
        try {
            await db.notification.create({
                data: {
                    type: 'WITHDRAWAL',
                    message: `New withdrawal request: $${transaction.amount} from Account ${accountId}`,
                    customerId: account.customer.id,
                },
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Withdrawal request error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
