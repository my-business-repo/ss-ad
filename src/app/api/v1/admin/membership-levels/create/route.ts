import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { uploadToR2 } from '@/lib/storage';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        // Extract basic fields
        const name = formData.get('name') as string;
        const level_id = parseInt(formData.get('level_id') as string);
        const upgradePrice = parseFloat(formData.get('upgradePrice') as string) || 0;

        // Extract icon
        const iconFile = formData.get('icon') as File | null;
        let iconUrl = null;

        if (iconFile) {
            // Upload to R2
            // Path: levels/{level_id}-{timestamp}.webp
            const buffer = Buffer.from(await iconFile.arrayBuffer());
            const filename = `levels/${level_id}-${Date.now()}`;

            // We use the existing uploadToR2 function which handles compression and conversion
            // It expects a File object usually, but let's check its signature.
            // Re-reading storage.ts signature from memory or usage:
            // It takes (file: File, folder: string).

            iconUrl = await uploadToR2(iconFile, 'levels');
        }

        // Extract Order Info
        const commissionRate = parseFloat(formData.get('commissionRate') as string) || 0;
        const minBalanceRatio = parseFloat(formData.get('minBalanceRatio') as string) || 0;
        const maxBalanceRatio = parseFloat(formData.get('maxBalanceRatio') as string) || 0;
        const minProductCount = parseInt(formData.get('minProductCount') as string) || 1;
        const maxProductCount = parseInt(formData.get('maxProductCount') as string) || 1;

        // Extract Constraints
        const dailyOrderLimit = parseInt(formData.get('dailyOrderLimit') as string) || 0;
        const minBalanceToAcceptOrder = parseFloat(formData.get('minBalanceToAcceptOrder') as string) || 0;

        // Extract Withdrawal Info
        const minWithdrawalAmount = parseFloat(formData.get('minWithdrawalAmount') as string) || 0;
        const maxWithdrawalAmount = parseFloat(formData.get('maxWithdrawalAmount') as string) || 0;
        const dailyWithdrawalCount = parseInt(formData.get('dailyWithdrawalCount') as string) || 0;

        // Extract Fees
        const trcWithdrawalFee = parseFloat(formData.get('trcWithdrawalFee') as string) || 0;
        const trcWithdrawalRate = parseFloat(formData.get('trcWithdrawalRate') as string) || 0;
        const ercWithdrawalFee = parseFloat(formData.get('ercWithdrawalFee') as string) || 0;
        const ercWithdrawalRate = parseFloat(formData.get('ercWithdrawalRate') as string) || 0;
        const bankWithdrawalFee = parseFloat(formData.get('bankWithdrawalFee') as string) || 0;
        const bankWithdrawalRate = parseFloat(formData.get('bankWithdrawalRate') as string) || 0;

        // Extract Auto Upgrade & Referral
        const autoUpgradeInviteCount = parseInt(formData.get('autoUpgradeInviteCount') as string) || 0;
        const referralCommissionRateL1 = parseFloat(formData.get('referralCommissionRateL1') as string) || 0;
        const referralCommissionRateL2 = parseFloat(formData.get('referralCommissionRateL2') as string) || 0;
        const referralCommissionRateL3 = parseFloat(formData.get('referralCommissionRateL3') as string) || 0;

        // Create Level
        const level = await db.customerLevel.create({
            data: {
                level_id,
                name,
                icon: iconUrl,
                upgradePrice,
                commissionRate,
                minBalanceRatio,
                maxBalanceRatio,
                minProductCount,
                maxProductCount,
                dailyOrderLimit,
                minBalanceToAcceptOrder,
                minWithdrawalAmount,
                maxWithdrawalAmount,
                dailyWithdrawalCount,
                trcWithdrawalFee,
                trcWithdrawalRate,
                ercWithdrawalFee,
                ercWithdrawalRate,
                bankWithdrawalFee,
                bankWithdrawalRate,
                autoUpgradeInviteCount,
                referralCommissionRateL1,
                referralCommissionRateL2,
                referralCommissionRateL3,
            }
        });

        return NextResponse.json({
            message: 'Membership level created successfully',
            level
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating membership level:', error);
        // Handle unique constraint violation for level_id
        if ((error as any).code === 'P2002') {
            return NextResponse.json(
                { error: 'Level ID already exists' },
                { status: 409 }
            );
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
