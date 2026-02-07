const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDepositWorkflow() {
    console.log('=== Testing Deposit & Withdrawal Workflow ===\n');

    try {
        // Get first account
        const account = await prisma.account.findFirst({
            include: { customer: true },
        });

        if (!account) {
            console.log('❌ No account found. Please create a customer first.');
            return;
        }

        console.log(`Testing with Account: ${account.account_id}`);
        console.log(`Customer: ${account.customer.name}`);
        console.log(`Initial Balance: $${account.balance.toFixed(2)}\n`);

        // Test 1: Create a deposit transaction
        console.log('1️⃣  Creating deposit transaction...');
        const depositTransaction = await prisma.transaction.create({
            data: {
                accountId: account.id,
                type: 'DEPOSIT',
                amount: 100,
                status: 'PENDING',
                proofImageUrl: 'https://example.com/proof.jpg', // Mock URL
                transaction_id: 'TEMP',
            },
        });

        // Update transaction ID
        const { generateTransactionId } = require('./src/lib/transaction-id');
        const finalDeposit = await prisma.transaction.update({
            where: { id: depositTransaction.id },
            data: {
                transaction_id: generateTransactionId(depositTransaction.id),
            },
        });

        console.log(`   ✅ Deposit created: ${finalDeposit.transaction_id}`);
        console.log(`   Amount: $${finalDeposit.amount}`);
        console.log(`   Status: ${finalDeposit.status}\n`);

        // Test 2: Approve deposit
        console.log('2️⃣  Approving deposit transaction...');
        await prisma.$transaction([
            prisma.transaction.update({
                where: { id: finalDeposit.id },
                data: {
                    status: 'APPROVED',
                    processedBy: 1,
                    processedAt: new Date(),
                },
            }),
            prisma.account.update({
                where: { id: account.id },
                data: {
                    balance: {
                        increment: finalDeposit.amount,
                    },
                },
            }),
        ]);

        const updatedAccountAfterDeposit = await prisma.account.findUnique({
            where: { id: account.id },
        });

        console.log(`   ✅ Deposit approved`);
        console.log(`   New Balance: $${updatedAccountAfterDeposit.balance.toFixed(2)}\n`);

        // Test 3: Create withdrawal transaction
        console.log('3️⃣  Creating withdrawal transaction...');
        const withdrawalTransaction = await prisma.transaction.create({
            data: {
                accountId: account.id,
                type: 'WITHDRAWAL',
                amount: 50,
                status: 'PENDING',
                transaction_id: 'TEMP',
            },
        });

        const finalWithdrawal = await prisma.transaction.update({
            where: { id: withdrawalTransaction.id },
            data: {
                transaction_id: generateTransactionId(withdrawalTransaction.id),
            },
        });

        console.log(`   ✅ Withdrawal created: ${finalWithdrawal.transaction_id}`);
        console.log(`   Amount: $${finalWithdrawal.amount}`);
        console.log(`   Status: ${finalWithdrawal.status}\n`);

        // Test 4: Approve withdrawal
        console.log('4️⃣  Approving withdrawal transaction...');
        await prisma.$transaction([
            prisma.transaction.update({
                where: { id: finalWithdrawal.id },
                data: {
                    status: 'APPROVED',
                    processedBy: 1,
                    processedAt: new Date(),
                },
            }),
            prisma.account.update({
                where: { id: account.id },
                data: {
                    balance: {
                        decrement: finalWithdrawal.amount,
                    },
                },
            }),
        ]);

        const finalBalance = await prisma.account.findUnique({
            where: { id: account.id },
        });

        console.log(`   ✅ Withdrawal approved`);
        console.log(`   Final Balance: $${finalBalance.balance.toFixed(2)}\n`);

        // Test 5: List all transactions
        console.log('5️⃣  Transaction History:');
        const transactions = await prisma.transaction.findMany({
            where: { accountId: account.id },
            orderBy: { createdAt: 'desc' },
        });

        transactions.forEach((txn) => {
            console.log(`   ${txn.type.padEnd(10)} | ${txn.transaction_id} | $${txn.amount.toFixed(2).padStart(8)} | ${txn.status}`);
        });

        console.log('\n✅ All tests completed successfully!');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDepositWorkflow();
