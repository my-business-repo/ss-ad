"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function updatePassword(prevState: any, formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return { success: false, message: "Not authenticated" };
        }

        const currentPassword = formData.get("currentPassword") as string;
        const newPassword = formData.get("newPassword") as string;
        const confirmPassword = formData.get("confirmPassword") as string;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return { success: false, message: "All fields are required" };
        }

        if (newPassword !== confirmPassword) {
            return { success: false, message: "New passwords do not match" };
        }

        const admin = await db.admin.findUnique({
            where: { email: session.user.email },
        });

        if (!admin) {
            return { success: false, message: "User not found" };
        }

        // specific to password update logic
        // We assume the user has a password set. If not, this check might fail or need adjustment based on auth provider (but this is credential based)
        const passwordsMatch = await bcrypt.compare(currentPassword, admin.password);

        if (!passwordsMatch) {
            return { success: false, message: "Current password is incorrect" };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.admin.update({
            where: { email: session.user.email },
            data: { password: hashedPassword },
        });

        revalidatePath("/pages/settings");
        return { success: true, message: "Password updated successfully" };
    } catch (error) {
        console.error("Update password error:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}
