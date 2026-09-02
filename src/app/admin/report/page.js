"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { getReports } from "@/lib/api";
import Pagination from "@/components/Pagination";

export default function AdminReportPage() {
  const [search, setSearch] = useState("");
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      setIsLoading(true);
      setLoadError("");
      try {
        const rows = await getReports();
        if (!cancelled) setReports(rows);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Failed to load reports");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchReports();
    return () => {
      cancelled = true;
    };
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (loadError) {
    return <div>Error: {loadError}</div>;
  }

  const query = search.toLowerCase();
  const filteredReports = reports.filter(
    (report) =>
      report.reporter.toLowerCase().includes(query) ||
      report.issue.toLowerCase().includes(query) ||
      report.target.toLowerCase().includes(query),
  );

    //pagination
    const totalPages = Math.max(1, Math.ceil(filteredReports.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pagedReports = filteredReports.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      {/* Title & Search Bar */}
      <div className="flex w-full items-center justify-between">
        <h1 className="text-xl font-bold text-[#323640]">Report</h1>
        <label className="relative block w-60">
          <input
            className="input pr-10"
            type="search"
            name="search"
            placeholder="Search..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <Search
            className="pointer-events-none absolute top-1/2 right-3 h-6 w-6 -translate-y-1/2 text-gray-300"
            aria-hidden="true"
          />
        </label>
      </div>

      {/* Table Area */}
      <div className="w-full min-w-0 overflow-hidden rounded-2xl bg-white">
        <table className="w-full table-fixed border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-[#000000] text-white">
              <th className="py-3.5 px-6 font-medium rounded-tl-xl">
                Reporter
              </th>
              <th className="py-3.5 px-6 font-medium">Target</th>
              <th className="py-3.5 px-6 font-medium">Issue</th>
              <th className="py-3.5 px-6 font-medium">Date</th>
              <th className="py-3.5 px-6 font-medium rounded-tr-xl">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {pagedReports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-gray-50/80 transition-colors"
              >
                <td className="py-3.5 px-6 font-medium text-gray-900">
                  {report.reporter}
                </td>
                <td className="py-3.5 px-6 text-gray-700">{report.target}</td>
                <td className="py-3.5 px-6 text-gray-900 font-medium">
                  <Link
                    href={`/admin/report/${report.id}`}
                    className="hover:text-[#FF7037] hover:underline"
                  >
                    {report.issue}
                  </Link>
                </td>
                <td className="py-3.5 px-6 text-gray-500 text-xs font-mono">
                  {report.date}
                </td>
                <td className="py-3.5 px-6 font-medium">
                  {report.status === "Resolved" ? (
                    <span className="inline-flex items-center gap-1.5 text-[#1CCD83] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1CCD83]"></span>
                      Resolved
                    </span>
                  ) : report.status === "Cancelled" ? (
                    <span className="inline-flex items-center gap-1.5 text-gray-500 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                      Cancelled
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
      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
