const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function testCustomerListData() {
    try {
        // Simulate the fetch function
        const customers = await prisma.customer.findMany({
            include: {
                accounts: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        console.log('=== Customer List with Balance and Profit ===\n');

        customers.forEach((customer) => {
            // Calculate total balance and profit from all accounts
            const totalBalance = customer.accounts.reduce((sum, account) => sum + account.balance, 0);
            const totalProfit = customer.accounts.reduce((sum, account) => sum + account.profit, 0);

            console.log(`Customer: ${customer.name}`);
            console.log(`  User ID: ${customer.user_id}`);
            console.log(`  Email: ${customer.email}`);
            console.log(`  Phone: ${customer.phoneNumber || 'N/A'}`);
            console.log(`  Balance: $${totalBalance.toFixed(2)}`);
            console.log(`  Profit: $${totalProfit.toFixed(2)}`);
            console.log(`  Status: ${customer.status}`);
            console.log(`  Accounts Count: ${customer.accounts.length}`);
            console.log('');
        });
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testCustomerListData();
