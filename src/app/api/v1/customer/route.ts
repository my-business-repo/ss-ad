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
        // Fetch all customers with their related data
        const customers = await db.customer.findMany({
            include: {
                accounts: {
                    include: {
                        transactions: {
                            orderBy: {
                                createdAt: 'desc'
                            },
                            take: 10 // Limit to last 10 transactions per account
                        }
                    }
                },
                level: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform the data to exclude sensitive information
        const transformedCustomers = customers.map(customer => ({
            id: customer.id,
            user_id: customer.user_id,
            name: customer.name,
            email: customer.email,
            phoneNumber: customer.phoneNumber,
            referCode: customer.referCode,
            status: customer.status,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            level: customer.level ? {
                id: customer.level.id,
                level_id: customer.level.level_id,
                name: customer.level.name,
                icon: customer.level.icon,
                upgradePrice: customer.level.upgradePrice,
                commissionRate: customer.level.commissionRate,
                dailyOrderLimit: customer.level.dailyOrderLimit,
                minWithdrawalAmount: customer.level.minWithdrawalAmount,
                maxWithdrawalAmount: customer.level.maxWithdrawalAmount,
                dailyWithdrawalCount: customer.level.dailyWithdrawalCount
            } : null,
            accounts: customer.accounts.map(account => ({
                id: account.id,
                account_id: account.account_id,
                balance: account.balance,
                profit: account.profit,
                currency: account.currency,
                status: account.status,
                createdAt: account.createdAt,
                updatedAt: account.updatedAt,
                recentTransactions: account.transactions.map(transaction => ({
                    id: transaction.id,
                    transaction_id: transaction.transaction_id,
                    type: transaction.type,
                    amount: transaction.amount,
                    status: transaction.status,
                    createdAt: transaction.createdAt,
                    processedAt: transaction.processedAt
                }))
            }))
        }));

        const response = NextResponse.json({
            success: true,
            count: transformedCustomers.length,
            customers: transformedCustomers
        }, { status: 200 });

        return addCorsHeaders(response, req);

    } catch (error) {
        console.error('Get customers error:', error);
        const response = NextResponse.json(
            {
                success: false,
                error: 'Internal server error'
            },
            { status: 500 }
        );
        return addCorsHeaders(response, req);
    }
}
