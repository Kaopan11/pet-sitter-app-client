"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { getToken, getUser } from "@/lib/auth";

export default function CTASection() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // เช็คสถานะ login จาก token/user ที่เก็บไว้ ใช้ซ่อนปุ่ม "Register (Become a Sitter)" เมื่อ login แล้ว
        function syncLoginState() {
            setIsLoggedIn(Boolean(getToken() && getUser()));
        }

        syncLoginState();
        // ฟัง custom event "auth-changed" เพื่ออัปเดตปุ่มทันทีที่ login/logout โดยไม่ต้อง reload หน้า
        window.addEventListener("auth-changed", syncLoginState);
        return () => window.removeEventListener("auth-changed", syncLoginState);
    }, []);

    return (
        <section className="relative w-full overflow-hidden bg-[#FFF1E5] py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8">
            {/* === รูปทรงตกแต่งพื้นหลัง === */}

            {/* วงกลมสีเหลือง — มุมขวาบน */}
            <div
                className="absolute -top-10 -right-10 sm:-top-14 sm:-right-14 lg:-top-16 lg:-right-16 w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56 pointer-events-none"
                aria-hidden="true"
            >
                <Image
                    src="/image/dot-yellow.svg"
                    alt=""
                    fill
                    className="object-contain"
                />
            </div>

            {/* ดาวสีเขียว — ซ้อนทับกับวงกลมสีเหลือง บริเวณมุมขวาบน */}
            <div
                className="absolute top-8 right-12 sm:top-10 sm:right-16 lg:top-12 lg:right-20 w-20 h-20 sm:w-28 sm:h-28 lg:w-36 lg:h-36 pointer-events-none"
                aria-hidden="true"
            >
                <Image
                    src="/image/star-green.svg"
                    alt=""
                    fill
                    className="object-contain"
                />
            </div>

            {/* ส่วนโค้งสีฟ้า — มุมซ้ายล่าง */}
            <div
                className="absolute -bottom-4 -left-8 sm:-bottom-4 sm:-left-10 lg:-bottom-4 lg:-left-12 w-40 h-28 sm:w-52 sm:h-36 lg:w-64 lg:h-40 pointer-events-none"
                aria-hidden="true"
            >
                <Image
                    src="/image/arc-blue.svg"
                    alt=""
                    fill
                    className="object-contain object-bottom"
                />
            </div>

            {/* === เนื้อหา === */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                {/* หัวข้อ */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight">
                    Perfect Pet Sitter
                    <br />
                    For Your Pet
                </h2>

                {/* ปุ่ม CTA */}
                <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6 items-center justify-center">
                    {/* ปุ่มสมัครเป็น Pet Sitter — ซ่อนเมื่อ login แล้ว */}
                    {!isLoggedIn && (
                        <Link
                            href="/register?type=sitter"
                            className="inline-flex items-center justify-center rounded-full bg-[#FFF1EC] px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-bold text-[#FF7037] transition-all active:scale-[0.98]"
                        >
                            Register
                        </Link>
                    )}

                    {/* ปุ่มค้นหา Pet Sitter */}
                    <Link
                        href="/find-sitter"
                        className="inline-flex items-center justify-center rounded-full bg-[#FF7037] px-8 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-md transition-all hover:bg-[#E44A0C] hover:shadow-lg active:scale-[0.98]"
                    >
                        Find A Pet Sitter
                    </Link>
                </div>
            </div>
        </section>
    );
}
