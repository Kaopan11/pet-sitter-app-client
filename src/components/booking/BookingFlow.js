"use client";

/**
 * ตัวควบคุมหลักของ Owner Booking
 * Day 2–3: โหลด sitter / pets / guest
 * Day 4: Confirm cash → POST → Thank You
 * Day 5: Confirm card → POST stripe → Payment Element → Thank You
 */

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BookingStepper from "@/components/booking/BookingStepper";
import BookingDetailSidebar from "@/components/booking/BookingDetailSidebar";
import YourPetStep from "@/components/booking/YourPetStep";
import InformationStep from "@/components/booking/InformationStep";
import PaymentStep from "@/components/booking/PaymentStep";
import ConfirmBookingModal from "@/components/booking/ConfirmBookingModal";
import StripePaymentModal from "@/components/booking/StripePaymentModal";
import ThankYouView from "@/components/booking/ThankYouView";
import { EMPTY_GUEST } from "@/components/booking/mockBookingData";
import { createBooking, getMyPets, getProfile, getSitter } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { getStripePublishableKey } from "@/lib/stripe";
import {
  normalizeBookingGuest,
  normalizeBookingPet,
  normalizeBookingSitter,
  calculateBookingTotal,
} from "@/lib/booking";

const TOTAL_STEPS = 3;

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** UI "card" → API "stripe" */
function toApiPaymentMethod(uiMethod) {
  return uiMethod === "card" ? "stripe" : "cash";
}

