"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getReport } from "@/lib/api";

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchReport() {
      if (!id) return;
      setIsLoading(true);
      setLoadError("");
      try {
        const row = await getReport(id);
        if (!cancelled) setReport(row);
      } catch (error) {
        if (!cancelled) {
          setLoadError(error.message || "Failed to load report");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchReport();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (loadError || !report) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4">
        <Link href="/admin/report" className="text-sm text-[#FF7037] hover:underline">
          Back to reports
        </Link>
        <p>Error: {loadError || "Report not found"}</p>
      </div>
    );
  }

  const statusClass =
    report.status === "Resolved"
      ? "text-[#1CCD83]"
      : report.status === "Cancelled"
        ? "text-gray-500"
        : "text-[#76D0FC]";
  const statusDotClass =
    report.status === "Resolved"
      ? "bg-[#1CCD83]"
      : report.status === "Cancelled"
        ? "bg-gray-400"
        : "bg-[#76D0FC]";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 pb-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/admin/report"
            className="flex min-w-0 items-center gap-3 text-gray-900 transition-colors hover:text-[#FF7037]"
          >
            <svg
              className="size-5 shrink-0 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2.5"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <h1 className="truncate text-xl font-bold text-[#1A1A1A]">
              {report.issue || "Report"}
            </h1>
          </Link>
          <span className={`inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold ${statusClass}`}>
            <span className={`size-1.5 rounded-full ${statusDotClass}`} />
            {report.status}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <button type="button" className="btn btn-ghost w-auto">
            Cancel Report
          </button>
          <button type="button" className="btn btn-primary w-auto">
            Resolve
          </button>
        </div>
      </div>

      <section className="rounded-2xl bg-white p-6 shadow-xs sm:p-8">
        <dl className="flex flex-col gap-6">
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
            <dt className="text-sm font-medium text-[#7B7E8C]">Reported by</dt>
            <dd className="text-sm font-medium text-gray-900">{report.reporter || "—"}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
            <dt className="text-sm font-medium text-[#7B7E8C]">Reported Person</dt>
            <dd className="text-sm font-medium text-gray-900">{report.target || "—"}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
            <dt className="text-sm font-medium text-[#7B7E8C]">Issue</dt>
            <dd className="text-sm font-medium text-gray-900">{report.issue || "—"}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
            <dt className="text-sm font-medium text-[#7B7E8C]">Description</dt>
            <dd className="text-sm leading-6 text-gray-900">{report.description || "—"}</dd>
          </div>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
            <dt className="text-sm font-medium text-[#7B7E8C]">Date Submitted</dt>
            <dd className="text-sm font-medium text-gray-900">{report.date || "—"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
