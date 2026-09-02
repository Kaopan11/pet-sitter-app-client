"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import axios from "axios";
import { ChevronLeft, CircleAlert, X } from "lucide-react";
import { toast } from "sonner";
import LoadingState from "@/components/LoadingState";
import {
  errorToastClassNames,
  successToastClassNames,
} from "@/lib/toastStyles";
import { SitterDetailProvider } from "./sitter-detail-context";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const STATUS = {
  Unverified: { label: "Unverified", text: "text-gray-500", dot: "bg-gray-400" },
  "Waiting for verify": { label: "Waiting for verify", text: "text-pink", dot: "bg-pink" },
  Verified: { label: "Verified", text: "text-green", dot: "bg-green" },
  "Waiting for approve": { label: "Waiting for approve", text: "text-pink", dot: "bg-pink" },
  Approved: { label: "Approved", text: "text-green", dot: "bg-green" },
  Rejected: { label: "Rejected", text: "text-red", dot: "bg-red" },
};

function tabHref(id, tab) {
  if (tab === "booking") return `/admin/pet-sitter/${id}/booking`;
  if (tab === "reviews") return `/admin/pet-sitter/${id}/reviews`;
  return `/admin/pet-sitter/${id}`;
}

export default function AdminPetSitterDetailLayout({ children }) {
  const { id } = useParams();
  const pathname = usePathname(); // href หน้าปัจจุบัน
  const [sitterData, setSitterData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [reason, setReason] = useState("");

  const statusStyle = STATUS[sitterData?.approval_status] ?? STATUS.Unverified;
  const isWaiting =
    sitterData?.approval_status === "Waiting for verify" ||
    sitterData?.approval_status === "Waiting for approve";
  const isRejected = sitterData?.approval_status === "Rejected";

  async function loadSitter() {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(`${API_BASE_URL}/api/admin/sitters/${id}`);
      setSitterData(response.data.data ?? null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load pet sitter");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSitter();
  }, [id]);

  async function updateStatus(approvalStatus) {
    setIsSaving(true);
    try {
      const body = { approval_status: approvalStatus };
      if (approvalStatus === "Rejected") {
        body.rejection_reason = reason.trim();
      }
      await axios.patch(`${API_BASE_URL}/api/admin/sitters/${id}/status`, body);

      const response = await axios.get(`${API_BASE_URL}/api/admin/sitters/${id}`);
      setSitterData(response.data.data ?? null);
      setIsRejectOpen(false);
      setReason("");
      toast(
        approvalStatus === "Approved"
          ? "Pet sitter approved"
          : "Pet sitter rejected",
        { classNames: successToastClassNames },
      );
    } catch (err) {
      toast(err.response?.data?.message || "Failed to update status", {
        classNames: errorToastClassNames,
      });
    } finally {
      setIsSaving(false);
    }
  }

  function handleReject() {
    if (!reason.trim()) return;
    updateStatus("Rejected");
  }

  return (
    <section className="flex flex-col gap-6 pb-12">
      <header className="flex h-12 items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/pet-sitter"
            className="text-gray-400 hover:text-orange-500"
            aria-label="Back to pet sitter list"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden="true" />
          </Link>

          <div className="flex items-center gap-6">
            <h1 className="text-h3 text-black">{sitterData?.full_name}</h1>

            {sitterData ? (
              <p
                className={`flex items-center gap-2 text-body-2 ${statusStyle.text}`}
              >
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusStyle.dot}`}
                  aria-hidden="true"
                />
                {statusStyle.label}
              </p>
            ) : null}
          </div>
        </div>

        {isWaiting ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary min-w-30"
              onClick={() => setIsRejectOpen(true)}
              disabled={isSaving}
            >
              Reject
            </button>
            <button
              type="button"
              className="btn btn-primary min-w-30"
              onClick={() => updateStatus("Approved")}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Approve"}
            </button>
          </div>
        ) : null}
      </header>

      {isRejected ? (
        <p className="flex items-center gap-2.5 rounded-md bg-gray-200 p-3 text-body-2 text-red">
          <CircleAlert className="size-6 shrink-0" aria-hidden="true" />
          <span>
            Their request has not been approved
            {sitterData.rejection_reason
              ? `: '${sitterData.rejection_reason}'`
              : "."}
          </span>
        </p>
      ) : null}

      {error ? <p className="text-body-2 text-red">{error}</p> : null}

      {isLoading ? (
        <LoadingState />
      ) : sitterData ? (
        // ใช้ context เพื่อส่ง sitterData ไปยังหน้า children
        <SitterDetailProvider sitter={sitterData}>
          <div className="flex flex-col">
            <nav
              className="flex items-center gap-2"
              aria-label="Pet sitter sections"
            >
              {["Profile", "Booking", "Reviews"].map((item) => {
                const tab = item.toLowerCase();
                const href = tabHref(id, tab);
                const isActive = pathname === href;

                return (
                  <Link
                    key={item}
                    href={href}
                    className={`rounded-t-2xl px-8 py-3 text-body-2 font-bold ${
                      isActive
                        ? "bg-white text-orange-500"
                        : "bg-gray-200 text-gray-400 hover:text-gray-500"
                    }`}
                  >
                    {item}
                  </Link>
                );
              })}
            </nav>
            {children}
          </div>
        </SitterDetailProvider>
      ) : null}

      {isRejectOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-title"
            className="w-full max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-[4px_4px_24px_0px_rgba(0,0,0,0.04)]"
          >
            <header className="flex h-15 items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 id="reject-title" className="text-h4 text-black">
                Reject Confirmation
              </h2>
              <button
                type="button"
                onClick={() => setIsRejectOpen(false)}
                className="text-gray-300 hover:text-gray-500"
                aria-label="Close reject confirmation"
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>

            <div className="flex flex-col gap-6 p-6">
              <div className="flex flex-col gap-1">
                <label htmlFor="reject-reason" className="text-body-2 text-black">
                  Reason and suggestion
                </label>
                <textarea
                  id="reject-reason"
                  className="input h-35 resize-none"
                  placeholder="Admin's suggestion here"
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </div>

              <footer className="flex items-center justify-between">
                <button
                  type="button"
                  className="btn btn-secondary min-w-30"
                  onClick={() => setIsRejectOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary min-w-30"
                  onClick={handleReject}
                  disabled={isSaving || !reason.trim()}
                >
                  {isSaving ? "Rejecting..." : "Reject"}
                </button>
              </footer>
            </div>
          </section>
        </div>
      ) : null}
    </section>
  );
}
