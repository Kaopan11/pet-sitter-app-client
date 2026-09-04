"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Icon from "./Icon";
import Pagination from "./Pagination";
import { createConversation, getProfile, getSitter, getSitterAvailability, getSitterReviews } from "@/lib/api";
import BookingDateTimeModal from "@/components/booking/BookingDateTimeModal";

const Map = dynamic(() => import("@/components/Map"), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full animate-pulse rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 font-medium">
      กำลังโหลดแผนที่...
    </div>
  ),
});

import { getToken, getUser } from "@/lib/auth";
import { getSitterCoords } from "@/lib/sitterLocation";
import {
  bookingRangeOverlapsBooked,
  combineBookingDateTime,
  dateRangeOverlapsBooked,
  isAtLeastThreeHoursAhead,
  normalizeBookedSlots,
} from "@/lib/booking";
import { MONTHS } from "@/components/booking/BookingCalendarPicker";
import { errorToastClassNames } from "@/lib/toastStyles";
import { isOwnerProfileComplete } from "@/utils/validateProfile";

const PET_BADGE = {
  dog: "badge-dog",
  cat: "badge-cat",
  bird: "badge-bird",
  rabbit: "badge-rabbit",
};

function isRemoteSrc(src) {
  return String(src ?? "").startsWith("http");
}

function isOwnSitterListing(sitterId) {
  const currentId = getUser()?.id;
  return Boolean(currentId && sitterId && String(currentId) === String(sitterId));
}

function firstString(...values) {
  return values.find((value) => typeof value === "string" && value.trim()) ?? "";
}

function formatExperience(value) {
  if (value == null || value === "") return "";
  const text = String(value).trim();
  if (text === "0") return "";
  if (/exp\.?$/i.test(text)) return text;
  if (/years?$/i.test(text)) return `${text} Exp.`;
  return `${text} Years Exp.`;
}

function normalizePetTypes(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      const name = typeof item === "string" ? item : item?.name;
      return String(name ?? "").trim().toLowerCase();
    })
    .filter(Boolean);
}

function collectPhotos(raw) {
  const rows = raw.sitter_photos ?? raw.sitters_photo ?? raw.photos ?? [];
  const list = Array.isArray(rows) ? rows : [];

  return list
    .slice()
    .sort((a, b) => {
      if (typeof a === "string" || typeof b === "string") return 0;
      return (a.sort_order ?? a.sortOrder ?? 0) - (b.sort_order ?? b.sortOrder ?? 0);
    })
    .map((item) =>
      typeof item === "string" ? item : item?.photo_url || item?.photoUrl || ""
    )
    .filter(Boolean);
}

function normalizeSitter(raw) {
  const district = firstString(raw.district, raw.sub_district, raw.subDistrict);
  const province = firstString(raw.province);
  const location =
    firstString(raw.location) || [district, province].filter(Boolean).join(", ");

  return {
    id: raw.id ?? raw.user_id,
    title: firstString(raw.title, raw.display_name, raw.tradeName, "Pet Sitter"),
    sitterName: firstString(raw.sitterName, raw.sitter_name, raw.name),
    avatarUrl: firstString(raw.avatarUrl, raw.avatar_url),
    location,
    rating: Number(raw.rating ?? raw.rating_avg ?? 0) || 0,
    ratingAvg: Number(raw.rating_avg ?? raw.ratingAvg ?? raw.rating ?? 0) || 0,
    reviewCount: Number(raw.review_count ?? raw.reviewCount ?? 0) || 0,
    petTypes: normalizePetTypes(raw.petTypes ?? raw.pet_types),
    photos: collectPhotos(raw),
    introduction: firstString(raw.introduction),
    services: firstString(raw.services),
    myPlace: firstString(raw.myPlace, raw.my_place),
    experience: formatExperience(raw.experience ?? raw.experience_years ?? raw.experienceYears),
    latitude: raw.latitude,
    longitude: raw.longitude,
  };
}

function Stars({ count }) {
  return (
    <div className="flex items-center gap-0.5 text-green" aria-label={`${count} star rating`}>
      {Array.from({ length: Math.min(5, Math.max(0, count)) }).map((_, index) => (
        <Icon key={index} src="/icon/star.svg" className="h-5 w-5" />
      ))}
    </div>
  );
}

