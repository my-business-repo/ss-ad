const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const customers = await prisma.customer.findMany({
        select: { user_id: true, phoneNumber: true, email: true, name: true }
    });
    console.log("CUSTOMERS:", customers);
}

main().finally(() => prisma.$disconnect());
