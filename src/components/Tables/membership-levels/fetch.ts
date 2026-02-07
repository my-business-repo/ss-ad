"use server";

import { db } from "@/lib/db";

export type MembershipLevel = {
    id: string;
    dbId: number;
    name: string;
    image: string;
    upgradePrice: string;
    orderInfo: {
        commissionRate: string;
        ratio: string;
        quantityRange: string;
    };
    constraints: {
        ordersPerDay: number;
        minBalance: string;
    };
    withdrawal: {
        min: string;
        max: string;
        withdrawableStatus: string;
    };
    fees: {
        trc: string;
        erc: string;
        card: string;
    };
    autoUpgrade: {
        numberOfInvitees: number;
    };
    rebateInfo: {
        level1: string;
        level2: string;
        level3: string;
    };
    status: "Active" | "Inactive";
};

export async function getMembershipLevels(): Promise<MembershipLevel[]> {
    try {
        const levels = await db.customerLevel.findMany({
            orderBy: {
                level_id: 'asc',
            },
        });

        return levels.map((level: any) => ({
            id: level.level_id.toString(),
            dbId: level.id,
            name: level.name,
            image: level.icon || "/images/vip-badges/vip-silver.png", // Fallback image
            upgradePrice: level.upgradePrice.toFixed(2),
            orderInfo: {
                commissionRate: `${(level.commissionRate * 100).toFixed(1)}%`, // e.g. 0.5%
                ratio: `${(level.minBalanceRatio * 100).toFixed(0)}% - ${(level.maxBalanceRatio * 100).toFixed(0)}%`, // e.g. 60% - 100%
                quantityRange: `${level.minProductCount} - ${level.maxProductCount}`,
            },
            constraints: {
                ordersPerDay: level.dailyOrderLimit,
                minBalance: level.minBalanceToAcceptOrder.toFixed(2),
            },
            withdrawal: {
                min: level.minWithdrawalAmount.toFixed(2),
                max: level.maxWithdrawalAmount.toFixed(2),
                withdrawableStatus: `Withdrawable (Count: ${level.dailyWithdrawalCount})`,
            },
            fees: {
                trc: level.trcWithdrawalFee > 0 ? `${level.trcWithdrawalFee.toFixed(2)}` : `${(level.trcWithdrawalRate * 100).toFixed(2)}%`,
                erc: level.ercWithdrawalFee > 0 ? `${level.ercWithdrawalFee.toFixed(2)}` : `${(level.ercWithdrawalRate * 100).toFixed(2)}%`,
                card: level.bankWithdrawalFee > 0 ? `${level.bankWithdrawalFee.toFixed(2)}` : `${(level.bankWithdrawalRate * 100).toFixed(2)}%`,
            },
            autoUpgrade: {
                numberOfInvitees: level.autoUpgradeInviteCount,
            },
            rebateInfo: {
                level1: `${(level.referralCommissionRateL1 * 100).toFixed(0)}%`,
                level2: `${(level.referralCommissionRateL2 * 100).toFixed(0)}%`,
                level3: `${(level.referralCommissionRateL3 * 100).toFixed(1)}%`,
            },
            status: "Active",
        }));
    } catch (error) {
        console.error("Failed to fetch membership levels:", error);
        return [];
    }
}
