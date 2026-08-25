"use client";

import { useState } from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import Icon from "@/components/Icon";
import { getStripe } from "@/lib/stripe";

function StripeCheckoutForm({ onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!stripe || !elements || submitting) return;

    setSubmitting(true);
    setError("");

    try {
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url: `${window.location.origin}${window.location.pathname}${window.location.search}`,
          },
          redirect: "if_required",
        },
      );

      if (confirmError) {
        setError(confirmError.message || "Payment failed");
        return;
      }

      if (
        paymentIntent &&
        (paymentIntent.status === "succeeded" ||
          paymentIntent.status === "processing")
      ) {
        onSuccess();
        return;
      }

      setError("Payment was not completed. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
    } finally {
      setSubmitting(false);
    }
  }

  const busy = submitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error ? (
        <p className="text-body-3 text-red-500" role="alert">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-orange-100 px-6 text-body-2 font-bold text-orange-500 hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || busy}
          className="inline-flex min-h-12 flex-1 items-center justify-center rounded-full bg-orange-500 px-6 text-body-2 font-bold text-white hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busy ? "Paying..." : "Pay now"}
        </button>
      </div>
    </form>
  );
}

/** Modal หลังได้ clientSecret — Payment Element + confirmPayment */
export default function StripePaymentModal({
  open,
  clientSecret,
  onSuccess,
  onClose,
}) {
  if (!open || !clientSecret) return null;

  const stripePromise = getStripe();
  if (!stripePromise) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="stripe-payment-title"
      >
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-(--shadow-dropdown) sm:p-8">
          <h2
            id="stripe-payment-title"
            className="text-h4 font-bold text-gray-900"
          >
            Card payment
          </h2>
          <p className="mt-4 text-body-3 text-red-500" role="alert">
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Add your pk_test key
            to .env.local.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-orange-100 px-6 text-body-2 font-bold text-orange-500 hover:bg-orange-200"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stripe-payment-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-(--shadow-dropdown) sm:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <h2
            id="stripe-payment-title"
            className="text-h4 font-bold text-gray-900"
          >
            Card payment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close"
          >
            <Icon src="/icon/x.svg" className="size-5" />
          </button>
        </div>

        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: "stripe",
              variables: {
                colorPrimary: "#f97316",
                borderRadius: "12px",
              },
            },
          }}
        >
          <StripeCheckoutForm onSuccess={onSuccess} onCancel={onClose} />
        </Elements>
      </div>
    </div>
  );
}
