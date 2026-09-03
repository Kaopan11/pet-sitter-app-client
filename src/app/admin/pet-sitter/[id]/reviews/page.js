"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Check, Trash2, UserRound, X } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import Icon from "@/components/Icon";
import LoadingState from "@/components/LoadingState";
import Pagination from "@/components/Pagination";
import {
  errorToastClassNames,
  successToastClassNames,
} from "@/lib/toastStyles";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function formatReviewDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function Stars({ count }) {
  return (
    <div
      className="flex items-center gap-0.5 text-green"
      aria-label={`${count} star rating`}
    >
      {Array.from({ length: Math.min(5, Math.max(0, count)) }).map((_, index) => (
        <Icon key={index} src="/icon/star.svg" className="h-5 w-5" />
      ))}
    </div>
  );
}

export default function AdminPetSitterReviewsPage() {
  const { id } = useParams();
  const [reviews, setReviews] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteId, setDeleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const getReviews = async (page) => {
    setIsLoading(true);
    setError("");
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/sitters/${id}/reviews`,
        { params: { page, limit: 5 } },
      );

      const rows = response.data.data ?? [];

      // กันหน้าว่างหลัง อนุมัติหรือลบรีวิวชิ้นสุดท้ายของหน้านั้น
      // สมมติอยู่หน้า 2 มีรีวิว 1 ชิ้น แล้วกดลบ/อนุมัติ หน้า 2 จะไม่เหลืออะไร แต่หน้า 1 ยังมี ถ้าไม่เช็กนี้ UI จะโชว์ "No reviews yet."
      if (rows.length === 0 && page > 1) {
        await getReviews(page - 1);
        return;
      }
      setReviews(rows);
      setCurrentPage(response.data.currentPage ?? page);
      setTotalPages(response.data.totalPages ?? 1);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getReviews(1);
  }, [id]);

  async function approveReview(reviewId) {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await axios.patch(
        `${API_BASE_URL}/api/admin/sitters/${id}/reviews/${reviewId}`,
      );
      toast("Review approved", { classNames: successToastClassNames });
      await getReviews(currentPage);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to approve review", {
        classNames: errorToastClassNames,
      });
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteReview() {
    if (!deleteId || isSaving) return;
    setIsSaving(true);
    try {
      await axios.delete(
        `${API_BASE_URL}/api/admin/sitters/${id}/reviews/${deleteId}`,
      );
      setDeleteId(null);
      toast("Review deleted", { classNames: successToastClassNames });
      await getReviews(currentPage);
    } catch (err) {
      toast(err.response?.data?.message || "Failed to delete review", {
        classNames: errorToastClassNames,
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <article className="rounded-2xl rounded-tl-none bg-white p-10">
        <LoadingState />
      </article>
    );
  }

  if (error) {
    return (
      <article className="rounded-2xl rounded-tl-none bg-white p-10">
        <p className="py-16 text-center text-body-2 text-red">{error}</p>
      </article>
    );
  }

  if (reviews.length === 0) {
    return (
      <article className="rounded-2xl rounded-tl-none bg-white p-10">
        <p className="py-16 text-center text-body-2 text-gray-400">
          No reviews yet.
        </p>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-10 rounded-2xl rounded-tl-none bg-white p-10">
      <ul className="flex flex-col gap-10">
        {reviews.map((review) => (
          <li
            key={review.id}
            className="flex flex-col gap-4 border-b border-gray-200 px-6 pt-6 pb-10 last:border-b-0 sm:flex-row sm:items-start sm:gap-4"
          >
            <div className="flex w-full shrink-0 items-start gap-4 sm:w-55">
              {review.avatar_url ? (
                <Image
                  src={review.avatar_url}
                  alt={`${review.name} profile`}
                  width={56}
                  height={56}
                  unoptimized
                  className="size-14 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gray-200">
                  <UserRound className="h-6 w-6 text-white" aria-hidden="true" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-body-1 text-black">{review.name}</p>
                <p className="text-body-2 text-gray-400">
                  {formatReviewDate(review.created_at)}
                </p>
              </div>
            </div>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <Stars count={Number(review.rating) || 0} />
              {review.comment ? (
                <p className="text-body-2 text-gray-500">{review.comment}</p>
              ) : null}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                className="flex size-15 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:text-red disabled:cursor-not-allowed"
                aria-label="Delete review"
                disabled={isSaving}
                onClick={() => setDeleteId(review.id)}
              >
                <Trash2 className="h-5 w-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                className="flex size-15 cursor-pointer items-center justify-center rounded-full bg-orange-100 text-orange-500 hover:bg-orange-200 disabled:cursor-not-allowed"
                aria-label="Approve review"
                disabled={isSaving}
                onClick={() => approveReview(review.id)}
              >
                <Check className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={getReviews}
      />

      {/* modal ลบ review */}
      {deleteId ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setDeleteId(null)}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-review-title"
            className="w-full max-w-md rounded-2xl bg-white"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2
                id="delete-review-title"
                className="text-h3 font-bold text-gray-600"
              >
                Delete Confirmation
              </h2>
              <button
                type="button"
                className="cursor-pointer text-gray-600 hover:text-gray-900"
                aria-label="Close"
                onClick={() => setDeleteId(null)}
              >
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </header>
            <div className="flex flex-col gap-6 p-6">
              <p className="text-body-2 text-gray-400">
                Are you sure to delete this review?
              </p>
              <footer className="flex items-center justify-between">
                <button
                  type="button"
                  className="btn btn-secondary min-w-30"
                  disabled={isSaving}
                  onClick={() => setDeleteId(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary min-w-30"
                  disabled={isSaving}
                  onClick={deleteReview}
                >
                  {isSaving ? "Deleting..." : "Delete"}
                </button>
              </footer>
            </div>
          </section>
        </div>
      ) : null}
    </article>
  );
}
