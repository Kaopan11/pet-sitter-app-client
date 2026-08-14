'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="relative border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
        <div className="flex-shrink-0">
          <Link href="/" className="inline-block">
            <Image
              src="/image/logo.png"
              alt="Pet Sitter Logo"
              width={140}
              height={48}
              className="h-9 w-auto sm:h-10"
              priority
            />
          </Link>
        </div>

        <div className="hidden items-center gap-6 md:flex lg:gap-8">
          <Link
            href="/become-sitter"
            className="text-[16px] font-medium text-gray-800 transition-colors hover:text-[#FF7037]"
          >
            Become a Pet Sitter
          </Link>
          <Link
            href="/login"
            className="text-[16px] font-medium text-gray-800 transition-colors hover:text-[#FF7037]"
          >
            Login
          </Link>
          <Link
            href="/find-sitter"
            className="inline-flex items-center justify-center rounded-full bg-[#FF7037] px-7 py-3 text-[16px] font-bold text-white shadow-sm transition-colors hover:bg-[#E44A0C]"
          >
            Find A Pet Sitter
          </Link>
        </div>

        <div className="flex items-center md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle navigation menu"
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 focus:outline-none"
          >
            {isOpen ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="animate-in slide-in-from-top-2 flex flex-col gap-4 border-t border-gray-100 bg-white px-6 py-5 shadow-lg duration-200 md:hidden">
          <Link
            href="/become-sitter"
            onClick={() => setIsOpen(false)}
            className="py-1 text-[16px] font-medium text-gray-800 transition-colors hover:text-[#FF7037]"
          >
            Become a Pet Sitter
          </Link>
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="py-1 text-[16px] font-medium text-gray-800 transition-colors hover:text-[#FF7037]"
          >
            Login
          </Link>
          <Link
            href="/find-sitter"
            onClick={() => setIsOpen(false)}
            className="mt-2 inline-flex w-full items-center justify-center rounded-full bg-[#FF7037] px-6 py-3 text-center text-[16px] font-bold text-white shadow-sm transition-colors hover:bg-[#E44A0C]"
          >
            Find A Pet Sitter
          </Link>
        </div>
      )}
    </nav>
  );
}
