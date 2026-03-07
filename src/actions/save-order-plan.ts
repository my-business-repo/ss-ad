"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSaveOrderPlan(prevState: any, formData: FormData) {
    try {
        const planIdRaw = formData.get("planId") as string;
        const name = formData.get("name") as string;
        const productsJson = formData.get("products") as string;

        if (!name || !productsJson) {
            return { message: "Please provide a name and select at least one product." };
        }

        let productIds: number[] = [];
        try {
            productIds = JSON.parse(productsJson);
            if (!Array.isArray(productIds) || productIds.length === 0) {
                return { message: "Please select at least one product." };
            }
        } catch (e) {
            return { message: "Invalid product selection." };
        }

        const isUpdate = !!planIdRaw;

        // Use a transaction to ensure plan and items are created together
        await db.$transaction(async (tx) => {
            if (isUpdate) {
                const planId = parseInt(planIdRaw);

                // Update plan name
                await tx.savedOrderPlan.update({
                    where: { id: planId },
                    data: { name }
                });

                // Clear old items
                await tx.savedOrderPlanItem.deleteMany({
                    where: { savedOrderPlanId: planId }
                });

                // Create new items based on their sequence in the array
                const itemsData = productIds.map((productId, index) => ({
                    savedOrderPlanId: planId,
                    productId: productId,
                    sequence: index + 1
                }));

                await tx.savedOrderPlanItem.createMany({
                    data: itemsData
                });
            } else {
                const savedPlan = await tx.savedOrderPlan.create({
                    data: { name }
                });

                const itemsData = productIds.map((productId, index) => ({
                    savedOrderPlanId: savedPlan.id,
                    productId: productId,
                    sequence: index + 1
                }));

                await tx.savedOrderPlanItem.createMany({
                    data: itemsData
                });
            }
        });

    } catch (error) {
        console.error("Failed to save order plan:", error);
        return { message: "Database error: Failed to save order plan." };
    }

    revalidatePath("/save-order-plan");
    redirect("/save-order-plan"); // Redirect to the available order plan list
}

export async function deleteSaveOrderPlan(id: number) {
    try {
        await db.savedOrderPlan.delete({
            where: { id },
        });
    } catch (error) {
        console.error("Failed to delete save order plan:", error);
        throw new Error("Failed to delete save order plan");
    }

    revalidatePath("/save-order-plan");
}
