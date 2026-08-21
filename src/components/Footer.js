import Link from "next/link";
import Image from "next/image";

export default function Footer() {
    return (
        <footer className="w-full bg-black py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
                {/* Logo */}
                <Link href="/" className="inline-block">
                    <Image
                        src="/image/logo-footer.png"
                        alt="Sitter"
                        width={120}
                        height={40}
                        className="h-8 sm:h-10 w-auto"
                    />
                </Link>

                {/* Tagline */}
                <p className="mt-4 text-sm sm:text-base text-gray-400 font-medium">
                    Find your perfect pet sitter with us.
                </p>
            </div>
        </footer>
    );
}

