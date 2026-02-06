"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

function generateRandomString(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export async function createAdmin(prevState: any, formData: FormData) {
    try {
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const role = formData.get("role") as string;

        if (!name || !email || !password || !role) {
            return { success: false, message: "All fields are required." };
        }

        // Check if email already exists
        const existingAdmin = await db.admin.findUnique({
            where: { email },
        });

        if (existingAdmin) {
            return { success: false, message: "Email is already in use." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = `ADM-${generateRandomString(6).toUpperCase()}`;
        const referCode = generateRandomString(8).toUpperCase();

        await db.admin.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as any,
                user_id: userId,
                referCode: referCode,
            },
        });

        revalidatePath("/trading/admin");
        return { success: true, message: "Admin created successfully!" };
    } catch (error) {
        console.error("Failed to create admin:", error);
        return { success: false, message: "Something went wrong. Please try again." };
    }
}

export async function updateAdmin(prevState: any, formData: FormData) {
    try {
        const id = parseInt(formData.get("id") as string);
        const name = formData.get("name") as string;
        const email = formData.get("email") as string;
        const role = formData.get("role") as string;
        const password = formData.get("password") as string;

        if (!id || !name || !email || !role) {
            return { success: false, message: "Required fields missing." };
        }

        const dataToUpdate: any = { name, email, role: role as any };

        if (password && password.trim() !== "") {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        await db.admin.update({
            where: { id },
            data: dataToUpdate,
        });

        revalidatePath("/trading/admin");
        return { success: true, message: "Admin updated successfully!" };
    } catch (error) {
        console.error("Failed to update admin:", error);
        return { success: false, message: "Failed to update admin." };
    }
}

export async function deleteAdmin(id: number) {
    try {
        await db.admin.delete({
            where: { id },
        });
        revalidatePath("/trading/admin");
        return { success: true, message: "Admin deleted successfully!" };
    } catch (error) {
        console.error("Failed to delete admin:", error);
        return { success: false, message: "Failed to delete admin." };
    }
}
