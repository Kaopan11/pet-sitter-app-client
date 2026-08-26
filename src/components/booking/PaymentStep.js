import Icon from "@/components/Icon";
import Image from "next/image";

/**
 * Step 3 — Cash หรือ Card (Day 5)
 * Card: จ่ายผ่าน Stripe Payment Element หลัง Confirm (ไม่กรอกเลขบัตรที่นี่)
 * UI ใช้ค่า "card" — API ส่ง paymentMethod: "stripe"
 */
export default function PaymentStep({ paymentMethod, onPaymentMethodChange }) {
  return (
    <section>
      <div className="flex flex-col gap-3 md:flex-row md:gap-4">
        <button
          type="button"
          onClick={() => onPaymentMethodChange("card")}
          className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-4 py-3 text-body-2 font-bold shadow-(--shadow-card) transition-colors md:py-4 md:text-body-1 ${
            paymentMethod === "card"
              ? "border-orange-500 bg-white text-orange-500"
              : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
          }`}
        >
          <Icon src="/icon/credit-card.svg" className="size-5 shrink-0" />
          Credit Card
        </button>

        <button
          type="button"
          onClick={() => onPaymentMethodChange("cash")}
          className={`flex min-h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border-2 px-4 py-3 text-body-2 font-bold shadow-(--shadow-card) transition-colors md:py-4 md:text-body-1 ${
            paymentMethod === "cash"
              ? "border-orange-500 bg-white text-orange-500"
              : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
          }`}
        >
          <Icon src="/icon/wallet.svg" className="size-5 shrink-0" />
          Cash
        </button>
      </div>

      {paymentMethod === "card" ? (
        <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-100 px-4 py-10 text-center sm:mt-8 sm:gap-5 sm:px-6 sm:py-14">
          <Icon src="/icon/credit-card.svg" className="size-12 text-orange-500" />
          <p className="max-w-lg text-body-2 wrap-break-word text-gray-600">
            After you confirm this booking, you will enter your card details
            securely with Stripe.
            <br />
            Test card: 4242 4242 4242 4242
          </p>
        </div>
      ) : (
        <div className="mt-6 flex flex-col items-center justify-center gap-4 rounded-2xl bg-gray-100 px-4 py-10 text-center sm:mt-8 sm:gap-5 sm:px-6 sm:py-14">
          <Image
            src="/image/paw-pink.svg"
            alt=""
            width={80}
            height={80}
            className="opacity-90"
          />
          <p className="max-w-lg text-body-2 wrap-break-word text-gray-600">
            If you want to pay by cash,
            <br />
            you are required to make a cash payment
            <br />
            upon arrival at the pet sitter&apos;s location.
          </p>
        </div>
      )}
    </section>
  );
}
