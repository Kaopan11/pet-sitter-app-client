"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import { getReport, updateReportStatus } from "@/lib/api";

const DETAIL_FIELDS = [
  ["Reported by", "reporter"],
  ["Reported Person", "target"],
  ["Issue", "issue"],
  ["Description", "description"],
  ["Date Submitted", "date"],
];

export default function AdminReportDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

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

  async function handleUpdateStatus(status) {
    if (!id || isUpdating) return;
    setIsUpdating(true);
    try {
      const updated = await updateReportStatus(id, status);
      setReport(updated);
      setConfirmAction(null);
      toast.success(
        status === "resolved" ? "Report resolved" : "Report cancelled",
      );
      router.push("/admin/report");
    } catch (error) {
      toast.error(error.message || "Failed to update report");
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (loadError || !report) {
    return (
      <div className="flex flex-col gap-4">
        <Link href="/admin/report" className="text-sm text-orange-500 hover:underline">
          Back to reports
        </Link>
        <p>Error: {loadError || "Report not found"}</p>
      </div>
    );
  }

  const statusClass =
    report.status === "Resolved"
      ? "text-green"
      : report.status === "Cancelled"
        ? "text-gray-500"
        : "text-blue";
  const statusDotClass =
    report.status === "Resolved"
      ? "bg-green"
      : report.status === "Cancelled"
        ? "bg-gray-400"
        : "bg-blue";

  const isPending = report.status === "Pending";
  const isResolve = confirmAction === "resolved";

  return (
    <section className="flex flex-col gap-6 pb-12">
      <header className="flex flex-col gap-4 sm:h-12 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link
            href="/admin/report"
            className="text-gray-400 hover:text-orange-500"
            aria-label="Back to reports"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </Link>
          <div className="flex min-w-0 items-center gap-6">
            <h1 className="truncate text-h3 text-black">
              {report.issue || "Report"}
            </h1>
            <p className={`flex shrink-0 items-center gap-2 text-body-2 ${statusClass}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${statusDotClass}`} />
              {report.status}
            </p>
          </div>
        </div>

        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary w-auto"
              disabled={isUpdating}
              onClick={() => setConfirmAction("cancelled")}
            >
              Cancel Report
            </button>
            <button
              type="button"
              className="btn btn-primary w-auto"
              disabled={isUpdating}
              onClick={() => setConfirmAction("resolved")}
            >
              Resolve
            </button>
          </div>
        ) : null}
      </header>

      <section className="rounded-2xl bg-white px-6 py-8 sm:px-20 sm:py-10">
        <dl>
          {DETAIL_FIELDS.map(([label, key], index) => (
            <div
              key={key}
              className={`grid grid-cols-1 items-start gap-1 py-6 sm:grid-cols-[220px_1fr] sm:gap-4 ${
                index < DETAIL_FIELDS.length - 1 ? "border-b border-gray-200" : ""
              } ${index === 0 ? "pt-0" : ""} ${index === DETAIL_FIELDS.length - 1 ? "pb-0" : ""}`}
            >
              <dt className="text-body-2 text-gray-400">{label}</dt>
              <dd className="text-body-2 text-black">{report[key] || "—"}</dd>
            </div>
          ))}
        </dl>
      </section>

      {confirmAction ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-confirm-title"
            className="w-full max-w-lg rounded-2xl bg-white"
          >
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 id="report-confirm-title" className="text-h4 text-gray-900">
                {isResolve ? "Resolve Report" : "Cancel Report"}
              </h2>
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                disabled={isUpdating}
                className="text-gray-300 hover:text-gray-500 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>

            <p className="px-6 py-10 text-body-2 text-gray-400">
              {isResolve
                ? "Has this report already been resolved?"
                : "Are you sure to cancel this report?"}
            </p>

            <footer className="flex items-center justify-end gap-4 px-6 pb-6">
              <button
                type="button"
                className="btn btn-secondary w-auto"
                disabled={isUpdating}
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary w-auto"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus(confirmAction)}
              >
                {isUpdating
                  ? "Saving..."
                  : isResolve
                    ? "Resolved"
                    : "Cancel Report"}
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </section>
  );
}
