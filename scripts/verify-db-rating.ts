import { PrismaClient } from "@/generated/prisma";
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            rating: true,
        },
        orderBy: {
            updatedAt: 'desc',
        },
        take: 5,
    });

    console.log('Recent 5 products ratings:');
    products.forEach(p => {
        console.log(`ID: ${p.id}, Name: ${p.name}, Rating: ${p.rating} (Type: ${typeof p.rating})`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
