"use client";

import { useState } from "react";

export default function AdminReportPage() {
  const [search, setSearch] = useState("");

  const reports = [
    { id: 1, reporter: "John Wick", target: "Jane Cooper", issue: "Late response", date: "2026-08-10", status: "Resolved" },
    { id: 2, reporter: "Wade Warren", target: "System", issue: "Payment processing error", date: "2026-08-12", status: "Pending" },
  ];

  const filteredReports = reports.filter(
    (report) =>
      report.reporter.toLowerCase().includes(search.toLowerCase()) ||
      report.issue.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
      {/* Title & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-[#323640]">Report</h1>
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
              <th className="py-3.5 px-6 font-medium rounded-tl-xl">Reporter</th>
              <th className="py-3.5 px-6 font-medium">Target</th>
              <th className="py-3.5 px-6 font-medium">Issue</th>
              <th className="py-3.5 px-6 font-medium">Date</th>
              <th className="py-3.5 px-6 font-medium rounded-tr-xl">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {filteredReports.map((report) => (
              <tr key={report.id} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-3.5 px-6 font-medium text-gray-900">{report.reporter}</td>
                <td className="py-3.5 px-6 text-gray-700">{report.target}</td>
                <td className="py-3.5 px-6 text-gray-900 font-medium">{report.issue}</td>
                <td className="py-3.5 px-6 text-gray-500 text-xs font-mono">{report.date}</td>
                <td className="py-3.5 px-6 font-medium">
                  {report.status === "Resolved" ? (
                    <span className="inline-flex items-center gap-1.5 text-[#1CCD83] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1CCD83]"></span>
                      Resolved
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-amber-500 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Pending
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
        <button className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">&gt;</button>
      </div>
    </div>
  );
}
