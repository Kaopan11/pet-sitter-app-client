import { Suspense } from "react";
import PetSitterList from "@/components/PetSitterList";

export const metadata = {
    title: "Search For Pet Sitter",
};

function FindSitterFallback() {
    return (
        <div className="min-h-full bg-[#FAFAFB] px-4 py-8 sm:px-8">
            <div className="mx-auto max-w-7xl">
                <h1 className="text-h3 font-bold text-gray-900">Search For Pet Sitter</h1>
                <p className="mt-6 text-body-2 text-gray-400">Loading pet sitters...</p>
            </div>
        </div>
    );
}

export default function FindSitterPage() {
    return (
        <Suspense fallback={<FindSitterFallback />}>
            <PetSitterList />
        </Suspense>
    );
}
