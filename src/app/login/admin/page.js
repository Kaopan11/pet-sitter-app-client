"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import PasswordInput from "@/components/PasswordInput";
import { saveAuth } from "@/lib/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Simulate/call API authentication
      // In production/API integration: await loginAdmin({ username, password });
      if (!username || !password) {
        throw new Error("Please fill in both Username and Password.");
      }

      // Save auth token & admin info
      saveAuth({
        token: "admin-session-token",
        user: { username, role: "admin", isAdmin: true, name: "Administrator" },
      });

      // Redirect to Admin Navigation dashboard
      router.push("/admin/pet-sitter");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/image/logo.png"
              alt="Pet Sitter Logo"
              width={160}
              height={48}
              className="h-12 w-auto"
              priority
            />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Admin Portal Login
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in with your admin credentials to continue
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 sm:rounded-2xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username" className="block text-sm font-bold text-gray-700">
                Username / Email
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="Enter admin username or email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full btn btn-primary py-3 text-base shadow-sm"
              >
                {loading ? "Signing in..." : "Log in to Admin"}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-gray-100 pt-4 text-center">
            <Link href="/login" className="text-xs text-gray-500 hover:text-[#FF7037]">
              ← Back to User Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