function isSameDayBooking(startDate, endDate, isManyDays) {
  if (isManyDays && !endDate) return false;
  return Boolean(startDate) && (!endDate || startDate === endDate);
}

function isStartBeforeEnd(startDate, startTime, endDate, endTime, isManyDays) {
  if (!startTime || !endTime) return true;
  if (!isSameDayBooking(startDate, endDate, isManyDays)) {
    if (!startDate || !endDate) return true;
    const start = combineBookingDateTime(startDate, startTime);
    const end = combineBookingDateTime(endDate, endTime);
    return Boolean(start && end && start.getTime() < end.getTime());
  }
  return startTime < endTime;
}

function CompleteProfileModal({ onClose, onComplete }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-profile-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-(--shadow-card)"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 id="complete-profile-title" className="text-h4 text-gray-900">
            Complete your profile
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-body-2 text-gray-500">
            Please fill in your name, email, phone, ID number, and date of birth
            before booking a pet sitter.
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button type="button" onClick={onComplete} className="btn btn-primary flex-1">
            Complete profile
          </button>
        </div>
      </div>
    </div>
  );
}

function LoginRequiredModal({ onClose, onLogin }) {
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-70 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-required-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-(--shadow-card)"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h3 id="login-required-title" className="text-h4 text-gray-900">
            Please log in
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1 text-gray-400 transition-colors hover:text-gray-600"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-6">
          <p className="text-body-2 text-gray-500">
            You need to log in first to continue.
          </p>
        </div>
        <div className="flex items-center gap-3 px-6 pb-6">
          <button type="button" onClick={onClose} className="btn btn-secondary flex-1">
            Cancel
          </button>
          <button type="button" onClick={onLogin} className="btn btn-primary flex-1">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

function wrapPhotos(photos, start, count) {
  const length = photos.length;
  if (!length || count <= 0) return [];
  return Array.from({ length: count }, (_, index) => {
    const next = ((start + index) % length + length) % length;
    return photos[next];
  });
}

function Gallery({ photos, title }) {
  const total = photos.length;
  const [isLg, setIsLg] = useState(false);
  const [offset, setOffset] = useState(photos.length > 1 ? 1 : 0);
  const [animated, setAnimated] = useState(true);
  const locked = useRef(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsLg(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const visibleCount = isLg ? 3 : 1;
  const canLoop = total > 1 && total >= visibleCount;
  const cloneCount = canLoop ? visibleCount : 0;
  const start = cloneCount;
  const slides = canLoop
    ? [
        ...wrapPhotos(photos, total - cloneCount, cloneCount),
        ...photos,
        ...wrapPhotos(photos, 0, cloneCount),
      ]
    : photos;
  const centered = isLg && total > 0 && total < visibleCount;

  useEffect(() => {
    setAnimated(false);
    setOffset(start);
    locked.current = false;
  }, [start]);

  if (total === 0) return null;

  const go = (step) => {
    if (!canLoop || locked.current) return;
    locked.current = true;
    setAnimated(true);
    setOffset((value) => value + step);
  };

  const handleTransitionEnd = (event) => {
    if (event.target !== event.currentTarget) return;
    if (!canLoop) {
      locked.current = false;
      return;
    }
    if (offset >= start + total) {
      setAnimated(false);
      setOffset(start);
    } else if (offset < start) {
      setAnimated(false);
      setOffset(start + total - 1);
    }
    locked.current = false;
  };

  return (
    <div className="relative w-full bg-[#FAFAFB] pt-6 sm:pt-8">
      <div className="relative overflow-hidden">
        <div
          className={`flex ${animated ? "transition-transform duration-500 ease-out" : ""} ${
            centered ? "mx-auto" : ""
          }`}
          style={{
            width: `${(slides.length / visibleCount) * 100}%`,
            transform: canLoop ? `translateX(-${(offset / slides.length) * 100}%)` : undefined,
          }}
          onTransitionEnd={handleTransitionEnd}
        >
          {slides.map((src, slideIndex) => (
            <div
              key={`${src}-${slideIndex}`}
              className="relative h-80 shrink-0 px-1 lg:h-112"
              style={{ width: `${100 / slides.length}%` }}
            >
              <div className="relative h-full overflow-hidden">
                <Image
                  src={src}
                  alt={`${title} photo ${slideIndex + 1}`}
                  fill
                  sizes={isLg ? "33vw" : "100vw"}
                  className="object-cover object-[50%_30%]"
                  priority={slideIndex < visibleCount + start}
                  unoptimized={isRemoteSrc(src)}
                />
              </div>
            </div>
          ))}
        </div>

        {canLoop && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute top-1/2 left-4 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-gray-400 shadow-(--shadow-card) transition-colors hover:text-orange-500 lg:left-6"
              aria-label="Previous photo"
            >
              <Icon src="/icon/chevron-left.svg" className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute top-1/2 right-4 z-10 flex size-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white text-gray-400 shadow-(--shadow-card) transition-colors hover:text-orange-500 lg:right-6"
              aria-label="Next photo"
            >
              <Icon src="/icon/chevron-right.svg" className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const REVIEW_PAGE_SIZE = 5;
const RATING_FILTERS = [5, 4, 3, 2, 1];

function formatReviewDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}, ${date.getFullYear()}`;
}

function normalizeReview(raw) {
  const rating = Number(raw.rating ?? raw.stars ?? 0) || 0;

  return {
    id: raw.id ?? raw.review_id ?? `${raw.created_at ?? ""}-${raw.name ?? ""}`,
    name: firstString(
      raw.name,
      raw.owner_name,
      raw.ownerName,
      raw.user_name,
      raw.reviewer_name,
      raw.reviewerName,
      "Pet Owner"
    ),
    avatarUrl: firstString(
      raw.avatarUrl,
      raw.avatar_url,
      raw.owner_avatar,
      raw.ownerAvatar
    ),
    date: formatReviewDate(raw.created_at ?? raw.createdAt ?? raw.date),
    rating: Math.min(5, Math.max(0, Math.round(rating))),
    comment: firstString(raw.comment, raw.content, raw.review, raw.text),
  };
}

function FilterStars({ count }) {
  return (
    <span className="flex items-center gap-0.5 text-green">
      {Array.from({ length: count }).map((_, index) => (
        <Icon key={index} src="/icon/star.svg" className="h-4.5 w-4.5" />
      ))}
    </span>
  );
}

function ReviewsSection({ sitterId, ratingAvg, reviewCount }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [summary, setSummary] = useState({
    ratingAvg: Number(ratingAvg) || 0,
    reviewCount: Number(reviewCount) || 0,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const result = await getSitterReviews(sitterId, {
          page,
          limit: REVIEW_PAGE_SIZE,
          rating: ratingFilter,
        });
        if (cancelled) return;
        setReviews(result.data.map(normalizeReview));
        setTotalPages(result.pagination.totalPages ?? 0);
        setSummary({
          ratingAvg:
            Number(result.summary?.rating_avg ?? result.summary?.ratingAvg ?? ratingAvg) || 0,
          reviewCount:
            Number(result.summary?.review_count ?? result.summary?.reviewCount ?? reviewCount) ||
            0,
        });
      } catch {
        if (!cancelled) {
          setReviews([]);
          setTotalPages(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sitterId, page, ratingFilter, ratingAvg, reviewCount]);

  const average = summary.ratingAvg;
  const count = summary.reviewCount;

  function handleFilter(next) {
    setRatingFilter(next);
    setPage(1);
  }

  return (
    <section className="rounded-2xl rounded-tl-[100px] bg-gray-100 p-4">
      <div className="rounded-xl rounded-l-[120px] bg-white p-5">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-10">
          <div className="relative size-36.5 shrink-0">
            <Image
              src="/image/rating.svg"
              alt=""
              width={146}
              height={146}
              className="size-36.5"
              unoptimized
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center pb-2 text-white">
              <span className="text-h3 leading-none">{Number(average).toFixed(1)}</span>
              <span className="mt-1 text-body-3">
                {count} {count === 1 ? "Review" : "Reviews"}
              </span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-h3 text-black">Rating & Reviews</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleFilter(null)}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-body-3 font-medium transition-colors ${
                  ratingFilter == null
                    ? "border-orange-500 text-orange-500"
                    : "border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500"
                }`}
              >
                All Reviews
              </button>
              {RATING_FILTERS.map((rating) => {
                const isSelected = ratingFilter === rating;
                return (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleFilter(isSelected ? null : rating)}
                    className={`group flex cursor-pointer items-center gap-1 rounded-lg border px-2.5 py-1.5 transition-colors ${
                      isSelected
                        ? "border-orange-500 text-orange-500"
                        : "border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500"
                    }`}
                  >
                    <span className="text-body-3 font-medium">{rating}</span>
                    <FilterStars count={rating} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-100 px-5 py-8 sm:px-8 sm:py-10">
          {loading ? (
            <p className="py-10 text-body-2 text-gray-400">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="py-10 text-body-2 text-gray-400">
              {ratingFilter ? "No reviews for this rating" : "No reviews yet"}
            </p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <li
                  key={review.id}
                  className="flex flex-col gap-4 py-8 first:pt-4 sm:flex-row sm:items-start sm:justify-between sm:gap-10"
                >
                  <div className="flex shrink-0 items-center gap-4 sm:w-56">
                    {review.avatarUrl ? (
                      <Image
                        src={review.avatarUrl}
                        alt={review.name}
                        width={56}
                        height={56}
                        className="avatar size-14 shrink-0"
                        unoptimized={isRemoteSrc(review.avatarUrl)}
                      />
                    ) : (
                      <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                        <Icon src="/icon/user.svg" className="h-6 w-6" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-body-2 font-bold text-black">{review.name}</p>
                      {review.date ? (
                        <p className="text-body-3 text-gray-400">{review.date}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    {review.rating > 0 ? <Stars count={review.rating} /> : null}
                    {review.comment ? (
                      <p className="mt-2 text-body-2 text-gray-500">{review.comment}</p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}

        {totalPages > 1 ? (
          <div className="mt-6">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function PetSitterDetail({ sitterId }) {
  const router = useRouter();
  const [sitter, setSitter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingChecking, setBookingChecking] = useState(false);
  const [booking, setBooking] = useState({
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
  });
  const [bookedSlots, setBookedSlots] = useState([]);

  useEffect(() => {
    setIsLoggedIn(Boolean(getUser()));
  }, []);

  useEffect(() => {
    if (!bookingOpen || !sitterId) return;
    let cancelled = false;

    async function loadAvailability() {
      try {
        const data = await getSitterAvailability(sitterId);
        if (!cancelled) setBookedSlots(normalizeBookedSlots(data));
      } catch {
        if (!cancelled) setBookedSlots([]);
      }
    }

    loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [bookingOpen, sitterId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");
      try {
        const data = await getSitter(sitterId);
        if (!cancelled) setSitter(normalizeSitter(data));
      } catch (err) {
        if (!cancelled) {
          setSitter(null);
          setError(err instanceof Error ? err.message : "Failed to load pet sitter");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sitterId]);

  async function handleSendMessage() {
    if (!getToken()) {
      router.push("/login");
      return;
    }
    if (!sitter?.id || sendingMessage) return;

    setSendingMessage(true);
    try {
      const conversation = await createConversation(sitter.id);
      router.push(`/messages?id=${conversation.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start chat", {
        classNames: errorToastClassNames,
      });
    } finally {
      setSendingMessage(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-full bg-[#FAFAFB] px-4 py-16">
        <p className="mx-auto max-w-7xl text-body-2 text-gray-400">Loading pet sitter...</p>
      </div>
    );
  }

  if (error || !sitter) {
    return (
      <div className="min-h-full bg-[#FAFAFB] px-4 py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-4">
          <p className="text-body-2 text-red">{error || "Pet sitter not found"}</p>
          <Link href="/find-sitter" className="btn btn-secondary w-fit">
            Back to search
          </Link>
        </div>
      </div>
    );
  }

  const pinCoords = getSitterCoords(sitter);
  const query = encodeURIComponent(`${pinCoords[0]},${pinCoords[1]}`);
  const mapSrc = `https://maps.google.com/maps?q=${query}&z=15&output=embed`;
  const mapHref = `https://www.google.com/maps/search/?api=1&query=${query}`;
  const isOwnSitter = isOwnSitterListing(sitter.id ?? sitterId);

  function requireLogin(onAllowed) {
    if (isLoggedIn) {
      onAllowed?.();
      return;
    }
    setLoginModalOpen(true);
  }

  async function openBookingIfProfileComplete() {
    if (bookingChecking) return;

    setBookingChecking(true);
    try {
      const profile = await getProfile();
      if (!isOwnerProfileComplete(profile)) {
        setProfileModalOpen(true);
        return;
      }
      setBookingOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load profile", {
        classNames: errorToastClassNames,
      });
    } finally {
      setBookingChecking(false);
    }
  }

  function handleBookNow() {
    if (isOwnSitter) {
      toast.error("You cannot book yourself", {
        classNames: errorToastClassNames,
      });
      return;
    }
    requireLogin(() => {
      void openBookingIfProfileComplete();
    });
  }

  function handleLoginConfirm() {
    setLoginModalOpen(false);
    router.push("/login");
  }

  function handleCompleteProfile() {
    setProfileModalOpen(false);
    const returnTo = `/find-sitter/${sitter.id ?? sitterId}`;
    router.push(`/owner/profile?returnTo=${encodeURIComponent(returnTo)}`);
  }

  function handleBookingChange(patch) {
    setBooking((current) => ({ ...current, ...patch }));
  }

  /** Continue → /owner/booking — many days ส่งแค่วัน · one day ส่งวัน+เวลา */
  function handleBookingContinue(event) {
    event.preventDefault();

    if (isOwnSitter) {
      toast.error("You cannot book yourself", {
        classNames: errorToastClassNames,
      });
      return;
    }

    const { startDate, endDate: bookingEndDate, startTime, endTime } = booking;
    const endDate = bookingEndDate || startDate;
    const isManyDayRange = Boolean(startDate && endDate && endDate > startDate);

    if (!startDate) return;

    if (isManyDayRange) {
      // Step 1a: many days — เช็คแค่วันที่ (ไม่ใช้ time)
      if (!bookingEndDate || bookingEndDate <= startDate) return;

      if (dateRangeOverlapsBooked(startDate, endDate, bookedSlots)) {
        toast.error("This date and time is already booked. Please choose another slot.", {
          classNames: errorToastClassNames,
        });
        return;
      }

      // Step 2a: query เฉพาะ sitterId + startDate + endDate
      const params = new URLSearchParams({
        sitterId: String(sitter.id ?? sitterId),
        startDate,
        endDate,
      });
      setBookingOpen(false);
      router.push(`/owner/booking?${params.toString()}`);
      return;
    }

    // Step 1b: one day — ต้องมีเวลา + กฎเดิม
    if (!startTime || !endTime) return;
    if (!isAtLeastThreeHoursAhead(startDate, startTime)) return;
    if (!isStartBeforeEnd(startDate, startTime, endDate, endTime, false)) return;

    if (
      bookingRangeOverlapsBooked(startDate, endDate, startTime, endTime, bookedSlots)
    ) {
      toast.error("This date and time is already booked. Please choose another slot.", {
        classNames: errorToastClassNames,
      });
      return;
    }

    // Step 2b: one day — startDate/endDate เท่ากัน + time (parseBookingParams รองรับ legacy ?date= ด้วย)
    const params = new URLSearchParams({
      sitterId: String(sitter.id ?? sitterId),
      startDate,
      endDate: startDate,
      startTime,
      endTime,
    });
    setBookingOpen(false);
    router.push(`/owner/booking?${params.toString()}`);
  }

  return (
    <div className="min-h-full bg-[#FAFAFB]">
      <Gallery photos={sitter.photos} title={sitter.title} />

      <div className="bg-[#FAFAFB]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_26rem] lg:items-start lg:gap-16 lg:px-8 lg:py-16">
          <div className="flex min-w-0 flex-col gap-10">
          <h1 className="text-h2 text-black">{sitter.title}</h1>

          {sitter.introduction && (
            <section className="flex flex-col gap-3">
              <h2 className="text-h4 text-black">Introduction</h2>
              <p className="whitespace-pre-line text-body-2 text-gray-400">
                {sitter.introduction}
              </p>
            </section>
          )}

          {sitter.services && (
            <section className="flex flex-col gap-3">
              <h2 className="text-h4 text-black">Services</h2>
              <p className="whitespace-pre-line text-body-2 text-gray-400">
                {sitter.services}
              </p>
            </section>
          )}

          {sitter.myPlace && (
            <section className="flex flex-col gap-3">
              <h2 className="text-h4 text-black">My Place</h2>
              <p className="whitespace-pre-line text-body-2 text-gray-400">
                {sitter.myPlace}
              </p>
            </section>
          )}

          {(sitter.location || sitter.latitude) && (
            <section className="overflow-hidden rounded-2xl border border-gray-100 shadow-xs">
              <div className="relative h-72 w-full bg-gray-100">
                <Map
                  center={pinCoords}
                  zoom={15}
                  selectedId={sitter.id}
                  markers={[
                    {
                      id: sitter.id,
                      position: pinCoords,
                      popup: sitter.title || sitter.sitter_name || "Pet Sitter",
                      isSelected: true,
                    },
                  ]}
                  className="h-full w-full z-0"
                />

              </div>
            </section>
          )}


          <ReviewsSection
            sitterId={sitter.id ?? sitterId}
            ratingAvg={sitter.ratingAvg}
            reviewCount={sitter.reviewCount}
          />
        </div>

        <aside className="z-10 lg:sticky lg:top-28 lg:self-start">
          <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-8 text-center shadow-(--shadow-card)">
            {sitter.avatarUrl ? (
              <Image
                src={sitter.avatarUrl}
                alt={sitter.sitterName || sitter.title}
                width={80}
                height={80}
                className="avatar size-20 shrink-0"
                unoptimized={isRemoteSrc(sitter.avatarUrl)}
              />
            ) : (
              <div className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-300">
                <Icon src="/icon/user.svg" className="h-9 w-9" />
              </div>
            )}

            <h2 className="mt-4 text-h4 text-black">{sitter.title}</h2>

            {(sitter.sitterName || sitter.experience) && (
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
                {sitter.sitterName && (
                  <p className="text-body-2 font-bold text-black">{sitter.sitterName}</p>
                )}
                {sitter.experience && (
                  <span className="text-body-3 font-medium text-green">{sitter.experience}</span>
                )}
              </div>
            )}

            {sitter.rating > 0 && (
              <div className="mt-3">
                <Stars count={sitter.rating} />
              </div>
            )}

            {sitter.location && (
              <div className="mt-3 flex items-center justify-center gap-1.5 text-body-3 text-gray-400">
                <Icon src="/icon/map-pin.svg" className="h-4 w-4" />
                <span>{sitter.location}</span>
              </div>
            )}

            {sitter.petTypes.length > 0 && (
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {sitter.petTypes.map((type) => {
                  const label = type.charAt(0).toUpperCase() + type.slice(1);
                  return (
                    <span key={type} className={`badge ${PET_BADGE[type] ?? ""}`}>
                      {label}
                    </span>
                  );
                })}
              </div>
            )}

            <div className="mt-6 flex w-full flex-col gap-3 border-t border-gray-200 pt-6">
              <div className="flex w-full gap-3">
                <button
                  type="button"
                  className="btn btn-secondary min-w-0 flex-1 px-3"
                  onClick={() => requireLogin(handleSendMessage)}
                  disabled={sendingMessage}
                >
                  {sendingMessage ? "Opening..." : "Send Message"}
                </button>
                <button
                  type="button"
                  className="btn btn-primary min-w-0 flex-1 px-3 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleBookNow}
                  disabled={bookingChecking || isOwnSitter}
                >
                  {bookingChecking ? "Checking..." : "Book Now"}
                </button>
              </div>
              {isOwnSitter ? (
                <p className="text-body-3 text-gray-400">
                  You cannot book your own sitter profile
                </p>
              ) : null}
            </div>
          </div>
        </aside>
        </div>
      </div>

      {loginModalOpen ? (
        <LoginRequiredModal
          onClose={() => setLoginModalOpen(false)}
          onLogin={handleLoginConfirm}
        />
      ) : null}

      {profileModalOpen ? (
        <CompleteProfileModal
          onClose={() => setProfileModalOpen(false)}
          onComplete={handleCompleteProfile}
        />
      ) : null}

      {bookingOpen ? (
        <BookingDateTimeModal
          startDate={booking.startDate}
          endDate={booking.endDate}
          startTime={booking.startTime}
          endTime={booking.endTime}
          bookedSlots={bookedSlots}
          onChange={handleBookingChange}
          onClose={() => setBookingOpen(false)}
          onContinue={handleBookingContinue}
        />
      ) : null}
    </div>
  );
}
