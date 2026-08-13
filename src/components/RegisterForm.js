"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/api";
import { saveAuth } from "@/lib/auth";
import SocialAuthButtons from "@/components/SocialAuthButtons";

// ฟอร์มสมัครใช้ร่วม owner / sitter — role มาจากหน้า page (pet_owner | pet_sitter)
export default function RegisterForm({
  title,
  subtitle,
  role,
  loginHref,
  loginPrompt,
  loginLabel = "Login",
  showName = true,
  showSocial = false,
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const resolvedName = showName
      ? name
      : email.split("@")[0] || "Pet Owner";

    try {
      const data = await register({
        email,
        name: resolvedName,
        phone,
        password,
        role,
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

      {showName ? (
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
      ) : null}

      <label className="flex flex-col gap-2">
        <span className="text-body-3 font-bold text-black">Password</span>
        <input
          className="input"
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Create your password"
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>

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
          autoComplete="tel"
          placeholder="Your phone number"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          required
        />
      </label>

      {error ? <p className="text-center text-body-3 text-red">{error}</p> : null}

      <button className="btn btn-primary w-full" type="submit" disabled={loading}>
        {loading ? "Registering..." : "Register"}
      </button>

      {showSocial ? <SocialAuthButtons /> : null}

      <p className="text-center text-body-3 text-gray-500">
        {loginPrompt}{" "}
        <Link href={loginHref} className="font-bold text-primary">
          {loginLabel}
        </Link>
      </p>
    </form>
  );
}
