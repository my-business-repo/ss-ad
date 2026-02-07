const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixCustomerName() {
    const customer = await prisma.customer.update({
        where: { email: 'sainyi@gmail.com' },
        data: { name: 'sainyi' },
    });
    console.log('Updated customer name:', customer);
}

fixCustomerName()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
