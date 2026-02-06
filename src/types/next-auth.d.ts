import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        role?: string;
        user_id?: string;
    }

    interface Session {
        user: {
            id: string;
            role: string;
            user_id: string;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        role?: string;
        user_id?: string;
    }
}
