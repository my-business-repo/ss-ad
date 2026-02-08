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
