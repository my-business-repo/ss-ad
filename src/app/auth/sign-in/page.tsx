"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
        return;
      }

      // Redirect to home page on success
      router.push("/");
      router.refresh();
    } catch (error) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Sign In Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
            <p className="mt-2 text-blue-100">Sign in to your account</p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  placeholder="your@email.com"
                />
              </div>

              {/* Password Input */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-all duration-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-blue-400"
                  placeholder="••••••••"
                />
              </div>

              {/* Sign In Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 font-semibold text-white transition-all duration-200 hover:from-blue-700 hover:to-purple-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          © 2024 Your Company. All rights reserved.
        </p>
      </div>
    </div>
  );
}
