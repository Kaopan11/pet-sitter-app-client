"use client";

// ช่องรหัสผ่าน + ปุ่มตา โชว์/ซ่อน — ใช้ใน LoginForm / RegisterForm
import { useState } from "react";

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.1 12S5.5 5.5 12 5.5 21.9 12 21.9 12 18.5 18.5 12 18.5 2.1 12 2.1 12Z"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 3l18 18"
      />
      <path
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 10.7a3.2 3.2 0 0 0 4.8 4.2M9.4 5.8A10 10 0 0 1 12 5.5c6.5 0 9.9 6.5 9.9 6.5a18 18 0 0 1-4.2 4.5M6.6 6.6C4.4 8.1 2.8 10.4 2.1 12S5.5 18.5 12 18.5c1.3 0 2.5-.2 3.6-.6"
      />
    </svg>
  );
}

export default function PasswordInput({
  id = "password",
  name = "password",
  autoComplete,
  placeholder,
  value,
  onChange,
  minLength,
  required,
  error,
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        className={`input pr-12 ${error ? "input-error" : ""}`}
        type={visible ? "text" : "password"}
        name={name}
        autoComplete={autoComplete}
        placeholder={placeholder}
        minLength={minLength}
        value={value}
        onChange={onChange}
        required={required}
      />
      <button
        type="button"
        className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
