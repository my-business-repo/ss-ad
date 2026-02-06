import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isOnSignIn = req.nextUrl.pathname.startsWith("/auth/sign-in");

    console.log("Middleware executing for:", req.nextUrl.pathname, "IsLoggedIn:", isLoggedIn);

    // If not logged in and not on sign-in page, redirect to sign-in
    if (!isLoggedIn && !isOnSignIn) {
        return NextResponse.redirect(new URL("/auth/sign-in", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.png).*)"],
};
