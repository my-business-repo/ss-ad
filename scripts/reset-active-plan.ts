import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Get email from command line arguments
    const email = process.argv[2];

    if (!email) {
        console.error('Please provide a customer email address.');
        console.log('Usage: npx ts-node scripts/reset-active-plan.ts <email>');
        process.exit(1);
    }

    try {
        console.log(`Connecting to database...`);

        // Find the customer
        const customer = await prisma.customer.findUnique({
            where: { email: email },
        });

        if (!customer) {
            console.error(`Error: Customer with email "${email}" not found.`);
            process.exit(1);
        }

        console.log(`Found customer: ${customer.name} (ID: ${customer.id})`);

        // Check for active plan
        const activePlan = await prisma.orderPlan.findFirst({
            where: {
                customerId: customer.id,
                status: 'ACTIVE',
            },
            include: {
                orders: true
            }
        });

        if (!activePlan) {
            console.log(`No active order plan found for customer "${email}".`);
            return;
        }

        console.log(`Found active plan: ${activePlan.plan_id} with ${activePlan.orders.length} orders.`);
        console.log(`Deleting plan and associated orders...`);

        // Delete the plan (orders will be deleted due to cascade if configured, otherwise we delete them manually)
        // Let's rely on cascade or explicit delete to be safe.
        // Schema says: Order -> OrderPlan (onDelete: Cascade)
        // So deleting OrderPlan is enough.

        await prisma.orderPlan.delete({
            where: { id: activePlan.id },
        });

        console.log(`Successfully deleted active order plan for ${email}.`);

    } catch (error) {
        console.error('Error executing script:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
