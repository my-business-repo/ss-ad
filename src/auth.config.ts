import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
    providers: [], // Configured in auth.ts
    pages: {
        signIn: "/auth/sign-in",
    },
    callbacks: {
        async jwt({ token, user }) {
            console.log("JWT Callback Triggered. Token ID:", token?.id);
            if (user) {
                console.log("JWT Callback: User logged in", user.id);
                token.id = user.id;
                token.role = user.role;
                token.user_id = user.user_id;
            }
            return token;
        },
        async session({ session, token }) {
            console.log("Session Callback:", token.id);
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
                session.user.user_id = token.user_id as string;
            }
            return session;
        },
    },
    session: {
        strategy: "jwt",
    },
};
