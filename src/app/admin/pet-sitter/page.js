"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdminPetSitterPage() {
  const [search, setSearch] = useState("");

  const petSitters = [
    { id: 1, name: "Jane Cooper", phone: "081 234 5678", email: "jane@petsitter.com", experience: "3 years", status: "Approved" },
    { id: 2, name: "Wade Warren", phone: "082 345 6789", email: "wade@petsitter.com", experience: "5 years", status: "Pending" },
    { id: 3, name: "Esther Howard", phone: "083 456 7890", email: "esther@petsitter.com", experience: "2 years", status: "Approved" },
    { id: 4, name: "Cameron Williamson", phone: "084 567 8901", email: "cameron@petsitter.com", experience: "1 year", status: "Rejected" },
  ];

  const filteredSitters = petSitters.filter(
    (sitter) =>
      sitter.name.toLowerCase().includes(search.toLowerCase()) ||
      sitter.email.toLowerCase().includes(search.toLowerCase()) ||
      sitter.phone.includes(search)
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#323640]">Pet Sitter</h1>
        <div className="relative w-full sm:w-64">
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
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto rounded-xl shadow-xs">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#000000] text-white">
              <th className="py-3.5 px-6 font-medium rounded-tl-xl">Pet Sitter</th>
              <th className="py-3.5 px-6 font-medium">Phone</th>
              <th className="py-3.5 px-6 font-medium">Email</th>
              <th className="py-3.5 px-6 font-medium">Experience</th>
              <th className="py-3.5 px-6 font-medium rounded-tr-xl">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredSitters.map((sitter) => (
              <tr key={sitter.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-6 font-medium text-gray-900 flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src="/image/content2.png"
                      alt={sitter.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold text-gray-900">{sitter.name}</span>
                </td>
                <td className="py-3.5 px-6 text-gray-700 font-medium">{sitter.phone}</td>
                <td className="py-3.5 px-6 text-gray-700">{sitter.email}</td>
                <td className="py-3.5 px-6 text-gray-900 font-medium">{sitter.experience}</td>
                <td className="py-3.5 px-6 font-medium">
                  {sitter.status === "Approved" && (
                    <span className="inline-flex items-center gap-1.5 text-[#1CCD83] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1CCD83]"></span>
                      Approved
                    </span>
                  )}
                  {sitter.status === "Pending" && (
                    <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Pending
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-center gap-3 text-xs font-medium text-gray-400 pt-2">
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">&lt;</button>
        <button className="w-8 h-8 rounded-full bg-[#FFF1EC] text-[#FF7037] font-bold flex items-center justify-center">1</button>
        <button className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-200/60 flex items-center justify-center">2</button>
        <span className="px-1 text-gray-400">...</span>
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">&gt;</button>
      </div>
    </div>
  );
}
