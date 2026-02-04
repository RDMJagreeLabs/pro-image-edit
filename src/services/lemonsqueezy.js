/**
 * Lemon Squeezy Checkout Integration
 * Docs: https://docs.lemonsqueezy.com/guides/developer-guide/taking-payments
 */

const STORE_ID = import.meta.env.VITE_LEMONSQUEEZY_STORE_ID;
const PRODUCT_IDS = {
    'Pro': import.meta.env.VITE_LEMONSQUEEZY_PRODUCT_ID_PRO,
    'Enterprise': import.meta.env.VITE_LEMONSQUEEZY_PRODUCT_ID_ENTERPRISE
};

/**
 * Create a Lemon Squeezy checkout URL and redirect
 */
export const createLemonSqueezyCheckout = async (plan) => {
    try {
        const productId = PRODUCT_IDS[plan.name];

        if (!productId || !STORE_ID) {
            throw new Error('Lemon Squeezy not configured. Please add VITE_LEMONSQUEEZY_STORE_ID and product IDs to .env');
        }

        // Construct checkout URL
        // Format: https://yourstorename.lemonsqueezy.com/checkout/buy/{variant-id}
        const checkoutUrl = `https://${STORE_ID}.lemonsqueezy.com/checkout/buy/${productId}`;

        // Optional: Add custom data, discount codes, etc. via query params
        const params = new URLSearchParams({
            checkout: JSON.stringify({
                custom: {
                    user_id: 'user_123' // Replace with actual user ID
                }
            })
        });

        // Redirect to Lemon Squeezy checkout
        window.location.href = `${checkoutUrl}?${params.toString()}`;

        return { success: true };
    } catch (error) {
        console.error('Lemon Squeezy checkout error:', error);
        throw error;
    }
};

/**
 * Alternative: Use Lemon Squeezy JS SDK for embedded checkout
 * Requires: import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
 */
export const createLemonSqueezyEmbeddedCheckout = async (plan) => {
    try {
        // This would be the newer embedded checkout approach
        // Requires additional setup and Lemon Squeezy JS library configuration

        throw new Error('Embedded checkout not yet implemented. Use redirect method.');
    } catch (error) {
        console.error('Lemon Squeezy embedded checkout error:', error);
        throw error;
    }
};
