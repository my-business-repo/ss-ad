
import { db } from '../lib/db';

async function main() {
    const levels = await db.customerLevel.findMany();
    console.log('Customer Levels:', JSON.stringify(levels, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await db.$disconnect();
    });
