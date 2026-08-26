import { loadStripe } from "@stripe/stripe-js";

let stripePromise;

/** Publishable key เท่านั้น — ห้ามใส่ sk_ ฝั่ง FE */
export function getStripePublishableKey() {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() || "";
}

export function getStripe() {
  const key = getStripePublishableKey();
  if (!key) return null;
  if (!stripePromise) {
    stripePromise = loadStripe(key);
  }
  return stripePromise;
}
