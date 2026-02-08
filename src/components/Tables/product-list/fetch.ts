'use server';

import { db } from "@/lib/db";

export type ProductListItem = {
    id: number;
    product_id: string;
    name: string;
    description: string;
    price: number;
    commission: number;
    rating: number;
    status: string;
    image: string | null;
};

export async function getProducts(page: number = 1, pageSize: number = 10): Promise<{ products: ProductListItem[], total: number }> {
    const skip = (page - 1) * pageSize;

    const [products, total] = await Promise.all([
        db.product.findMany({
            skip,
            take: pageSize,
            orderBy: {
                createdAt: "desc",
            },
        }),
        db.product.count()
    ]);

    return {
        products: products.map((product: any) => ({
            id: product.id,
            product_id: product.product_id,
            name: product.name,
            description: product.description,
            price: product.price,
            commission: product.commission,
            rating: product.rating,
            status: product.status,
            image: product.image,
        })),
        total
    };
}
