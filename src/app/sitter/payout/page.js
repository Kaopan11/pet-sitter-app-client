"use client";

/**
 * Payout Dashboard — ticket T02
 * ดึง totalEarning + bankAccount + transactions จาก BE (ไม่คำนวณเอง)
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/Pagination";
import LoadingState from "@/components/LoadingState";
import TotalEarningCard from "@/components/sitter/payout/TotalEarningCard";
import BankAccountCard from "@/components/sitter/payout/BankAccountCard";
import TransactionTable from "@/components/sitter/payout/TransactionTable";
import {
  getMyPayout,
  normalizePayoutError,
  PAYOUT_ERROR_ACTION,
} from "@/lib/api/payout";

const PAGE_LIMIT = 20;

export default function PayoutPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [forbidden, setForbidden] = useState(false);

  // Step 1: โหลด dashboard ตามหน้า — totalEarning มากับ response ทุกครั้ง (ค่าคงที่จาก BE)
  const loadPayout = useCallback(
    async (targetPage) => {
      setLoading(true);
      setError("");
      setForbidden(false);

      try {
        const data = await getMyPayout({ page: targetPage, limit: PAGE_LIMIT });
        setDashboard(data);
        setPage(targetPage);
      } catch (err) {
        const { action, message } = normalizePayoutError(err);

        // Step 2: แยก error ตาม action จาก T01
        if (action === PAYOUT_ERROR_ACTION.LOGIN) {
          router.replace("/login");
          return;
        }
        if (action === PAYOUT_ERROR_ACTION.FORBIDDEN) {
          setForbidden(true);
        }
        setError(message);
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only payout load
    void loadPayout(1);
  }, [loadPayout]);

  // Step 3: BE ส่ง totalItems + limit — FE คำนวณ totalPages
  const totalPages = useMemo(() => {
    const pagination = dashboard?.pagination;
    if (!pagination?.totalItems || !pagination?.limit) return 1;
    return Math.max(1, Math.ceil(pagination.totalItems / pagination.limit));
  }, [dashboard?.pagination]);

  function handlePageChange(nextPage) {
    const safePage = Math.min(Math.max(1, nextPage), totalPages);
    if (safePage === page) return;
    loadPayout(safePage);
  }

  return (
    // layout กว้างเต็ม content area — เทียบ booking-list / Figma
    <section className="flex flex-col gap-6">
      <header>
        <h1 className="text-h3 font-bold text-gray-900">Payout Option</h1>
      </header>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <div className="rounded-2xl bg-white p-8 text-center">
          <p className="text-body-2 text-red">{error}</p>
          {forbidden ? null : (
            <button
              type="button"
              onClick={() => loadPayout(page)}
              className="btn btn-primary mt-4"
            >
              Try again
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Step 4: การ์ดสรุป — ยอดรวม + บัญชี */}
          <div className="flex flex-col gap-4 md:flex-row">
            <TotalEarningCard totalEarning={dashboard?.totalEarning ?? 0} />
            <BankAccountCard bankAccount={dashboard?.bankAccount ?? null} />
          </div>

          {/* Step 5: ตาราง + pagination (ยอดรวมไม่เปลี่ยนตามหน้า) */}
          <TransactionTable transactions={dashboard?.transactions ?? []} />

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </section>
  );
}
