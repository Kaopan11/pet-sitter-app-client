"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, UserRound } from "lucide-react";
import axios from "axios";
import LoadingState from "@/components/LoadingState";
import Pagination from "@/components/Pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS = {
  Approved: { label: "Approved", text: "text-green", dot: "bg-green" },
  "Waiting for approve": { label: "Waiting for approve", text: "text-pink", dot: "bg-pink" },
  Rejected: { label: "Rejected", text: "text-red", dot: "bg-red" },
};

export default function AdminPetSitterPage() {
  const [sitters, setSitters] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const getSitters = async (page) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/sitters`, {
        params: { search, status, page, limit: 8 },
      });
      setSitters(response.data.data ?? []);
      setCurrentPage(response.data.currentPage ?? page);
      setTotalPages(response.data.totalPages ?? 1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getSitters(1).catch((err) => {
      setError(err.response?.data?.message || "Failed to load pet sitters");
    });
  }, [search, status]);

  const goToPage = (page) => {
    const nextPage = Math.min(Math.max(1, page), Math.max(1, totalPages));
    getSitters(nextPage).catch((err) => {
      setError(err.response?.data?.message || "Failed to load pet sitters");
    });
  };

  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-h3 font-bold text-gray-900">Pet Sitter</h1>

        <div className="flex items-center gap-4">
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

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-60" aria-label="Filter by status">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              {Object.entries(STATUS).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </header>

      {error ? <p className="text-body-2 text-red">{error}</p> : null}

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-white">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Admin pet sitter list</caption>
              <thead className="bg-black text-white">
                <tr>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Full Name</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Pet Sitter Name</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Email</th>
                  <th className="border-0 px-6 py-4 text-body-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sitters.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-body-2 text-gray-500">
                      No pet sitters found.
                    </td>
                  </tr>
                ) : (
                  sitters.map((sitter) => {
                    const statusStyle = STATUS[sitter.approval_status];

                    return (
                      <tr
                        key={sitter.id}
                        className="h-19 border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
                      >
                        <td className="px-6 py-5 text-body-2 text-black">
                          <span className="flex items-center gap-2">
                            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-gray-200">
                              {sitter.avatar_url ? (
                                <Image
                                  src={sitter.avatar_url}
                                  alt={`${sitter.full_name || "Pet sitter"} profile`}
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
                            {sitter.full_name || "—"}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-body-2 text-black">
                          {sitter.pet_sitter_name || "—"}
                        </td>
                        <td className="px-6 py-5 text-body-2 text-black">
                          {sitter.email || "—"}
                        </td>
                        <td className="px-6 py-5 text-body-2">
                          <span
                            className={`flex items-center gap-2 ${statusStyle?.text ?? "text-gray-500"}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyle?.dot ?? "bg-gray-400"}`}
                              aria-hidden="true"
                            />
                            {statusStyle?.label ?? sitter.approval_status}
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
