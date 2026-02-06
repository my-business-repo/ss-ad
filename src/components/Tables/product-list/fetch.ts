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

export async function getProducts(): Promise<ProductListItem[]> {
    const products = await db.product.findMany({
        orderBy: {
            createdAt: "desc",
        },
    });

    return products.map((product) => ({
        id: product.id,
        product_id: product.product_id,
        name: product.name,
        description: product.description,
        price: product.price,
        commission: product.commission,
        rating: product.rating,
        status: product.status,
        image: product.image,
    }));
}
