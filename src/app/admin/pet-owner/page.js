"use client";

import { useState } from "react";
import Image from "next/image";

export default function AdminPetOwnerPage() {
  const [search, setSearch] = useState("");

  const petOwners = [
    { id: 1, name: "John Wick", phone: "099 996 6734", email: "johnwicklovedogs@dogorg.com", pets: 2, status: "Normal" },
    { id: 2, name: "John Wick", phone: "099 996 6734", email: "johnwicklovedogs@dogorg.com", pets: 2, status: "Normal" },
    { id: 3, name: "John Wick", phone: "099 996 6734", email: "johnwicklovedogs@dogorg.com", pets: 2, status: "Normal" },
    { id: 4, name: "John Wick", phone: "099 996 6734", email: "johnwicklovedogs@dogorg.com", pets: 2, status: "Banned" },
    { id: 5, name: "John Wick", phone: "099 996 6734", email: "johnwicklovedogs@dogorg.com", pets: 2, status: "Normal" },
    { id: 6, name: "John Wick", phone: "099 996 6734", email: "johnwicklovedogs@dogorg.com", pets: 2, status: "Normal" },
    { id: 7, name: "John Wick", phone: "099 996 6734", email: "johnwicklovedogs@dogorg.com", pets: 2, status: "Normal" },
    { id: 8, name: "John Wick", phone: "099 996 6734", email: "johnwicklovedogs@dogorg.com", pets: 2, status: "Normal" },
  ];

  const filteredOwners = petOwners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(search.toLowerCase()) ||
      owner.email.toLowerCase().includes(search.toLowerCase()) ||
      owner.phone.includes(search)
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Title & Search Bar (directly on gray background) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#323640]">Pet Owner</h1>
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

      {/* Table Area (Black header + White rows) */}
      <div className="overflow-x-auto rounded-xl shadow-xs">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          {/* Dark Black Header */}
          <thead>
            <tr className="bg-[#000000] text-white">
              <th className="py-3.5 px-6 font-medium rounded-tl-xl">Pet Owner</th>
              <th className="py-3.5 px-6 font-medium">Phone</th>
              <th className="py-3.5 px-6 font-medium">Email</th>
              <th className="py-3.5 px-6 font-medium">Pet(s)</th>
              <th className="py-3.5 px-6 font-medium rounded-tr-xl">Status</th>
            </tr>
          </thead>
          {/* White Rows */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredOwners.map((owner) => (
              <tr key={owner.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-6 font-medium text-gray-900 flex items-center gap-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    <Image
                      src="/image/content1.png"
                      alt={owner.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-semibold text-gray-900">{owner.name}</span>
                </td>
                <td className="py-3.5 px-6 text-gray-700 font-medium">{owner.phone}</td>
                <td className="py-3.5 px-6 text-gray-700">{owner.email}</td>
                <td className="py-3.5 px-6 text-gray-900 font-medium">{owner.pets}</td>
                <td className="py-3.5 px-6 font-medium">
                  {owner.status === "Banned" ? (
                    <span className="inline-flex items-center gap-1.5 text-red-500 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Banned
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[#1CCD83] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1CCD83]"></span>
                      Normal
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer - Directly on gray background */}
      <div className="flex items-center justify-center gap-3 text-xs font-medium text-gray-400 pt-2">
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">&lt;</button>
        <button className="w-8 h-8 rounded-full bg-[#FFF1EC] text-[#FF7037] font-bold flex items-center justify-center">1</button>
        <button className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-200/60 flex items-center justify-center">2</button>
        <span className="px-1 text-gray-400">...</span>
        <button className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-200/60 flex items-center justify-center">44</button>
        <button className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-200/60 flex items-center justify-center">45</button>
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">&gt;</button>
      </div>
    </div>
  );
}
