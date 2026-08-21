"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdminPetSitterPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All status");

  const petSitters = [
    {
      id: 1,
      fullName: "Jane Maison",
      petSitterName: "Happy House!",
      email: "janemaison@gmail.com",
      status: "Waiting for approve",
    },
    {
      id: 2,
      fullName: "Jane Cooper",
      petSitterName: "Pet Paradise",
      email: "jane@petsitter.com",
      status: "Approved",
    },
    {
      id: 3,
      fullName: "Wade Warren",
      petSitterName: "Cozy Pet Home",
      email: "wade@petsitter.com",
      status: "Waiting for approve",
    },
    {
      id: 4,
      fullName: "Esther Howard",
      petSitterName: "Dog & Cat Haven",
      email: "esther@petsitter.com",
      status: "Approved",
    },
    {
      id: 5,
      fullName: "Cameron Williamson",
      petSitterName: "Little Paws Care",
      email: "cameron@petsitter.com",
      status: "Rejected",
    },
  ];

  const filteredSitters = petSitters.filter((sitter) => {
    const matchesSearch =
      sitter.fullName.toLowerCase().includes(search.toLowerCase()) ||
      sitter.petSitterName.toLowerCase().includes(search.toLowerCase()) ||
      sitter.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All status" ||
      sitter.status === statusFilter ||
      (statusFilter === "Waiting for approve" && sitter.status === "Pending");

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Title & Search / Status Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#323640]">Pet Sitter</h1>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF7037] placeholder-gray-400 text-gray-700 shadow-xs"
            />
            <svg
              className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Status Dropdown */}
          <div className="relative sm:w-44">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#FF7037] text-gray-400 shadow-xs appearance-none cursor-pointer"
            >
              <option value="All status">All status</option>
              <option value="Approved">Approved</option>
              <option value="Waiting for approve">Waiting for approve</option>
              <option value="Rejected">Rejected</option>
            </select>
            <svg
              className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto rounded-xl shadow-xs">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#000000] text-white">
              <th className="py-3.5 px-6 font-medium rounded-tl-xl">Full Name</th>
              <th className="py-3.5 px-6 font-medium">Pet Sitter Name</th>
              <th className="py-3.5 px-6 font-medium">Email</th>
              <th className="py-3.5 px-6 font-medium rounded-tr-xl">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredSitters.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-500">
                  No pet sitters found.
                </td>
              </tr>
            ) : (
              filteredSitters.map((sitter) => (
                <tr key={sitter.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-6 font-medium text-gray-900 flex items-center gap-3">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                      <Image
                        src="/image/content2.png"
                        alt={sitter.fullName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-semibold text-gray-900">{sitter.fullName}</span>
                  </td>
                  <td className="py-3.5 px-6 text-gray-700 font-medium">{sitter.petSitterName}</td>
                  <td className="py-3.5 px-6 text-gray-700">{sitter.email}</td>
                  <td className="py-3.5 px-6 font-medium">
                    {sitter.status === "Approved" && (
                      <span className="inline-flex items-center gap-1.5 text-[#1CCD83] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#1CCD83]"></span>
                        Approved
                      </span>
                    )}
                    {(sitter.status === "Waiting for approve" || sitter.status === "Pending") && (
                      <span className="inline-flex items-center gap-1.5 text-[#FA8AC0] font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FA8AC0]"></span>
                        Waiting for approve
                      </span>
                    )}
                    {sitter.status === "Rejected" && (
                      <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        Rejected
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-center gap-3 text-sm font-semibold pt-2">
        <button className="w-9 h-9 flex items-center justify-center text-[#A0A7B5] hover:text-gray-700 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="w-9 h-9 rounded-full bg-[#FFF1EC] text-[#FF7037] font-bold flex items-center justify-center cursor-pointer">
          1
        </button>
        <button className="w-9 h-9 rounded-full bg-white text-[#7B7E8C] hover:bg-gray-50 font-semibold flex items-center justify-center cursor-pointer shadow-2xs">
          2
        </button>
        <span className="px-1 text-[#A0A7B5]">...</span>
        <button className="w-9 h-9 rounded-full bg-white text-[#7B7E8C] hover:bg-gray-50 font-semibold flex items-center justify-center cursor-pointer shadow-2xs">
          44
        </button>
        <button className="w-9 h-9 rounded-full bg-white text-[#7B7E8C] hover:bg-gray-50 font-semibold flex items-center justify-center cursor-pointer shadow-2xs">
          45
        </button>
        <button className="w-9 h-9 flex items-center justify-center text-[#A0A7B5] hover:text-gray-700 transition-colors cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}


