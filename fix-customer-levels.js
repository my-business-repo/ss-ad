const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function fixCustomerLevels() {
    const defaultLevel = await prisma.customerLevel.findUnique({
        where: { level_id: 1 },
    });

    if (!defaultLevel) {
        console.error('Default level (VIP1) not found. Please run seed-levels.js first.');
        return;
    }

    const customers = await prisma.customer.updateMany({
        where: { levelId: null },
        data: { levelId: defaultLevel.id },
    });

    console.log(`Updated ${customers.count} customers to VIP1 level.`);
}

fixCustomerLevels()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
