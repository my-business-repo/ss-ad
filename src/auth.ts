import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";

export const { auth, signIn, signOut, handlers } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("Authorize called with:", { email: credentials?.email });
                if (!credentials?.email || !credentials?.password) {
                    console.log("Missing credentials");
                    return null;
                }

                const email = credentials.email as string;
                const password = credentials.password as string;

                // Find admin by email
                const admin = await db.admin.findUnique({
                    where: { email },
                });

                if (!admin) {
                    console.log("Admin not found for email:", email);
                    return null;
                }

                // Verify password
                const isValidPassword = await verifyPassword(password, admin.password);

                if (!isValidPassword) {
                    console.log("Invalid password for user:", email);
                    return null;
                }

                console.log("User authenticated successfully:", admin.id);

                // Return user object
                return {
                    id: admin.id.toString(),
                    email: admin.email,
                    name: admin.name,
                    role: admin.role,
                    user_id: admin.user_id,
                };
            },
        }),
    ],
});
