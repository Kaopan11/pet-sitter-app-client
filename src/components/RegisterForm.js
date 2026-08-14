"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import SocialAuthButtons from "@/components/SocialAuthButtons";
import PasswordInput from "@/components/PasswordInput";

// หน้าสมัครเดียว — toggle Owner/Sitter ส่ง asSitter ให้ backend
export default function RegisterForm({
  title = "Join Us!",
  subtitle = "Find your perfect pet sitter with us",
  loginHref = "/login/owner",
  loginPrompt = "Already have an account?",
  loginLabel = "Login",
}) {
  const router = useRouter();
  const [mode, setMode] = useState("owner");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const asSitter = mode === "sitter";

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register({
        name,
        email,
        phone,
        password,
        asSitter,
      });
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
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-h2">{title}</h1>
        <p className="text-body-2 text-gray-400">{subtitle}</p>
      </header>

      <div
        className="mx-auto flex w-full max-w-70 rounded-full bg-gray-100 p-1"
        role="tablist"
        aria-label="Register as"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "owner"}
          className={`flex-1 rounded-full py-2 text-body-3 font-bold transition ${
            mode === "owner"
              ? "bg-white text-orange-500 ring-1 ring-orange-500"
              : "text-gray-400"
          }`}
          onClick={() => setMode("owner")}
        >
          Owner
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sitter"}
          className={`flex-1 rounded-full py-2 text-body-3 font-bold transition ${
            mode === "sitter"
              ? "bg-white text-orange-500 ring-1 ring-orange-500"
              : "text-gray-400"
          }`}
          onClick={() => setMode("sitter")}
        >
          Sitter
        </button>
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Name</span>
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

      <div className="flex flex-col gap-2">
        <label htmlFor="register-password" className="text-body-3 font-bold text-black">
          Password
        </label>
        <PasswordInput
          id="register-password"
          autoComplete="new-password"
          placeholder="Create your password"
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </div>

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Email</span>
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
        <span className="text-body-3 font-bold text-black">Phone</span>
        <input
          className="input"
          type="tel"
          name="phone"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="Your phone number"
          maxLength={10}
          pattern="[0-9]{10}"
          title="Phone must be 10 digits"
          value={phone}
          onChange={(event) =>
            setPhone(event.target.value.replace(/\D/g, "").slice(0, 10))
          }
          required
        />
      </label>

      {error ? <p className="text-center text-body-3 text-red">{error}</p> : null}

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading
          ? "Registering..."
          : asSitter
            ? "Register as Sitter"
            : "Register as Owner"}
      </button>

      <SocialAuthButtons />

      <p className="text-center text-body-3 text-gray-500">
        {loginPrompt}{" "}
        <Link href={loginHref} className="font-bold text-primary">
          {loginLabel}
        </Link>
      </p>
    </form>
  );
}
