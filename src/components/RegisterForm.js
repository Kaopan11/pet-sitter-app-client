"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterForm({
  title,
  subtitle,
  role,
  loginHref,
  loginPrompt,
  loginLabel = "Login",
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register({ email, name, phone, password, role });
      saveAuth(data, true);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-h3">{title}</h1>
        <p className="text-body-3 text-muted">{subtitle}</p>
      </header>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-medium text-gray-600">Name</span>
        <input
          className="input"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
      </label>

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
        <span className="text-body-3 font-medium text-gray-600">Phone</span>
        <input
          className="input"
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="Your phone number"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
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
            autoComplete="new-password"
            placeholder="Create your password"
            minLength={6}
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

      {error ? <p className="text-body-3 text-red">{error}</p> : null}

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      <p className="text-center text-body-3 text-gray-500">
        {loginPrompt}{" "}
        <Link href={loginHref} className="font-bold text-primary">
          {loginLabel}
        </Link>
      </p>
    </form>
  );
}
