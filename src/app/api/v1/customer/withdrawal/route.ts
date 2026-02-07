import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateTransactionId } from '@/lib/transaction-id';
import { handleCors, addCorsHeaders } from '@/lib/cors';

// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

const MINIMUM_AMOUNT = 1; // $1 minimum

export async function POST(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const body = await req.json();
        const { accountId, amount } = body;

        // 1. Validation
        if (!accountId || !amount) {
            const response = NextResponse.json(
                { error: 'Account ID and amount are required' },
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

        // 4. Create withdrawal transaction (two-step process)
        const transaction = await db.transaction.create({
            data: {
                accountId,
                type: 'WITHDRAWAL',
                amount: parsedAmount,
                status: 'PENDING',
                transaction_id: 'TEMP',
            },
        });

        // 5. Update transaction_id
        const finalTransaction = await db.transaction.update({
            where: { id: transaction.id },
            data: {
                transaction_id: generateTransactionId(transaction.id),
            },
        });

        const response = NextResponse.json({
            message: 'Withdrawal request submitted successfully',
            transaction: {
                transaction_id: finalTransaction.transaction_id,
                amount: finalTransaction.amount,
                status: finalTransaction.status,
                created_at: finalTransaction.createdAt,
            },
        }, { status: 201 });
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