export default function BookingFlow({
  sitterId,
  date,
  startTime,
  endTime,
  hours,
}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedPetIds, setSelectedPetIds] = useState([]);
  const [guest, setGuest] = useState(EMPTY_GUEST);
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [bookingResult, setBookingResult] = useState(null);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripePaymentOpen, setStripePaymentOpen] = useState(false);

  const [sitter, setSitter] = useState(null);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBookingData() {
      if (!getToken()) {
        router.replace("/login/owner");
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [sitterRaw, petsRaw, profileRaw] = await Promise.all([
          getSitter(sitterId),
          getMyPets(),
          getProfile(),
        ]);

        if (cancelled) return;

        const nextSitter = normalizeBookingSitter(sitterRaw);
        if (!nextSitter?.id) {
          throw new Error("Pet sitter not found");
        }

        const nextPets = (Array.isArray(petsRaw) ? petsRaw : [])
          .map(normalizeBookingPet)
          .filter((pet) => pet?.id);

        setSitter(nextSitter);
        setPets(nextPets);
        setGuest(normalizeBookingGuest(profileRaw));
        setSelectedPetIds([]);
      } catch (err) {
        if (!cancelled) {
          setSitter(null);
          setPets([]);
          setGuest(EMPTY_GUEST);
          setError(err instanceof Error ? err.message : "Failed to load booking data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadBookingData();
    return () => {
      cancelled = true;
    };
  }, [sitterId, router]);

  const selectedPets = useMemo(
    () => pets.filter((pet) => selectedPetIds.includes(pet.id)),
    [pets, selectedPetIds],
  );

  const sitterPetTypes = sitter?.petTypes ?? [];

  const hasEligibleSelection = selectedPets.some((pet) =>
    sitterPetTypes.includes(String(pet.petType).toLowerCase()),
  );

  const canConfirm =
    hasEligibleSelection &&
    (paymentMethod === "cash" || paymentMethod === "card");

  function togglePet(petId) {
    const id = String(petId);
    setSelectedPetIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function goNext() {
    if (step < TOTAL_STEPS) setStep((current) => current + 1);
  }

  function goBack() {
    if (step > 1) {
      setStep((current) => current - 1);
      return;
    }
    router.push(`/find-sitter/${sitterId}`);
  }

  function buildPetIds() {
    return selectedPets
      .filter((pet) =>
        sitterPetTypes.includes(String(pet.petType).toLowerCase()),
      )
      .map((pet) => Number(pet.id))
      .filter((id) => Number.isFinite(id) && id > 0);
  }

  function handleConfirmBooking() {
    if (!canConfirm) return;
    setConfirmError("");
    setConfirmOpen(true);
  }

  async function handleConfirmYes() {
    if (submitting || !canConfirm) return;

    const petIds = buildPetIds();
    if (petIds.length < 1) {
      setConfirmError("Please select at least one eligible pet.");
      return;
    }

    if (!Number.isInteger(hours) || hours <= 0) {
      setConfirmError(
        "Booking duration must be whole hours (for example 10:00–13:00).",
      );
      return;
    }

    const apiPaymentMethod = toApiPaymentMethod(paymentMethod);

    if (apiPaymentMethod === "stripe" && !getStripePublishableKey()) {
      setConfirmError(
        "Card payment is not configured. Add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to .env.local.",
      );
      return;
    }

    setSubmitting(true);
    setConfirmError("");

    try {
      const data = await createBooking({
        sitterId,
        date,
        startTime,
        endTime,
        petIds,
        message: additionalMessage,
        paymentMethod: apiPaymentMethod,
      });

      setBookingResult(data ?? null);

      if (apiPaymentMethod === "stripe") {
        const clientSecret = data?.clientSecret;
        if (!clientSecret) {
          setConfirmError(
            "Booking was created but card payment could not start. Please contact support or try Cash.",
          );
          return;
        }
        setStripeClientSecret(clientSecret);
        setConfirmOpen(false);
        setStripePaymentOpen(true);
        return;
      }

      setConfirmOpen(false);
      setIsCompleted(true);
    } catch (err) {
      setConfirmError(
        err instanceof Error ? err.message : "Failed to create booking",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleCloseConfirm() {
    if (submitting) return;
    setConfirmOpen(false);
    setConfirmError("");
  }

  function handleStripePaymentSuccess() {
    setStripePaymentOpen(false);
    setStripeClientSecret("");
    setIsCompleted(true);
  }

  function handleCloseStripePayment() {
    setStripePaymentOpen(false);
    setStripeClientSecret("");
  }

  const canGoNext = step === 1 ? hasEligibleSelection : true;

  const previewTotal = useMemo(
    () => calculateBookingTotal(hours, selectedPets.length),
    [hours, selectedPets.length],
  );

  const detailProps = {
    sitter,
    date,
    startTime,
    endTime,
    hours,
    selectedPets,
  };

  function renderNavButtons({ fullWidth = false } = {}) {
    const widthClass = fullWidth
      ? "min-w-0 flex-1"
      : "min-w-24 sm:min-w-30 sm:flex-none";
    const confirmWidth = fullWidth
      ? "min-w-0 flex-1"
      : "min-w-24 sm:min-w-40 sm:flex-none";

    return (
      <>
        <button
          type="button"
          onClick={goBack}
          className={`inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full bg-orange-100 px-6 text-body-2 font-bold text-orange-500 hover:bg-orange-200 sm:px-8 ${widthClass}`}
        >
          Back
        </button>

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext}
            className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-body-2 font-bold sm:px-8 ${widthClass} ${
              canGoNext
                ? "cursor-pointer bg-orange-500 text-white hover:bg-orange-400"
                : "cursor-not-allowed bg-gray-100 text-gray-300"
            }`}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleConfirmBooking}
            disabled={!canConfirm}
            className={`inline-flex min-h-12 items-center justify-center rounded-full px-4 text-body-2 font-bold sm:px-8 ${confirmWidth} ${
              canConfirm
                ? "cursor-pointer bg-orange-500 text-white hover:bg-orange-400"
                : "cursor-not-allowed bg-gray-100 text-gray-300"
            }`}
          >
            Confirm Booking
          </button>
        )}
      </>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-300 px-4 py-16 sm:px-8">
        <p className="text-body-2 text-gray-400">Loading booking details...</p>
      </div>
    );
  }

  if (error || !sitter) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-8">
        <div className="card space-y-4 p-8 text-center">
          <h1 className="text-h3 text-gray-900">Could not load booking</h1>
          <p className="text-body-2 text-gray-500">
            {error || "Pet sitter not found"}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/find-sitter" className="btn btn-secondary">
              Back to search
            </Link>
            <Link href="/login/owner" className="btn btn-primary">
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <ThankYouView
        sitter={sitter}
        date={date}
        startTime={startTime}
        endTime={endTime}
        hours={hours}
        selectedPets={selectedPets}
        transactionNo={
          bookingResult?.bookingId != null
            ? String(bookingResult.bookingId)
            : bookingResult?.id != null
              ? String(bookingResult.id)
              : ""
        }
        totalPrice={
          typeof bookingResult?.totalPrice === "number"
            ? bookingResult.totalPrice
            : Number(bookingResult?.totalPrice)
        }
      />
    );
  }

  return (
    <div className="relative" style={{ minHeight: "calc(100vh - 5rem)" }}>
      <Image
        src="/image/star-green-arc-blue.svg"
        alt=""
        width={388}
        height={300}
        className="pointer-events-none absolute right-0 bottom-0 z-0 hidden w-80 lg:block"
        aria-hidden
      />

      {/* pb สำรองพื้นที่ sticky footer บน mobile */}
      <div className="relative z-10 mx-auto max-w-300 px-4 pt-6 pb-36 sm:px-8 md:py-8 md:pb-8">
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-stretch md:gap-6">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <BookingStepper currentStep={step} />

            <div className="flex flex-1 flex-col rounded-2xl bg-white shadow-(--shadow-card)">
              <div className="flex-1 px-4 pt-6 pb-6 sm:px-10 sm:pt-8 md:pb-0">
                {step === 1 && (
                  <YourPetStep
                    pets={pets}
                    sitterPetTypes={sitterPetTypes}
                    selectedPetIds={selectedPetIds}
                    onTogglePet={togglePet}
                  />
                )}

                {step === 2 && (
                  <InformationStep
                    guest={guest}
                    additionalMessage={additionalMessage}
                    onMessageChange={setAdditionalMessage}
                  />
                )}

                {step === 3 && (
                  <PaymentStep
                    paymentMethod={paymentMethod}
                    onPaymentMethodChange={setPaymentMethod}
                  />
                )}
              </div>

              {/* Desktop: ปุ่มอยู่ในการ์ดขั้นตอน */}
              <div className="hidden items-center justify-between gap-4 px-6 py-8 sm:px-10 md:flex">
                {renderNavButtons()}
              </div>
            </div>

            {/* Mobile: Booking Detail ใต้เนื้อหา (Total อยู่ sticky) */}
            <div className="md:hidden">
              <BookingDetailSidebar {...detailProps} hideTotal />
            </div>
          </div>

          {/* Desktop: sidebar + Total */}
          <div className="hidden md:block">
            <BookingDetailSidebar {...detailProps} />
          </div>
        </div>

        <ConfirmBookingModal
          open={confirmOpen}
          onClose={handleCloseConfirm}
          onConfirm={handleConfirmYes}
          submitting={submitting}
          error={confirmError}
        />

        <StripePaymentModal
          open={stripePaymentOpen}
          clientSecret={stripeClientSecret}
          onSuccess={handleStripePaymentSuccess}
          onClose={handleCloseStripePayment}
        />
      </div>

      {/* Mobile sticky: Total + Back/Next ตาม Figma */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
        <div className="flex items-center justify-between bg-black px-4 py-3.5 text-white">
          <span className="text-body-2 font-medium">Total</span>
          <span className="text-body-1 font-bold">
            {formatCurrency(previewTotal)} THB
          </span>
        </div>
        <div className="flex gap-3 border-t border-gray-100 bg-white px-4 py-4">
          {renderNavButtons({ fullWidth: true })}
        </div>
      </div>
    </div>
  );
}
