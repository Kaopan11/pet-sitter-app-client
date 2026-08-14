import Image from "next/image";
import SearchBar from "./SearchBar";

export default function HeroSection() {
    return (
        <section className="relative w-full bg-white pt-6 sm:pt-10 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
            {/* Top Banner Content (Cats - Title - Dog) */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-4 relative">
                {/* Left Side: Cat Illustration */}
                <div className="lg:col-span-3 flex justify-center lg:justify-start order-2 lg:order-1">
                    <div className="relative w-[240px] sm:w-[280px] lg:w-full max-w-[320px]">
                        <Image
                            src="/image/section-cat.png"
                            alt="Cats Illustration"
                            width={340}
                            height={360}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Center: Main Title & Subtitle */}
                <div className="lg:col-span-6 text-center order-1 lg:order-2 px-2">
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#000000] tracking-tight leading-[1.15]">
                        Pet Sitter<span className="text-[#FF7037]">,</span>
                        <br />
                        Perfect<span className="text-[#76D0FC]">,</span>
                        <br />
                        For Your Pet<span className="text-[#FFCA62]">.</span>
                    </h1>
                    <p className="mt-5 text-base sm:text-lg text-gray-500 font-medium max-w-md mx-auto">
                        Find your perfect pet sitter with us.
                    </p>
                </div>

                {/* Right Side: Dog Illustration */}
                <div className="lg:col-span-3 flex justify-center lg:justify-end order-3">
                    <div className="relative w-[240px] sm:w-[280px] lg:w-full max-w-[320px]">
                        <Image
                            src="/image/section-dog.png"
                            alt="Dog Illustration"
                            width={340}
                            height={360}
                            className="w-full h-auto object-contain"
                            priority
                        />
                    </div>
                </div>
            </div>

            {/* Search Bar Section */}
            <div className="mt-12 sm:mt-16">
                <SearchBar />
            </div>
        </section>
    );
}
