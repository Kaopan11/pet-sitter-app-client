'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar() {
    const router = useRouter();
    const [selectedPets, setSelectedPets] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [experience, setExperience] = useState("0-2 Years");

    const petOptions = [
        { id: "dog", label: "Dog" },
        { id: "cat", label: "Cat" },
        { id: "bird", label: "Bird" },
        { id: "rabbit", label: "Rabbit" },
    ];

    const ratingOptions = [5, 4, 3, 2, 1];

    const togglePet = (petId) => {
        if (selectedPets.includes(petId)) {
            setSelectedPets(selectedPets.filter((p) => p !== petId));
        } else {
            setSelectedPets([...selectedPets, petId]);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (selectedPets.length) params.set("petTypes", selectedPets.join(","));
        if (selectedRating) params.set("rating", String(selectedRating));
        if (experience) {
            params.set("experience", experience.replace(/\s*Years$/i, ""));
        }
        const query = params.toString();
        router.push(query ? `/find-sitter?${query}` : "/find-sitter");
    };

    return (
        <div className="w-full max-w-[68.75rem] mx-auto rounded-[1.25rem] overflow-hidden shadow-sm flex flex-col bg-white">
            <form onSubmit={handleSearch} className="flex flex-col">
                {/* Top Row: Pet Type Filter */}
                <div className="bg-[#F8F9FB] px-5 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row items-start lg:items-center gap-3 lg:gap-6">
                    <span className="text-[15px] font-bold text-gray-800">
                        Pet Type:
                    </span>
                    <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                        {petOptions.map((pet) => {
                            const isChecked = selectedPets.includes(pet.id);
                            return (
                                <label
                                    key={pet.id}
                                    className="flex items-center gap-2.5 cursor-pointer select-none group"
                                >
                                    {/* Custom Checkbox */}
                                    <div className="relative flex items-center justify-center">
                                        <input
                                            type="checkbox"
                                            className="peer sr-only"
                                            checked={isChecked}
                                            onChange={() => togglePet(pet.id)}
                                        />
                                        <div className="w-5 h-5 bg-white border border-gray-200 rounded-[4px] peer-checked:border-[#FF7037] peer-checked:bg-[#FF7037] transition-all"></div>
                                        {isChecked && (
                                            <svg
                                                className="absolute w-3.5 h-3.5 text-white pointer-events-none"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="3"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                        )}
                                    </div>
                                    <span className="text-[15px] font-medium text-gray-600 group-hover:text-gray-800 transition-colors">
                                        {pet.label}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Row: Rating, Experience, and Search Button */}
                <div className="bg-white px-5 sm:px-6 lg:px-8 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-6 lg:gap-4 xl:gap-6">
                    {/* Rating */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full lg:w-auto">
                        <span className="text-[15px] font-bold text-gray-800 whitespace-nowrap">
                            Rating:
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap w-full pb-1 sm:pb-0 scrollbar-hide">
                            {ratingOptions.map((rating) => {
                                const isSelected = selectedRating === rating;
                                return (
                                    <button
                                        key={rating}
                                        type="button"
                                        onClick={() =>
                                            setSelectedRating(isSelected ? null : rating)
                                        }
                                        className={`group flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 transition-all ${isSelected
                                            ? "border-[#FF7037] bg-white hover:bg-[#FFF1EC]"
                                            : "border-gray-200 bg-white hover:border-[#FF7037] hover:bg-[#FFF1EC]"
                                            }`}
                                    >
                                        <span className={`text-[14px] font-medium transition-colors ${isSelected ? "text-[#FF7037]" : "text-gray-500 group-hover:text-[#FF7037]"}`}>
                                            {rating}
                                        </span>
                                        <div className="flex items-center gap-[2px]">
                                            {Array.from({ length: rating }).map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className="w-[18px] h-[18px] text-[#1CCD83] fill-current"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                                </svg>
                                            ))}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center gap-2 lg:gap-3 w-full lg:w-auto">
                        <span className="text-[15px] font-bold text-gray-800 whitespace-nowrap">
                            Experience:
                        </span>
                        <div className="relative w-full lg:w-auto">
                            <select
                                value={experience}
                                onChange={(e) => setExperience(e.target.value)}
                                className="appearance-none bg-white border border-gray-200 rounded-lg pl-4 pr-10 py-2 text-[14px] text-gray-500 font-medium focus:outline-none focus:border-gray-300 cursor-pointer w-full lg:min-w-[120px]"
                            >
                                <option value="0-2 Years">0-2 Years</option>
                                <option value="3-5 Years">3-5 Years</option>
                                <option value="5+ Years">5+ Years</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        type="submit"
                        className="w-full lg:w-auto flex-shrink-0 cursor-pointer rounded-full bg-[#FF7037] px-12 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#FF986F] active:bg-[#E44A0C]"
                    >
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
}
