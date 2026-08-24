"use client";

/**
 * ตัวควบคุมหลักของ Owner Booking
 * Day 2: ดึง sitter + pets จาก API จริง (ยังไม่ POST booking)
 * Step: 1 Your Pet → 2 Information → 3 Payment → Confirm → Thank You
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
import ThankYouView from "@/components/booking/ThankYouView";
import { MOCK_GUEST } from "@/components/booking/mockBookingData";
import { getMyPets, getSitter } from "@/lib/api";
import { getToken } from "@/lib/auth";
import {
  normalizeBookingPet,
  normalizeBookingSitter,
} from "@/lib/booking";

const TOTAL_STEPS = 3;

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
  const [guest, setGuest] = useState(MOCK_GUEST);
  const [additionalMessage, setAdditionalMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

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
        const [sitterRaw, petsRaw] = await Promise.all([
          getSitter(sitterId),
          getMyPets(),
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
        setSelectedPetIds([]);
      } catch (err) {
        if (!cancelled) {
          setSitter(null);
          setPets([]);
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

  // ต้องมีอย่างน้อย 1 ตัวที่ sitter รับได้ ถึง Next/Confirm ได้
  const hasEligibleSelection = selectedPets.some((pet) =>
    sitterPetTypes.includes(String(pet.petType).toLowerCase()),
  );

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
    if (step > 1) setStep((current) => current - 1);
  }

  function handleConfirmBooking() {
    if (!hasEligibleSelection) return;
    setConfirmOpen(true);
  }

  // ยังไม่ POST booking — แค่ไปหน้า Thank You (mock) จน Day 4
  function handleConfirmYes() {
    setConfirmOpen(false);
    setIsCompleted(true);
  }

  const canGoNext = step === 1 ? hasEligibleSelection : true;

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
        paymentMethod={paymentMethod}
      />
    );
  }

  return (
    <div className="relative" style={{ minHeight: "calc(100vh - 5rem)" }}>
      {/* ลายตกแต่งมุมขวาล่าง (ชิดขอบจอ) */}
      <Image
        src="/image/star-green-arc-blue.svg"
        alt=""
        width={388}
        height={300}
        className="pointer-events-none absolute right-0 bottom-0 z-0 hidden w-80 lg:block"
        aria-hidden
      />

      <div className="relative z-10 mx-auto max-w-300 px-4 py-8 sm:px-8">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-stretch">
          {/* คอลัมน์ซ้าย: stepper + เนื้อหา step */}
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <BookingStepper currentStep={step} />

            <div className="flex flex-1 flex-col rounded-2xl bg-white shadow-(--shadow-card)">
              <div className="flex-1 px-6 pt-8 sm:px-10">
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
                    onGuestChange={setGuest}
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

              <div className="flex items-center justify-between gap-4 px-6 py-8 sm:px-10">
                <button
                  type="button"
                  onClick={goBack}
                  className="inline-flex min-h-12 min-w-30 items-center justify-center rounded-full bg-orange-100 px-8 text-body-2 font-bold text-orange-500 hover:bg-orange-200"
                >
                  Back
                </button>

                {step < TOTAL_STEPS ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canGoNext}
                    className={`inline-flex min-h-12 min-w-30 items-center justify-center rounded-full px-8 text-body-2 font-bold ${
                      canGoNext
                        ? "bg-orange-500 text-white hover:bg-orange-400"
                        : "cursor-not-allowed bg-gray-100 text-gray-300"
                    }`}
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConfirmBooking}
                    disabled={!hasEligibleSelection}
                    className={`inline-flex min-h-12 min-w-40 items-center justify-center rounded-full px-8 text-body-2 font-bold ${
                      hasEligibleSelection
                        ? "bg-orange-500 text-white hover:bg-orange-400"
                        : "cursor-not-allowed bg-gray-100 text-gray-300"
                    }`}
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* คอลัมน์ขวา: สรุปการจอง + ยอดรวม preview */}
          <BookingDetailSidebar
            sitter={sitter}
            date={date}
            startTime={startTime}
            endTime={endTime}
            hours={hours}
            selectedPets={selectedPets}
          />
        </div>

        <ConfirmBookingModal
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={handleConfirmYes}
        />
      </div>
    </div>
  );
}
