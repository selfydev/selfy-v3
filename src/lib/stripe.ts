import Stripe from 'stripe';

// Initialize Stripe - will throw at runtime if key is missing
const stripeKey = process.env['STRIPE_SECRET_KEY'] || 'sk_test_placeholder';
export const stripe = new Stripe(stripeKey, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

export const STRIPE_WEBHOOK_SECRET = process.env['STRIPE_WEBHOOK_SECRET'];
