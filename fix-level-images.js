const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function fixLevelImages() {
    // VIP1 -> Silver
    await prisma.customerLevel.update({
        where: { level_id: 1 },
        data: { icon: '/images/vip-badges/vip-silver.png' },
    });
    console.log('Updated VIP1 image');

    // VIP2 -> Cyan
    await prisma.customerLevel.update({
        where: { level_id: 2 },
        data: { icon: '/images/vip-badges/vip-cyan.png' },
    });
    console.log('Updated VIP2 image');
}

fixLevelImages()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
