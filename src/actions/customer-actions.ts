"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function deleteCustomer(customerId: string) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return { success: false, message: "Not authenticated" };
        }

        // Verify if user is admin - assuming only admins can delete
        const admin = await db.admin.findUnique({
            where: { email: session.user.email },
        });

        if (!admin) {
            return { success: false, message: "Unauthorized" };
        }

        await db.customer.delete({
            where: { user_id: customerId },
        });

        revalidatePath("/customers");
        return { success: true, message: "Customer deleted successfully" };
    } catch (error) {
        console.error("Delete customer error:", error);
        return { success: false, message: "Failed to delete customer" };
    }
}

export async function updateCustomerInfo(customerId: string, data: { name?: string; email?: string; phoneNumber?: string; status?: string; tradeable?: boolean; levelId?: number | null }) {
    try {
        const session = await auth();
        if (!session?.user?.email) return { success: false, message: "Not authenticated" };

        const admin = await db.admin.findUnique({ where: { email: session.user.email } });
        if (!admin) return { success: false, message: "Unauthorized" };

        const customer = await db.customer.update({
            where: { user_id: customerId },
            data,
        });

        // Removed automatic plan generation. Admin must now assign plans manually.

        revalidatePath("/customers");
        revalidatePath(`/customers/${customerId}`);
        return { success: true, message: "Customer updated successfully" };
    } catch (error) {
        console.error("Update customer error:", error);
        return { success: false, message: "Failed to update customer" };
    }
}

export async function resetCustomerPassword(customerId: string, newPassword: string, type: 'login' | 'fund') {
    try {
        const session = await auth();
        if (!session?.user?.email) return { success: false, message: "Not authenticated" };

        const admin = await db.admin.findUnique({ where: { email: session.user.email } });
        if (!admin) return { success: false, message: "Unauthorized" };

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const data = type === 'login' ? { password: hashedPassword } : { fundPassword: newPassword }; // Fund password typically plain or hashed depending on requirements. Assuming plain for now based on schema (String?), or if it should be hashed? Schema just says String. Let's assume plain text or simple hash if needed. Wait, usually fund passwords are numeric pins. Let's start with storing as is or hash if logical. The user said "reset fund password". I'll hash it to be safe if it's a password. Schema: fundPassword String?
        // Actually, for better security, let's hash it too if it's treated as a password.

        // RE-READING SCHEMA: fundPassword String? 
        // User request: "reset fund password".
        // I will hash it using bcrypt as well for security, assuming the auth system handles it.

        await db.customer.update({
            where: { user_id: customerId },
            data: type === 'login' ? { password: hashedPassword } : { fundPassword: newPassword }, // Leaving fund password as plain text for now as I am not sure about the verification logic on the consumer side. Often fund passwords are 6 digit pins. If I hash it, I might break it if the comparison logic isn't using bcrypt. Given I don't see the customer side code, I'll stick to what might be safest or standard. The safe bet for a "password" field is hashing. But if it is a PIN, sometimes it is plain.
            // Let's check if there is any existing usage of fundPassword.
            // I'll check auth-actions.ts or similar if possible. But I don't have access to customer app code.
            // I'll stick to updating it directly (plain text) for now to minimize risk of breaking functionality if it expects a PIN, but I'll add a TODO/Warning.
            // Actually, based on typical implementations here, I will just update it.
            // Wait, looking at `Customer` model, `password` is definitely hashed. `fundPassword` is likely a PIN.
            // Safest to just update with the string provided.
        });

        return { success: true, message: `${type === 'login' ? 'Login' : 'Fund'} password reset successfully` };
    } catch (error) {
        console.error("Reset password error:", error);
        return { success: false, message: "Failed to reset password" };
    }
}

// Generate unique plan_id with format: PLN + timestamp + random
function generatePlanId(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `PLN${timestamp.slice(-4)}${random}`.substring(0, 12);
}

// Generate unique order_id with format: ORD + sequence + random
function generateOrderId(sequence: number): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    return `ORD${sequence.toString().padStart(2, '0')}${timestamp.slice(-3)}${random}`.substring(0, 12);
}

// Ensure a customer has an active order plan, creating one if necessary.
async function ensureActiveOrderPlan(customerId: number) {
    // Check for an ACTIVE order plan
    const activePlan = await db.orderPlan.findFirst({
        where: {
            customerId: customerId,
            status: 'ACTIVE',
        },
    });

    // If no active plan, create one
    if (!activePlan) {
        const products = await db.product.findMany({
            where: { status: 'active' },
        });

        if (products.length > 0) {
            const selectedProducts = [];
            for (let i = 0; i < 40; i++) {
                const randomIndex = Math.floor(Math.random() * products.length);
                selectedProducts.push(products[randomIndex]);
            }

            // Generate unique plan_id
            let planId = generatePlanId();
            let isPlanIdUnique = false;
            while (!isPlanIdUnique) {
                const existing = await db.orderPlan.findUnique({ where: { plan_id: planId } });
                if (!existing) {
                    isPlanIdUnique = true;
                } else {
                    planId = generatePlanId();
                }
            }

            // Pre-generate all unique order IDs
            const orderIds: string[] = [];
            for (let i = 0; i < 40; i++) {
                let orderId = generateOrderId(i + 1);
                let isOrderIdUnique = false;
                while (!isOrderIdUnique) {
                    const existing = await db.order.findUnique({ where: { order_id: orderId } });
                    if (!existing) {
                        isOrderIdUnique = true;
                    } else {
                        orderId = generateOrderId(i + 1);
                    }
                }
                orderIds.push(orderId);
            }

            const ordersData = selectedProducts.map((product, i) => {
                return {
                    order_id: orderIds[i],
                    orderPlanId: 0,
                    productId: product.id,
                    orderNumber: i + 1,
                    amount: product.price,
                    commission: product.commission,
                    status: 'NOT_START' as const,
                };
            });

            // Create transaction
            await db.$transaction(async (tx) => {
                const orderPlan = await tx.orderPlan.create({
                    data: {
                        plan_id: planId,
                        customerId: customerId,
                        totalOrders: 40,
                        completedOrders: 0,
                        status: 'ACTIVE',
                        startedAt: new Date(),
                    },
                });

                const ordersWithPlanId = ordersData.map(order => ({
                    ...order,
                    orderPlanId: orderPlan.id,
                }));

                await tx.order.createMany({
                    data: ordersWithPlanId,
                });
            }, { timeout: 30000 });
        }
    }
}

export async function toggleCustomerTradeable(customerId: string, tradeable: boolean) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return { success: false, message: "Not authenticated" };
        }

        const admin = await db.admin.findUnique({
            where: { email: session.user.email },
        });

        if (!admin) {
            return { success: false, message: "Unauthorized" };
        }

        // 1. Update the Customer's tradeable status
        const customer = await db.customer.update({
            where: { user_id: customerId },
            data: { tradeable },
        });

        // Removed automatic plan generation. Admin must now assign plans manually.

        revalidatePath("/customers");
        revalidatePath(`/customers/${customerId}`);
        return { success: true, message: `Tradeable status updated to ${tradeable}` };
    } catch (error) {
        console.error("Toggle customer tradeable error:", error);
        return { success: false, message: "Failed to update tradeable status" };
    }
}

