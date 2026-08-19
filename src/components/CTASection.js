import Link from "next/link";
import Image from "next/image";

export default function CTASection() {
    return (
        <section className="relative w-full overflow-hidden bg-[#FFF1E5] py-20 sm:py-28 lg:py-32 px-4 sm:px-6 lg:px-8">
            {/* === Decorative Shapes === */}

            {/* Yellow circle — top right */}
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

            {/* Green starburst — overlapping yellow circle, top right area */}
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

            {/* Blue arc — bottom left */}
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
                    href="/register?type=sitter"
                    className="mt-10 sm:mt-12 text-base sm:text-lg font-bold text-[#FF7037] hover:text-[#E44A0C] transition-colors underline-offset-4 hover:underline"
                >
                    Become A Pet Sitter
                </Link>

                    {/* Find a Sitter Button */}
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
