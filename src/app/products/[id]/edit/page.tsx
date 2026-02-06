import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import EditProductForm from "./edit-form";

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);

    if (isNaN(id)) {
        notFound();
    }

    const product = await db.product.findUnique({
        where: { id },
    });

    if (!product) {
        notFound();
    }

    return <EditProductForm product={product} />;
}
