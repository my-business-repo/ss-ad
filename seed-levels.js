const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function seed() {
    // Delete existing levels
    // await prisma.customerLevel.deleteMany(); // Maybe not delete existing if I want to update? 
    // Let's upsert.

    const levels = [
        {
            level_id: 1,
            name: "VIP1",
            icon: "/images/vip-badges/vip-silver.png", // Corrected path
            upgradePrice: 0.00,

            commissionRate: 0.005, // 0.5%
            minBalanceRatio: 0.60, // 60%
            maxBalanceRatio: 1.00, // 100%
            minProductCount: 1,
            maxProductCount: 1,
            dailyOrderLimit: 0, // Assuming 0 as per image, meaning special logic or unlimited? If user wants 0 literally, then 0.
            minBalanceToAcceptOrder: 10.00,

            minWithdrawalAmount: 10.00,
            maxWithdrawalAmount: 30000.00,
            dailyWithdrawalCount: 1,

            trcWithdrawalFee: 0,
            trcWithdrawalRate: 0,
            ercWithdrawalFee: 0,
            ercWithdrawalRate: 0,
            bankWithdrawalFee: 0,
            bankWithdrawalRate: 0,

            autoUpgradeInviteCount: 1,
            referralCommissionRateL1: 0.10, // 10%
            referralCommissionRateL2: 0.03, // 3%
            referralCommissionRateL3: 0.08, // 8% per image (Wait, usually L3 is lowest. Image says 8%? Or creates question. Let's follow image: 8%)
        },
        {
            level_id: 2,
            name: "VIP2",
            icon: "/images/vip-badges/vip-cyan.png", // Corrected path
            upgradePrice: 1000.00,

            commissionRate: 0.012, // 1.2%
            minBalanceRatio: 0.40, // 40%
            maxBalanceRatio: 0.90, // 90%
            minProductCount: 1,
            maxProductCount: 1,
            dailyOrderLimit: 40,
            minBalanceToAcceptOrder: 0.00,

            minWithdrawalAmount: 10.00,
            maxWithdrawalAmount: 500000.00,
            dailyWithdrawalCount: 0, // Using 0 as per image. Could mean unlimited.

            trcWithdrawalFee: 1.00,
            trcWithdrawalRate: 0,
            ercWithdrawalFee: 30.00,
            ercWithdrawalRate: 0,
            bankWithdrawalFee: 5.00,
            bankWithdrawalRate: 0,

            autoUpgradeInviteCount: 100000,
            referralCommissionRateL1: 0.15, // 15%
            referralCommissionRateL2: 0.05, // 5%
            referralCommissionRateL3: 0.001, // 0.1%
        }
    ];

    for (const level of levels) {
        await prisma.customerLevel.upsert({
            where: { level_id: level.level_id },
            update: level,
            create: level,
        });
    }

    console.log('Seeded Customer Levels');
}

seed()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
