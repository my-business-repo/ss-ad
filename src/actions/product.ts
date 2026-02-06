"use server";

import { db } from "@/lib/db";
import { uploadFile, deleteFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// Generate unique 8-char product ID
function generateProductId(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export async function createProduct(prevState: any, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = parseFloat(formData.get("price") as string);
        const commission = parseFloat(formData.get("commission") as string);
        const rating = parseFloat(formData.get("rating") as string);
        const imageFile = formData.get("image") as File;

        if (!name || !description || isNaN(price) || isNaN(commission)) {
            return { message: "Please fill in all required fields." };
        }

        let imageUrl = null;
        if (imageFile && imageFile.size > 0) {
            try {
                imageUrl = await uploadFile(imageFile, "products");
            } catch (error) {
                console.error("Upload failed:", error);
                return { message: "Failed to upload image. Please try again." };
            }
        }

        // Ensure unique product ID
        let product_id = generateProductId();
        let existing = await db.product.findUnique({ where: { product_id } });
        while (existing) {
            product_id = generateProductId();
            existing = await db.product.findUnique({ where: { product_id } });
        }

        await db.product.create({
            data: {
                product_id,
                name,
                description,
                price,
                commission,
                rating: rating || 0, // Default to 0 if not provided
                image: imageUrl,
                status: "active",
            },
        });

    } catch (error) {
        console.error("Failed to create product:", error);
        return { message: "Database error: Failed to create product." };
    }

    revalidatePath("/products");
    redirect("/products");
}

export async function deleteProduct(productId: number, imageUrl: string | null) {
    try {
        if (imageUrl) {
            // Extract key from URL
            // Assuming URL format: https://.../products/filename.ext or R2_PUBLIC_URL/products/filename.ext
            // We just need the part after the last slash if it is directly in bucket root, or relative path?
            // "products/..." is the key.
            // If the URL is full, we try to strip domain.

            // Heuristic: finding the index of "products/"
            const parts = imageUrl.split("/products/");
            if (parts.length > 1) {
                const key = "products/" + parts[1];
                await deleteFile(key).catch((err: any) => console.error("Failed to delete file", err));
            }
        }

        // Wait, I need to import deleteFile, but I can just call it if I update imports or re-export.
        // But for now, let's fix the import at the top first if needed, 
        // or just import it.
        // Wait, `uploadFile` is the exported function, `deleteFile` is separate.
        // I need to update imports at the top.

        await db.product.delete({
            where: { id: productId },
        });

    } catch (error) {
        console.error("Failed to delete product:", error);
        throw new Error("Failed to delete product");
    }

    revalidatePath("/products");
}

export async function updateProduct(prevState: any, formData: FormData) {
    try {
        const id = parseInt(formData.get("id") as string);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const price = parseFloat(formData.get("price") as string);
        const commission = parseFloat(formData.get("commission") as string);
        const rating = parseFloat(formData.get("rating") as string);

        console.log("--- Update Product Debug ---");
        console.log("Raw rating string:", formData.get("rating"));
        console.log("Parsed rating number:", rating);

        const imageFile = formData.get("image") as File;
        const currentImageUrl = formData.get("currentImageUrl") as string;

        if (!id || !name || !description || isNaN(price) || isNaN(commission)) {
            return { message: "Please fill in all required fields." };
        }

        let imageUrl = currentImageUrl; // Default to existing image

        // Handle Image Upload if new file provided
        if (imageFile && imageFile.size > 0) {
            try {
                // Upload new image
                const newImageUrl = await uploadFile(imageFile, "products");

                // Delete old image if it exists and is different (and strictly if we successfully uploaded the new one)
                if (currentImageUrl) {
                    // Extract key from URL
                    const parts = currentImageUrl.split("/products/");
                    if (parts.length > 1) {
                        const key = "products/" + parts[1];
                        await deleteFile(key).catch((err: any) => console.error("Failed to delete old file", err));
                    }
                }

                imageUrl = newImageUrl;
            } catch (error) {
                console.error("Upload failed:", error);
                return { message: "Failed to upload new image. Product not updated." };
            }
        }

        await db.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                commission,
                rating: rating || 0,
                image: imageUrl,
            },
        });

    } catch (error) {
        console.error("Failed to update product:", error);
        return { message: "Database error: Failed to update product." };
    }

    revalidatePath("/products");
    revalidatePath(`/products/${formData.get("id")}`); // Revalidate detail page too
    redirect("/products");
}
