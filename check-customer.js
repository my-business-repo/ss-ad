const { PrismaClient } = require('./src/generated/prisma');
const prisma = new PrismaClient();

async function checkCustomer() {
    const customer = await prisma.customer.findUnique({
        where: { email: 'sainyi@gmail.com' },
    });
    console.log(JSON.stringify(customer, null, 2));
}

checkCustomer()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
