"use client";

import { useState } from "react";
import Icon from "./Icon";
import PetSitterCard from "./PetSitterCard";

const PET_OPTIONS = [
    { id: "dog", label: "Dog" },
    { id: "cat", label: "Cat" },
    { id: "bird", label: "Bird" },
    { id: "rabbit", label: "Rabbit" },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1];
const PAGE_NUMBERS = [1, 2, 3, 4];

const SAMPLE_SITTERS = [
    {
        id: 1,
        title: "Happy House!",
        sitterName: "Jane Maison",
        avatarUrl: "/navbar/profile.png",
        location: "Senanikom, Bangkok",
        rating: 5,
        petTypes: ["Dog", "Cat", "Bird", "Rabbit"],
        imageUrl: "/image/section-dog.png",
    },
    {
        id: 2,
        title: "Happy House!",
        sitterName: "John Malee",
        avatarUrl: "/navbar/profile.png",
        location: "Senanikom, Bangkok",
        rating: 4,
        petTypes: ["Dog", "Cat", "Bird"],
        imageUrl: "/image/section-cat.png",
    },
    {
        id: 3,
        title: "Happy House!",
        location: "Senanikom, Bangkok",
        rating: 3,
        petTypes: ["Cat", "Bird"],
        imageUrl: "/image/middle-section.png",
    },
    {
        id: 4,
        title: "Happy House!",
        location: "Senanikom, Bangkok",
        rating: 2,
        petTypes: ["Cat", "Bird"],
        imageUrl: "/image/section-dog.png",
    },
];

function RatingStars({ count }) {
    return (
        <div className="flex items-center gap-0.5 text-green">
            {Array.from({ length: count }).map((_, i) => (
                <Icon key={i} src="/icon/star.svg" className="h-[18px] w-[18px]" />
            ))}
        </div>
    );
}

