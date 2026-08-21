"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Icon from "./Icon";
import PetSitterCard from "./PetSitterCard";
import { getSitters } from "@/lib/api";

const PET_OPTIONS = [
    { id: "dog", label: "Dog" },
    { id: "cat", label: "Cat" },
    { id: "bird", label: "Bird" },
    { id: "rabbit", label: "Rabbit" },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1];
const PAGE_SIZE = 5;

function parsePetTypes(value) {
    return String(value ?? "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => PET_OPTIONS.some((pet) => pet.id === item));
}

function experienceToForm(value) {
    if (!value) return "";
    if (["0-2 Years", "3-5 Years", "5+ Years"].includes(value)) return value;
    if (["0-2", "3-5", "5+"].includes(value)) return `${value} Years`;
    return "";
}

function experienceToQuery(value) {
    if (!value) return "";
    return String(value).replace(/\s*Years$/i, "").trim();
}

function getPageNumbers(current, total) {
    if (total <= 0) return [];
    if (total <= 5) {
        return Array.from({ length: total }, (_, index) => index + 1);
    }

    const start = Math.max(1, Math.min(current - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function RatingStars({ count }) {
    return (
        <div className="flex items-center gap-0.5 text-green">
            {Array.from({ length: count }).map((_, i) => (
                <Icon key={i} src="/icon/star.svg" className="h-[18px] w-[18px]" />
            ))}
        </div>
    );
}

export default function PetSitterList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState("");
    const [selectedPets, setSelectedPets] = useState([]);
    const [selectedRating, setSelectedRating] = useState(null);
    const [experience, setExperience] = useState("");
    const [viewMode, setViewMode] = useState("list");
    const [currentPage, setCurrentPage] = useState(1);
    const [sitters, setSitters] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const syncFormFromUrl = useCallback(() => {
        const rating = Number.parseInt(searchParams.get("rating") ?? "", 10);
        const page = Number.parseInt(searchParams.get("page") ?? "1", 10);

        setQuery(searchParams.get("q") ?? "");
        setSelectedPets(parsePetTypes(searchParams.get("petTypes")));
        setSelectedRating(rating >= 1 && rating <= 5 ? rating : null);
        setExperience(experienceToForm(searchParams.get("experience") ?? ""));
        setCurrentPage(Number.isInteger(page) && page > 0 ? page : 1);
    }, [searchParams]);

    const fetchSitters = useCallback(async () => {
        const rating = Number.parseInt(searchParams.get("rating") ?? "", 10);
        const page = Number.parseInt(searchParams.get("page") ?? "1", 10);

        setLoading(true);
        setError("");

        try {
            const result = await getSitters({
                q: searchParams.get("q") ?? "",
                petTypes: parsePetTypes(searchParams.get("petTypes")),
                rating: rating >= 1 && rating <= 5 ? rating : null,
                experience: searchParams.get("experience") ?? "",
                page: Number.isInteger(page) && page > 0 ? page : 1,
                limit: PAGE_SIZE,
            });
            setSitters(result.data);
            setTotalPages(result.pagination.totalPages);
        } catch (err) {
            setSitters([]);
            setTotalPages(0);
            setError(err instanceof Error ? err.message : "Failed to load pet sitters");
        } finally {
            setLoading(false);
        }
    }, [searchParams]);

    useEffect(() => {
        syncFormFromUrl();
        fetchSitters();
    }, [syncFormFromUrl, fetchSitters]);

    const updateUrl = (next) => {
        const params = new URLSearchParams();
        if (next.q) params.set("q", next.q);
        if (next.petTypes.length) params.set("petTypes", next.petTypes.join(","));
        if (next.rating) params.set("rating", String(next.rating));
        if (next.experience) params.set("experience", experienceToQuery(next.experience));
        if (next.page > 1) params.set("page", String(next.page));

        const queryString = params.toString();
        router.push(queryString ? `/find-sitter?${queryString}` : "/find-sitter");
    };

    const togglePet = (petId) => {
        setSelectedPets((prev) =>
            prev.includes(petId) ? prev.filter((p) => p !== petId) : [...prev, petId]
        );
    };

    const handleClear = () => {
        setQuery("");
        setSelectedPets([]);
        setSelectedRating(null);
        setExperience("");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateUrl({
            q: query.trim(),
            petTypes: selectedPets,
            rating: selectedRating,
            experience,
            page: 1,
        });
    };

    const goToPage = (page) => {
        const nextPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
        const params = new URLSearchParams(searchParams.toString());
        if (nextPage > 1) {
            params.set("page", String(nextPage));
        } else {
            params.delete("page");
        }
        const queryString = params.toString();
        router.push(queryString ? `/find-sitter?${queryString}` : "/find-sitter");
    };

    const pageNumbers = getPageNumbers(currentPage, totalPages);

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
                        <div className="flex flex-col">
                            <h2 className="text-[15px] font-bold text-gray-900">Search:</h2>
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
                                    className={`input appearance-none cursor-pointer pr-10 ${
                                        experience ? "text-black" : "text-gray-400"
                                    }`}
                                >
                                    <option value="">
                                        Select experience
                                    </option>
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
                        {loading ? (
                            <p className="rounded-xl bg-white p-6 text-body-2 text-gray-400">
                                Loading pet sitters...
                            </p>
                        ) : error ? (
                            <p className="rounded-xl bg-white p-6 text-body-2 text-red">
                                {error}
                            </p>
                        ) : sitters.length === 0 ? (
                            <p className="rounded-xl bg-white p-6 text-body-2 text-gray-400">
                                No pet sitters found
                            </p>
                        ) : (
                            sitters.map((sitter) => (
                                <PetSitterCard key={sitter.id} {...sitter} />
                            ))
                        )}
                    </div>
                </section>
                {pageNumbers.length > 1 && (
                    <nav className="col-span-full mt-8 flex items-center justify-center gap-1" aria-label="Pagination">
                        <button
                            type="button"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage <= 1}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Previous page"
                        >
                            <Icon src="/icon/chevron-left.svg" className="h-5 w-5" />
                        </button>
                        {pageNumbers.map((page) => (
                            <button
                                key={page}
                                type="button"
                                onClick={() => goToPage(page)}
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
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage >= totalPages}
                            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Next page"
                        >
                            <Icon src="/icon/chevron-right.svg" className="h-5 w-5" />
                        </button>
                    </nav>
                )}
                </div>
            </div>
        </div>
    );
}
