import { parseBookingParams } from "@/lib/booking";
import BookingFlow from "@/components/booking/BookingFlow";

export const metadata = {
  title: "Booking | Pet Sitter App",
};

/**
 * หน้าจองของ Owner
 * URL ตัวอย่าง:
 * /owner/booking?sitterId=abc-123&date=2023-08-25&startTime=07:00&endTime=10:00
 * query ไม่ครบ / เวลาไม่ถูก → แสดง Invalid booking link
 */
export default async function OwnerBookingPage({ searchParams }) {
  const params = await searchParams;
  const booking = parseBookingParams(params);

  if (!booking.valid) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="card p-8 text-center">
          <h1 className="text-h3 text-gray-900">Invalid booking link</h1>
          <p className="mt-3 text-body-2 text-gray-500">
            {booking.error ??
              "This link is missing required booking details. Please start again from the pet sitter page."}
          </p>
          {booking.missing?.length > 0 && (
            <p className="mt-4 text-body-3 text-gray-400">
              Missing: {booking.missing.join(", ")}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <BookingFlow
      sitterId={booking.sitterId}
      date={booking.date}
      startTime={booking.startTime}
      endTime={booking.endTime}
      hours={booking.hours}
    />
  );
}
