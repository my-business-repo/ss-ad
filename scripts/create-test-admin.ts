import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { hashPassword } from "../src/lib/password";
import { generateUserId } from "../src/lib/user-id";

const prisma = new PrismaClient();

async function main() {
    console.log("Creating test admin user...");

    try {
        // Hash the password
        const hashedPassword = await hashPassword("Admin123!");

        // Create admin with temporary user_id
        const admin = await prisma.admin.create({
            data: {
                name: "Admin User",
                email: "admin@test.com",
                password: hashedPassword,
                referCode: "ADMIN00001",
                role: "SUPER_ADMIN",
                user_id: "TEMP",
            },
        });

        // Update with formatted user_id
        const updatedAdmin = await prisma.admin.update({
            where: { id: admin.id },
            data: {
                user_id: generateUserId(admin.id),
            },
        });

        console.log("✅ Test admin created successfully!");
        console.log("Email:", updatedAdmin.email);
        console.log("Password: Admin123!");
        console.log("User ID:", updatedAdmin.user_id);
        console.log("Role:", updatedAdmin.role);
    } catch (error: any) {
        if (error.code === "P2002") {
            console.log("ℹ️  Admin already exists. You can use:");
            console.log("Email: admin@test.com");
            console.log("Password: Admin123!");
        } else {
            console.error("❌ Error creating admin:", error);
            process.exit(1);
        }
    }
}

main()
    .then(() => prisma.$disconnect())
    .catch((error) => {
        console.error(error);
        prisma.$disconnect();
        process.exit(1);
    });
