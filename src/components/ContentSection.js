import Image from "next/image";

// Reusable 8-point Starburst Badge Icon matching the Figma design
function StarburstIcon({ color, className = "w-4 h-4 sm:w-5 sm:h-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={color}
      className={`${className} flex-shrink-0`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon points="12,1 15.06,4.61 19.78,4.22 19.39,8.94 23,12 19.39,15.06 19.78,19.78 15.06,19.39 12,23 8.94,19.39 4.22,19.78 4.61,15.06 1,12 4.61,8.94 4.22,4.22 8.94,4.61" />
    </svg>
  );
}

const services = [
  {
    title: "Boarding",
    description:
      "Your pets stay overnight in your sitter's home. They'll be treated like part of the family in a comfortable environment.",
    iconColor: "#76D0FC",
  },
  {
    title: "House Sitting",
    description:
      "Your sitter takes care of your pets and your home. Your pets will get all the attention they need without leaving home.",
    iconColor: "#FA8AC0",
  },
  {
    title: "Dog Walking",
    description:
      "Your dog gets a walk around your neighborhood. Perfect for busy days and dogs with extra energy to burn.",
    iconColor: "#1CCD83",
  },
  {
    title: "Drop-In Visits",
    description:
      "Your sitter drops by your home to play with your pets, offer food, and give potty breaks or clean the litter box.",
    iconColor: "#FFCA62",
  },
];

const features = [
  {
    image: "/image/content1.png",
    highlightText: "Connect",
    highlightColor: "text-[#1CCD83]",
    normalText: "With Sitters",
    description:
      "Find a verified and reviewed sitter who'll keep your pets company and give time.",
  },
  {
    image: "/image/content2.png",
    highlightText: "Better",
    highlightColor: "text-[#76D0FC]",
    normalText: "For Your Pets",
    description:
      "Pets stay happy at home with a sitter who gives them loving care and companionship.",
  },
  {
    image: "/image/content3.png",
    highlightText: "Calling",
    highlightColor: "text-[#FF7037]",
    normalText: "All Pets",
    description:
      "Stay for free with adorable animals in unique homes around the world.",
  },
];

export default function ContentSection() {
  return (
    <section className="w-full bg-white py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section Main Title */}
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 text-center tracking-tight leading-snug">
          &ldquo;Your Pets, Our Priority: Perfect Care, Anytime, Anywhere.&rdquo;
        </h2>

        {/* Upper Section: Services List (Left) + Pet Portrait (Right) */}
        <div className="mt-14 sm:mt-18 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Services list */}
          <div className="lg:col-span-7 flex flex-col space-y-8 sm:space-y-10 pl-0 sm:pl-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-start gap-3.5 group">
                <div className="mt-1">
                  <StarburstIcon color={service.iconColor} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-500 font-normal leading-relaxed max-w-lg">
                    {service.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Cat Portrait with Arch */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end items-center">
            <div className="relative w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[430px]">
              <Image
                src="/image/lovely-pet-portrait-isolated 1.png"
                alt="Lovely cat portrait"
                width={455}
                height={601}
                className="w-full h-auto object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>
        </div>

        {/* Lower Section: 3 Feature Cards with Circular Images */}
        <div className="mt-20 sm:mt-28 grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center group"
            >
              {/* Circular Image Container */}
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 lg:w-60 lg:h-60 rounded-full overflow-hidden shadow-sm transition-transform duration-300 group-hover:scale-105">
                <Image
                  src={feature.image}
                  alt={`${feature.highlightText} ${feature.normalText}`}
                  fill
                  sizes="(max-width: 768px) 192px, (max-width: 1024px) 208px, 240px"
                  className="object-cover"
                />
              </div>

              {/* Title with colored first word */}
              <h3 className="mt-6 text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                <span className={feature.highlightColor}>
                  {feature.highlightText}
                </span>{" "}
                <span>{feature.normalText}</span>
              </h3>

              {/* Description */}
              <p className="mt-3 text-sm sm:text-base text-gray-500 font-normal leading-relaxed max-w-[280px] sm:max-w-xs">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
