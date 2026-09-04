"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, UserRound } from "lucide-react";
import LoadingState from "@/components/LoadingState";
import Pagination from "@/components/Pagination";
import { getAdminOwners } from "@/lib/api";

const STATUS = {
  Normal: { label: "Normal", text: "text-green", dot: "bg-green" },
  Banned: { label: "Banned", text: "text-red", dot: "bg-red" },
};

export default function AdminPetOwnerPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [owners, setOwners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadOwners(page, query = search) {
    setIsLoading(true);
    setError("");
    try {
      const result = await getAdminOwners({ search: query, page, limit: 8 });
      setOwners(result.rows);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
    } catch (err) {
      setOwners([]);
      setError(err.message || "Failed to load pet owners");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadOwners(1, search);
    }, search ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [search]);

  function goToPage(page) {
    const nextPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
    loadOwners(nextPage);
  }

  return (
    <section className="flex w-full min-w-0 flex-col gap-6">
      <header className="flex w-full items-center justify-between">
        <h1 className="text-h3 font-bold text-gray-900">Pet Owner</h1>

        <label className="relative block w-60">
          <input
            className="input pr-10"
            type="search"
            name="search"
            placeholder="Search..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Search
            className="pointer-events-none absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2 text-gray-300"
            aria-hidden="true"
          />
        </label>
      </header>

      {error ? <p className="text-body-2 text-red">{error}</p> : null}

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="w-full min-w-0 overflow-hidden rounded-2xl bg-white">
            <table className="w-full table-fixed border-collapse text-left">
              <caption className="sr-only">Admin pet owner list</caption>
              <thead className="bg-black text-white">
                <tr>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Pet Owner</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Phone</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Email</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Pet(s)</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {owners.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-body-2 text-gray-500">
                      {search.trim()
                        ? `No pet owners found matching "${search}"`
                        : "No pet owners found."}
                    </td>
                  </tr>
                ) : (
                  owners.map((owner) => {
                    const statusStyle = STATUS[owner.status] ?? STATUS.Normal;

                    return (
                      <tr
                        key={owner.id}
                        className="h-19 cursor-pointer border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
                        onClick={() => router.push(`/admin/pet-owner/${owner.id}`)}
                      >
                        <td className="px-6 py-5 text-body-2 text-black">
                          <span className="flex items-center gap-2">
                            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200">
                              {owner.avatar ? (
                                <Image
                                  src={owner.avatar}
                                  alt={`${owner.name || "Pet owner"} profile`}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <UserRound
                                  className="h-full w-full p-1.5 text-white"
                                  aria-hidden="true"
                                />
                              )}
                            </span>
                            {owner.name || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-body-2 text-black">{owner.phone}</td>
                        <td className="px-6 py-5 text-body-2 text-black">{owner.email}</td>
                        <td className="px-6 py-5 text-body-2 text-black">{owner.pets}</td>
                        <td className="px-6 py-5 text-body-2">
                          <span className={`flex items-center gap-2 ${statusStyle.text}`}>
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyle.dot}`}
                              aria-hidden="true"
                            />
                            {statusStyle.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={goToPage}
          />
        </>
      )}
    </section>
  );
}