export default function PetSitterList({ sitters = SAMPLE_SITTERS }) {
    const [query, setQuery] = useState("");
    const [selectedPets, setSelectedPets] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [experience, setExperience] = useState("0-2 Years");
    const [viewMode, setViewMode] = useState("list");
    const [currentPage, setCurrentPage] = useState(1);

    const togglePet = (petId) => {
        setSelectedPets((prev) =>
            prev.includes(petId) ? prev.filter((p) => p !== petId) : [...prev, petId]
        );
    };

    const handleClear = () => {
        setQuery("");
        setSelectedPets([]);
        setSelectedRating(null);
        setExperience("0-2 Years");
    };

    const handleSearch = (e) => {
        e.preventDefault();
    };

    return (
        <div className="min-h-full bg-gray-100 px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-h3 font-bold text-gray-900">
                        Search For Pet Sitter
                    </h1>
                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-4 py-2 text-body-2 font-medium transition-colors ${
                                viewMode === "list"
                                    ? "border-orange-500 text-orange-500 hover:bg-orange-100"
                                    : "border-gray-200 text-gray-300 hover:border-gray-300 hover:text-gray-400"
                            }`}
                        >
                            <Icon src="/icon/list.svg" className="h-5 w-5" />
                            List
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("map")}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-4 py-2 text-body-2 font-medium transition-colors ${
                                viewMode === "map"
                                    ? "border-orange-500 text-orange-500 hover:bg-orange-100"
                                    : "border-gray-200 text-gray-300 hover:border-gray-300 hover:text-gray-400"
                            }`}
                        >
                            <Icon src="/icon/map.svg" className="h-5 w-5" />
                            Map
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[24rem_1fr] lg:items-start">
                <aside className="lg:sticky lg:top-6 lg:self-start">
                    <form onSubmit={handleSearch} className="flex flex-col gap-6 rounded-xl bg-white p-6 shadow-[var(--shadow-card)]">
                        <div className="flex flex-col gap-3">
                            <h2 className="text-h4 text-gray-900">Search</h2>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="input pr-11"
                                    aria-label="Search pet sitters"
                                />
                                <Icon
                                    src="/icon/search.svg"
                                    className="pointer-events-none absolute top-1/2 right-3 h-5 w-5 -translate-y-1/2 text-gray-400"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-[15px] font-bold text-gray-900">Pet Type:</span>
                            <div className="flex flex-nowrap items-center gap-8">
                                {PET_OPTIONS.map((pet) => {
                                    const isChecked = selectedPets.includes(pet.id);
                                    return (
                                        <label
                                            key={pet.id}
                                            className="group flex shrink-0 cursor-pointer items-center gap-2 select-none"
                                        >
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={isChecked}
                                                    onChange={() => togglePet(pet.id)}
                                                />
                                                <div className="h-5 w-5 rounded-[4px] border border-gray-200 bg-white transition-all peer-checked:border-orange-500 peer-checked:bg-orange-500" />
                                                {isChecked && (
                                                    <Icon
                                                        src="/icon/check.svg"
                                                        className="pointer-events-none absolute h-3.5 w-3.5 text-white"
                                                    />
                                                )}
                                            </div>
                                            <span className="text-[15px] font-medium text-gray-500 transition-colors group-hover:text-gray-900">
                                                {pet.label}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-[15px] font-bold text-gray-900">Rating:</span>
                            <div className="flex flex-wrap gap-2">
                                {RATING_OPTIONS.map((rating) => {
                                    const isSelected = selectedRating === rating;
                                    return (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() =>
                                                setSelectedRating(isSelected ? null : rating)
                                            }
                                            className={`group flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 transition-all ${
                                                isSelected
                                                    ? "border-orange-500 bg-white hover:bg-orange-100"
                                                    : "border-gray-200 bg-white hover:border-orange-500 hover:bg-orange-100"
                                            }`}
                                        >
                                            <span
                                                className={`text-[14px] font-medium transition-colors ${
                                                    isSelected
                                                        ? "text-orange-500"
                                                        : "text-gray-500 group-hover:text-orange-500"
                                                }`}
                                            >
                                                {rating}
                                            </span>
                                            <RatingStars count={rating} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <span className="text-[15px] font-bold text-gray-900">
                                Experience:
                            </span>
                            <div className="relative">
                                <select
                                    value={experience}
                                    onChange={(e) => setExperience(e.target.value)}
                                    className="input appearance-none cursor-pointer pr-10"
                                >
                                    <option value="0-2 Years">0-2 Years</option>
                                    <option value="3-5 Years">3-5 Years</option>
                                    <option value="5+ Years">5+ Years</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                    <Icon src="/icon/chevron-down.svg" className="h-4 w-4" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button type="button" onClick={handleClear} className="btn btn-secondary flex-1">
                                Clear
                            </button>
                            <button type="submit" className="btn btn-primary flex-1">
                                Search
                            </button>
                        </div>
                    </form>
                </aside>

                <section className="flex min-w-0 flex-col">
                    <div className="flex flex-col gap-4">
                        {sitters.map((sitter) => (
                            <PetSitterCard key={sitter.id} {...sitter} />
                        ))}
                    </div>

                    <nav className="mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-orange-500"
                            aria-label="Previous page"
                        >
                            <Icon src="/icon/chevron-left.svg" className="h-5 w-5" />
                        </button>
                        {PAGE_NUMBERS.map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-body-2 font-bold transition-colors ${
                                    currentPage === page
                                        ? "bg-orange-100 text-orange-500"
                                        : "text-gray-400 hover:text-orange-500"
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() => setCurrentPage((page) => Math.min(PAGE_NUMBERS.length, page + 1))}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-orange-500"
                            aria-label="Next page"
                        >
                            <Icon src="/icon/chevron-right.svg" className="h-5 w-5" />
                        </button>
                    </nav>
                </section>
                </div>
            </div>
        </div>
    );
}
