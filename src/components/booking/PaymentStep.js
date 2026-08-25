import Icon from "@/components/Icon";
import Image from "next/image";

/** Step 3 — Cash ใช้จองได้ (Day 4); Card ยัง placeholder จน Stripe */
export default function PaymentStep({ paymentMethod, onPaymentMethodChange }) {
  return (
    <section>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => onPaymentMethodChange("card")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 px-4 py-4 text-body-1 font-bold shadow-(--shadow-card) transition-colors ${
            paymentMethod === "card"
              ? "border-orange-500 bg-white text-orange-500"
              : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
          }`}
        >
          <Icon src="/icon/credit-card.svg" className="size-5" />
          Credit Card
        </button>

        <button
          type="button"
          onClick={() => onPaymentMethodChange("cash")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-full border-2 px-4 py-4 text-body-1 font-bold shadow-(--shadow-card) transition-colors ${
            paymentMethod === "cash"
              ? "border-orange-500 bg-white text-orange-500"
              : "border-gray-200 bg-white text-gray-400 hover:border-gray-300"
          }`}
        >
          <Icon src="/icon/wallet.svg" className="size-5" />
          Cash
        </button>
      </div>

      {paymentMethod === "card" ? (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label
              htmlFor="card-number"
              className="mb-2 block text-body-2 font-medium text-gray-600"
            >
              Card Number<span className="text-orange-500">*</span>
            </label>
            <input
              id="card-number"
              type="text"
              className="input"
              placeholder="xxx-xxxx-x-xx-xx"
              autoComplete="cc-number"
            />
          </div>

          <div>
            <label
              htmlFor="card-owner"
              className="mb-2 block text-body-2 font-medium text-gray-600"
            >
              Card Owner<span className="text-orange-500">*</span>
            </label>
            <input
              id="card-owner"
              type="text"
              className="input"
              placeholder="Card owner name"
              autoComplete="cc-name"
            />
          </div>

          <div>
            <label
              htmlFor="card-expiry"
              className="mb-2 block text-body-2 font-medium text-gray-600"
            >
              Expiry Date<span className="text-orange-500">*</span>
            </label>
            <input
              id="card-expiry"
              type="text"
              className="input"
              placeholder="xxx-xxx-xxxx"
              autoComplete="cc-exp"
            />
          </div>

          <div>
            <label
              htmlFor="card-cvc"
              className="mb-2 block text-body-2 font-medium text-gray-600"
            >
              CVC/CVV<span className="text-orange-500">*</span>
            </label>
            <input
              id="card-cvc"
              type="text"
              className="input"
              placeholder="xxx"
              autoComplete="cc-csc"
            />
          </div>
        </div>
      ) : (
        <div className="mt-8 flex flex-col items-center justify-center gap-5 rounded-2xl bg-gray-100 px-6 py-14 text-center">
          <Image
            src="/image/paw-pink.svg"
            alt=""
            width={80}
            height={80}
            className="opacity-90"
          />
          <p className="max-w-lg text-body-2 text-gray-600">
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
