"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import Icon from "./Icon";
import Pagination from "./Pagination";
import PetSitterCard from "./PetSitterCard";
import SitterCardOverlay from "./find-sitter/SitterCardOverlay";
import { getSitters } from "@/lib/api";
import { getSitterCoords } from "@/lib/sitterLocation";

const Map = dynamic(() => import("@/components/Map"), {
    ssr: false,
    loading: () => (
        <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-2xl flex items-center justify-center text-gray-400 font-medium">
            กำลังโหลดแผนที่...
        </div>
    ),
});

const PET_OPTIONS = [
    { id: "dog", label: "Dog" },
    { id: "cat", label: "Cat" },
    { id: "bird", label: "Bird" },
    { id: "rabbit", label: "Rabbit" },
];

const RATING_OPTIONS = [5, 4, 3, 2, 1];
const PAGE_SIZE = 5;
const MAP_LIMIT = 1000;

function parsePetTypes(value) {
    return String(value ?? "")
        .split(",")
        .map((item) => item.trim().toLowerCase())
        .filter((item) => PET_OPTIONS.some((pet) => pet.id === item));
}

function parseRatings(value) {
    return [...new Set(
        String(value ?? "")
            .split(",")
            .map((item) => Number.parseInt(item.trim(), 10))
            .filter((item) => item >= 1 && item <= 5),
    )].sort((a, b) => b - a);
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
    const [selectedRatings, setSelectedRatings] = useState([]);
    const [experience, setExperience] = useState("");
    const [viewMode, setViewMode] = useState("list");
    const [currentPage, setCurrentPage] = useState(1);
    const [sitters, setSitters] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedSitterId, setSelectedSitterId] = useState(null);
    const [mapCenter, setMapCenter] = useState([13.7563, 100.5018]);
    const [mapZoom, setMapZoom] = useState(13);

    const syncFormFromUrl = useCallback(() => {
        const page = Number.parseInt(searchParams.get("page") ?? "1", 10);

        setQuery(searchParams.get("q") ?? "");
        setSelectedPets(parsePetTypes(searchParams.get("petTypes")));
        setSelectedRatings(parseRatings(searchParams.get("rating")));
        setExperience(experienceToForm(searchParams.get("experience") ?? ""));
        setCurrentPage(Number.isInteger(page) && page > 0 ? page : 1);
    }, [searchParams]);

    const fetchSitters = useCallback(async () => {
        const page = Number.parseInt(searchParams.get("page") ?? "1", 10);
        const isMap = viewMode === "map";

        setLoading(true);
        setError("");

        try {
            const result = await getSitters({
                q: searchParams.get("q") ?? "",
                petTypes: parsePetTypes(searchParams.get("petTypes")),
                rating: parseRatings(searchParams.get("rating")),
                experience: searchParams.get("experience") ?? "",
                page: isMap ? 1 : Number.isInteger(page) && page > 0 ? page : 1,
                limit: isMap ? MAP_LIMIT : PAGE_SIZE,
            });
            const data = result.data || [];
            setSitters(data);
            setTotalPages(isMap ? 0 : result.pagination?.totalPages || 0);
            if (data.length > 0) {
                setSelectedSitterId(data[0].id);
                setMapCenter(getSitterCoords(data[0]));
            }
        } catch (err) {
            setSitters([]);
            setTotalPages(0);
            setError(err instanceof Error ? err.message : "Failed to load pet sitters");
        } finally {
            setLoading(false);
        }
    }, [searchParams, viewMode]);

    const handleSelectSitter = (sitter) => {
        if (!sitter) return;
        setSelectedSitterId(sitter.id);
        setMapCenter(getSitterCoords(sitter));
        setMapZoom(15);
    };

    useEffect(() => {
        syncFormFromUrl();
        fetchSitters();
    }, [syncFormFromUrl, fetchSitters]);

    const updateUrl = (next) => {
        const params = new URLSearchParams();
        if (next.q) params.set("q", next.q);
        if (next.petTypes.length) params.set("petTypes", next.petTypes.join(","));
        if (next.ratings.length) params.set("rating", next.ratings.join(","));
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

    const toggleRating = (rating) => {
        setSelectedRatings((prev) =>
            prev.includes(rating)
                ? prev.filter((value) => value !== rating)
                : [...prev, rating],
        );
    };

    const handleClear = () => {
        setQuery("");
        setSelectedPets([]);
        setSelectedRatings([]);
        setExperience("");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        updateUrl({
            q: query.trim(),
            petTypes: selectedPets,
            ratings: selectedRatings,
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

    return (
        <div className="min-h-full bg-[#FAFAFB] px-4 py-8 sm:px-8">
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
                                    const isSelected = selectedRatings.includes(rating);
                                    return (
                                        <button
                                            key={rating}
                                            type="button"
                                            aria-pressed={isSelected}
                                            onClick={() => toggleRating(rating)}
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
                    ) : viewMode === "map" ? (
                        <div className="relative h-[650px] w-full rounded-2xl overflow-hidden shadow-[var(--shadow-card)] border border-gray-200">
                            <Map
                                center={mapCenter}
                                zoom={mapZoom}
                                markers={sitters.map((sitter) => {
                                    const coords = getSitterCoords(sitter);
                                    return {
                                        id: sitter.id,
                                        position: coords,
                                        popup: sitter.trade_name || sitter.title || sitter.name || "Pet Sitter",
                                        sitterData: sitter,
                                    };
                                })}
                                selectedId={selectedSitterId}
                                onMarkerClick={(marker) => {
                                    const targetSitter = sitters.find(s => s.id === marker.id) || marker.sitterData;
                                    if (targetSitter) {
                                        handleSelectSitter(targetSitter);
                                    }
                                }}
                                className="h-full w-full z-0"
                            />
                            <SitterCardOverlay
                                sitters={sitters}
                                selectedId={selectedSitterId}
                                onSelect={(sitter) => {
                                    handleSelectSitter(sitter);
                                }}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {sitters.map((sitter) => (
                                <Link
                                    key={sitter.id}
                                    href={`/find-sitter/${sitter.id}`}
                                    className="block rounded-xl transition-shadow hover:shadow-[var(--shadow-card)]"
                                >
                                    <PetSitterCard {...sitter} />
                                </Link>
                            ))}
                        </div>
                    )}
                </section>
                {viewMode === "list" && totalPages > 1 && (
                    <div className="col-span-full mt-8">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={goToPage}
                        />
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
