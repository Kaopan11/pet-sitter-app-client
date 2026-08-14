import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-black py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Logo: Sitter★ */}
                <Link href="/" className="inline-flex items-baseline gap-0 group">
                    <span className="text-2xl sm:text-3xl font-black tracking-tight">
                        <span className="text-[#FF7037]">Sit</span>
                        <span className="text-white">ter</span>
                    </span>
                    {/* Green Star */}
                    <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 ml-0.5 -translate-y-1"
                        viewBox="0 0 24 24"
                        fill="#1CCD83"
                        aria-hidden="true"
                    >
                        <polygon points="12,1 15.06,4.61 19.78,4.22 19.39,8.94 23,12 19.39,15.06 19.78,19.78 15.06,19.39 12,23 8.94,19.39 4.22,19.78 4.61,15.06 1,12 4.61,8.94 4.22,4.22 8.94,4.61" />
                    </svg>
                </Link>

                {/* Tagline */}
                <p className="mt-4 text-sm sm:text-base text-gray-400 font-medium">
                    Find your perfect pet sitter with us.
                </p>
            </div>
        </footer>
    );
}
