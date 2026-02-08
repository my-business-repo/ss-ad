import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const products = [
    {
        product_id: 'PROD0001',
        name: 'iPhone 15 Pro Max',
        description: 'Latest flagship smartphone with A17 Pro chip, titanium design, and advanced camera system',
        price: 1199.99,
        commission: 8.5,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0002',
        name: 'Samsung Galaxy S24 Ultra',
        description: 'Premium Android smartphone with S Pen, 200MP camera, and AI features',
        price: 1299.99,
        commission: 9.0,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0003',
        name: 'MacBook Pro 16"',
        description: 'Powerful laptop with M3 Max chip, stunning display, and all-day battery life',
        price: 2499.99,
        commission: 7.5,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0004',
        name: 'Sony WH-1000XM5',
        description: 'Industry-leading noise cancelling wireless headphones with exceptional sound quality',
        price: 399.99,
        commission: 10.0,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0005',
        name: 'Apple Watch Series 9',
        description: 'Advanced health and fitness smartwatch with always-on display',
        price: 429.99,
        commission: 8.0,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0006',
        name: 'iPad Pro 12.9"',
        description: 'Ultimate creative tablet with M2 chip and Liquid Retina XDR display',
        price: 1099.99,
        commission: 7.0,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0007',
        name: 'Nike Air Max 90',
        description: 'Classic running shoes with iconic design and superior comfort',
        price: 129.99,
        commission: 12.0,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0008',
        name: 'Canon EOS R6 Mark II',
        description: 'Professional mirrorless camera with 24MP sensor and advanced autofocus',
        price: 2499.00,
        commission: 6.5,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0009',
        name: 'Dyson V15 Detect',
        description: 'Powerful cordless vacuum with laser dust detection technology',
        price: 649.99,
        commission: 9.5,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0010',
        name: 'PlayStation 5',
        description: 'Next-gen gaming console with ultra-high speed SSD and 4K gaming',
        price: 499.99,
        commission: 8.0,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0011',
        name: 'Levi\'s 501 Original Jeans',
        description: 'Iconic straight fit jeans with button fly, a timeless classic',
        price: 89.99,
        commission: 15.0,
        rating: 4.4,
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0012',
        name: 'Bose QuietComfort 45',
        description: 'Premium wireless headphones with world-class noise cancellation',
        price: 329.99,
        commission: 10.5,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0013',
        name: 'KitchenAid Stand Mixer',
        description: 'Professional 5-quart mixer with multiple attachments for baking',
        price: 379.99,
        commission: 11.0,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0014',
        name: 'Adidas Ultraboost 23',
        description: 'High-performance running shoes with responsive Boost cushioning',
        price: 189.99,
        commission: 12.5,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0015',
        name: 'Samsung 65" QLED TV',
        description: '4K Smart TV with Quantum Dot technology and stunning HDR',
        price: 1299.99,
        commission: 7.5,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0016',
        name: 'Nespresso Vertuo',
        description: 'Coffee and espresso machine with one-touch brewing',
        price: 179.99,
        commission: 13.0,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0017',
        name: 'Ray-Ban Wayfarer',
        description: 'Classic sunglasses with iconic design and superior UV protection',
        price: 159.99,
        commission: 14.0,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0018',
        name: 'Dell XPS 15',
        description: 'Premium laptop with InfinityEdge display and powerful performance',
        price: 1899.99,
        commission: 6.0,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0019',
        name: 'GoPro HERO 12',
        description: 'Waterproof action camera with 5.3K video and HyperSmooth stabilization',
        price: 399.99,
        commission: 9.0,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0020',
        name: 'The North Face Jacket',
        description: 'Waterproof outdoor jacket with superior warmth and durability',
        price: 299.99,
        commission: 11.5,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0021',
        name: 'Fitbit Charge 6',
        description: 'Advanced fitness tracker with heart rate monitoring and GPS',
        price: 159.99,
        commission: 13.5,
        rating: 4.5,
        image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0022',
        name: 'Instant Pot Duo',
        description: '7-in-1 electric pressure cooker for fast, healthy meals',
        price: 99.99,
        commission: 14.5,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0023',
        name: 'Microsoft Surface Pro 9',
        description: '2-in-1 tablet and laptop with touchscreen and Surface Pen support',
        price: 1199.99,
        commission: 7.0,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0024',
        name: 'Patagonia Backpack',
        description: 'Durable 28L backpack perfect for hiking and daily commute',
        price: 129.99,
        commission: 12.0,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0025',
        name: 'Kindle Paperwhite',
        description: 'Waterproof e-reader with adjustable warm light and weeks of battery',
        price: 139.99,
        commission: 11.0,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0026',
        name: 'Logitech MX Master 3S',
        description: 'Advanced wireless mouse with ultra-fast scrolling and ergonomic design',
        price: 99.99,
        commission: 15.0,
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0027',
        name: 'Ninja Air Fryer',
        description: 'Large capacity air fryer for healthier cooking with less oil',
        price: 129.99,
        commission: 13.0,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1585307834225-c7c29d7f7ae8?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0028',
        name: 'JBL Flip 6',
        description: 'Portable Bluetooth speaker with powerful sound and 12-hour battery',
        price: 129.99,
        commission: 14.0,
        rating: 4.6,
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0029',
        name: 'Yeti Rambler Tumbler',
        description: '30oz insulated tumbler that keeps drinks cold or hot for hours',
        price: 39.99,
        commission: 18.0,
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500',
        status: 'active'
    },
    {
        product_id: 'PROD0030',
        name: 'Anker PowerCore 20000',
        description: 'High-capacity portable charger for smartphones and tablets',
        price: 49.99,
        commission: 16.0,
        rating: 4.7,
        image: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500',
        status: 'active'
    }
];

async function main() {
    console.log('Starting to seed products...');

    for (const product of products) {
        await prisma.product.upsert({
            where: { product_id: product.product_id },
            update: {},
            create: product,
        });
        console.log(`✓ Created product: ${product.name}`);
    }

    console.log('\n✅ Successfully seeded 30 products!');
}

main()
    .catch((e) => {
        console.error('Error seeding products:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
