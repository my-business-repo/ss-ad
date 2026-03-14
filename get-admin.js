const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.admin.findFirst().then(a => console.log('Admin Refer Code:', a.referCode)).finally(() => prisma.$disconnect());
