const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function deleteAllCustomers() {
    try {
        const result = await prisma.customer.deleteMany();
        console.log(`✅ Successfully deleted ${result.count} customer records`);
    } catch (error) {
        console.error('❌ Error deleting customers:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteAllCustomers();
