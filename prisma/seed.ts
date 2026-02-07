import { AdminRole } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { db as prisma } from '../src/lib/db';

async function main() {
    const password = await bcrypt.hash('password', 10);

    const admin = await prisma.admin.upsert({
        where: { email: 'admin@domain.com' },
        update: {},
        create: {
            user_id: 'ADMIN001',
            email: 'admin@domain.com',
            name: 'Admin',
            password,
            role: AdminRole.SUPER_ADMIN,
            referCode: 'ADMIN123',
        },
    });

    console.log({ admin });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
