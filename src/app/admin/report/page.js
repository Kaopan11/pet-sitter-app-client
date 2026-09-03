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
        <h1 className="text-h3 font-bold text-gray-900">Report</h1>
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
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="bg-black text-white">
            <tr>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">
                Reporter
              </th>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">Target</th>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">Issue</th>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">Date</th>
              <th className="border-0 px-6 py-4 text-body-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pagedReports.map((report) => (
              <tr
                key={report.id}
                className="h-19 border-b border-gray-200 last:border-b-0 hover:bg-gray-100"
              >
                <td className="px-6 py-5 text-body-2 text-black">
                  {report.reporter}
                </td>
                <td className="px-6 py-5 text-body-2 text-black">{report.target}</td>
                <td className="px-6 py-5 text-body-2 text-black">
                  <Link
                    href={`/admin/report/${report.id}`}
                    className="hover:text-orange-500 hover:underline"
                  >
                    {report.issue}
                  </Link>
                </td>
                <td className="px-6 py-5 text-body-2 text-black">
                  {report.date}
                </td>
                <td className="px-6 py-5 text-body-2">
                  {report.status === "Resolved" ? (
                    <span className="inline-flex items-center gap-2 text-green">
                      <span className="h-1.5 w-1.5 rounded-full bg-green"></span>
                      Resolved
                    </span>
                  ) : report.status === "Cancelled" ? (
                    <span className="inline-flex items-center gap-2 text-gray-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400"></span>
                      Cancelled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-2 text-amber-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
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
