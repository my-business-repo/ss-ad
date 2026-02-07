const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function checkAccounts() {
    try {
        const customers = await prisma.customer.findMany({
            include: {
                accounts: true,
            },
            orderBy: {
                id: 'desc',
            },
            take: 5,
        });

        console.log('=== Recent Customers with Accounts ===\n');

        if (customers.length === 0) {
            console.log('No customers found in database.');
        } else {
            customers.forEach((customer) => {
                console.log(`Customer: ${customer.name} (${customer.email})`);
                console.log(`  User ID: ${customer.user_id}`);
                console.log(`  Refer Code: ${customer.referCode}`);
                console.log(`  Accounts:`);

                if (customer.accounts.length === 0) {
                    console.log('    ❌ No accounts found for this customer');
                } else {
                    customer.accounts.forEach((account) => {
                        console.log(`    ✅ Account ID: ${account.account_id}`);
                        console.log(`       Balance: $${account.balance}`);
                        console.log(`       Profit: $${account.profit}`);
                        console.log(`       Currency: ${account.currency}`);
                        console.log(`       Status: ${account.status}`);
                    });
                }
                console.log('');
            });
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAccounts();
