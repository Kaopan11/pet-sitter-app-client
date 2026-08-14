import Link from "next/link";

export default function CTASection() {
    return (
        <section className="relative w-full overflow-hidden bg-orange-100 py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8">
            {/* === Decorative Shapes === */}

            {/* Yellow circle — top right */}
            <div
                className="absolute -top-16 -right-16 sm:-top-20 sm:-right-20 w-40 h-40 sm:w-56 sm:h-56 lg:w-72 lg:h-72 rounded-full bg-[#FFCA62] pointer-events-none"
                aria-hidden="true"
            />

            {/* Green starburst — top center */}
            <svg
                className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-20 sm:w-28 sm:h-28 lg:w-32 lg:h-32 pointer-events-none"
                viewBox="0 0 120 120"
                fill="#1CCD83"
                aria-hidden="true"
            >
                <polygon points="60,0 72,38 110,28 82,55 110,82 72,72 60,110 48,72 10,82 38,55 10,28 48,38" />
            </svg>

            {/* Blue circle — bottom left */}
            <div
                className="absolute -bottom-24 -left-24 sm:-bottom-32 sm:-left-32 lg:-bottom-40 lg:-left-40 w-56 h-56 sm:w-72 sm:h-72 lg:w-96 lg:h-96 rounded-full border-[16px] sm:border-[20px] lg:border-[24px] border-[#76D0FC] bg-transparent pointer-events-none"
                aria-hidden="true"
            />

            {/* Orange half-circle — bottom left (overlapping with blue ring) */}
            <div
                className="absolute -bottom-10 -left-6 sm:-bottom-14 sm:-left-8 w-28 h-14 sm:w-36 sm:h-18 lg:w-44 lg:h-22 rounded-t-full bg-[#FF7037] pointer-events-none"
                aria-hidden="true"
            />

            {/* === Content === */}
            <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
                {/* Heading */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-black leading-tight tracking-tight">
                    Perfect Pet Sitter
                    <br />
                    For Your Pet
                </h2>

                {/* Become a Sitter Link */}
                <Link
                    href="/become-sitter"
                    className="mt-10 sm:mt-12 text-base sm:text-lg font-bold text-[#FF7037] hover:text-[#E44A0C] transition-colors underline-offset-4 hover:underline"
                >
                    Become A Pet Sitter
                </Link>

                {/* Find a Sitter Button */}
                <Link
                    href="/find-sitter"
                    className="mt-5 sm:mt-6 inline-flex items-center justify-center w-full max-w-sm sm:max-w-md rounded-full bg-[#FF7037] px-10 py-4 text-base sm:text-lg font-bold text-white shadow-md transition-all hover:bg-[#E44A0C] hover:shadow-lg active:scale-[0.98]"
                >
                    Find A Pet Sitter
                </Link>
            </div>
        </section>
    );
}
