"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginForm({
  title,
  subtitle,
  registerHref,
  registerPrompt,
  registerLabel = "Register",
  showRemember = false,
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login({ email, password });
      saveAuth(data, showRemember ? remember : true);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-h3">{title}</h1>
        <p className="text-body-3 text-muted">{subtitle}</p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-medium text-gray-600">Email</span>
        <input
          className="input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="email@company.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-medium text-gray-600">Password</span>
        <div className="relative">
          <input
            className="input pr-16"
            type={showPassword ? "text" : "password"}
            name="password"
            autoComplete="current-password"
            placeholder="Create your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          <button
            type="button"
            className="absolute top-1/2 right-3 -translate-y-1/2 text-body-3 text-primary"
            onClick={() => setShowPassword((value) => !value)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </label>

      {showRemember ? (
        <div className="flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-body-3 text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            Remember?
          </label>
        </div>
      ) : null}

      {error ? <p className="text-body-3 text-red">{error}</p> : null}

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <p className="text-center text-body-3 text-gray-500">
        {registerPrompt}{" "}
        <Link href={registerHref} className="font-bold text-primary">
          {registerLabel}
        </Link>
      </p>
    </form>
  );
}
