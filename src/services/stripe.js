import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Create a Stripe checkout session for a plan
 * For production, this would call your backend API
 * For now, we'll use Stripe Payment Links (configured in Stripe Dashboard)
 */
export const createStripeCheckout = async (plan) => {
    try {
        const stripe = await stripePromise;

        if (!stripe) {
            throw new Error('Stripe failed to initialize');
        }

        // In production, you'd create a checkout session via your backend
        // For now, redirect to a pre-configured Payment Link
        // You can create Payment Links in your Stripe Dashboard

        const paymentLinks = {
            'Pro': 'https://buy.stripe.com/test_your_payment_link_pro',
            'Enterprise': 'https://buy.stripe.com/test_your_payment_link_enterprise'
        };

        const paymentLink = paymentLinks[plan.name];

        if (!paymentLink) {
            throw new Error('Payment link not configured for this plan');
        }

        // Redirect to Stripe Checkout
        window.location.href = paymentLink;

        return { success: true };
    } catch (error) {
        console.error('Stripe checkout error:', error);
        throw error;
    }
};

/**
 * Alternative: Backend-based checkout (recommended for production)
 * Uncomment this when you have a backend server
 */
/*
export const createStripeCheckoutWithBackend = async (plan) => {
  try {
    // Call your backend to create a checkout session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        priceId: plan.stripePriceId,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/pricing`
      })
    });

    const { sessionId } = await response.json();
    const stripe = await stripePromise;
    
    // Redirect to Stripe Checkout
    const { error } = await stripe.redirectToCheckout({ sessionId });
    
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error('Stripe checkout error:', error);
    throw error;
  }
};
*/
