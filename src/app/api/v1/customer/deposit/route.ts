import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { uploadFile } from '@/lib/storage';
import { generateRandomTransactionId } from '@/lib/transaction-id';
import { handleCors, addCorsHeaders } from '@/lib/cors';


// Handle OPTIONS preflight request
export async function OPTIONS(req: Request) {
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;
    return new NextResponse(null, { status: 200 });
}

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

        // Get all deposit transactions for these accounts
        const deposits = await db.transaction.findMany({
            where: {
                accountId: { in: accountIds },
                type: 'DEPOSIT'
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                transaction_id: true,
                amount: true,
                status: true,
                proofImageUrl: true,
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
            data: deposits
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Get deposits error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}

const MINIMUM_AMOUNT = 1; // $1 minimum

export async function POST(req: Request) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        const formData = await req.formData();
        const accountIdStr = formData.get('accountId') as string;
        const amountStr = formData.get('amount') as string;
        const proofImage = formData.get('proofImage') as File | null;

        const accountId = parseInt(accountIdStr);
        const amount = parseFloat(amountStr);

        // 1. Validation
        if (!accountIdStr || isNaN(accountId)) {
            const response = NextResponse.json(
                { error: 'Valid Account ID is required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        if (!amountStr || isNaN(amount)) {
            const response = NextResponse.json(
                { error: 'Valid amount is required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        if (amount < MINIMUM_AMOUNT) {
            const response = NextResponse.json(
                { error: `Minimum deposit amount is $${MINIMUM_AMOUNT}` },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        if (!proofImage || proofImage.size === 0) {
            const response = NextResponse.json(
                { error: 'Proof of payment image is required' },
                { status: 400 }
            );
            return addCorsHeaders(response, req);
        }

        // 2. Verify account exists
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

        // 3. Upload proof image to Cloudflare R2
        let proofImageUrl: string;
        try {
            proofImageUrl = await uploadFile(proofImage, 'transactions');

        } catch (error) {
            console.error('Failed to upload proof image:', error);
            const response = NextResponse.json(
                { error: 'Failed to upload proof image. Please try again.' },
                { status: 500 }
            );
            return addCorsHeaders(response, req);
        }

        // 4. Generate unique transaction ID and create transaction
        const transactionId = generateRandomTransactionId();

        const transaction = await db.transaction.create({
            data: {
                accountId,
                type: 'DEPOSIT',
                amount,
                status: 'PENDING',
                proofImageUrl,
                transaction_id: transactionId,
            },
        });

        const response = NextResponse.json({
            message: 'Deposit request submitted successfully',
            transaction: {
                transaction_id: transaction.transaction_id,
                amount: transaction.amount,
                status: transaction.status,
                proof_image_url: transaction.proofImageUrl,
                created_at: transaction.createdAt,
            },
        }, { status: 201 });

        // Trigger Notification
        try {
            await db.notification.create({
                data: {
                    type: 'DEPOSIT',
                    message: `New deposit request: $${transaction.amount} from Account ${accountId}`,
                    customerId: account.customer.id,
                },
            });
        } catch (error) {
            console.error('Failed to create notification:', error);
        }

        return addCorsHeaders(response, req);


    } catch (error) {
        console.error('Deposit request error:', error);
        const response = NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
