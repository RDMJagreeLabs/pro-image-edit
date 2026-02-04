# Payment Integration Setup

## Quick Start

ProImageEdit now supports real payment processing via **Stripe** and **Lemon Squeezy**!

## Configuration Steps

### 1. Get Your API Keys

**Stripe:**
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. (Optional) Create Payment Links for Pro and Enterprise plans

**Lemon Squeezy:**
1. Go to https://app.lemonsqueezy.com/settings/api
2. Note your **Store ID**
3. Create products for Pro and Enterprise plans
4. Note the **Product IDs** (variant IDs)

### 2. Update Environment Variables

Edit `web-app/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_key_here
VITE_LEMONSQUEEZY_STORE_ID=your_store_name
VITE_LEMONSQUEEZY_PRODUCT_ID_PRO=123456
VITE_LEMONSQUEEZY_PRODUCT_ID_ENTERPRISE=789012
```

### 3. Configure Payment Links (Stripe)

For production, update `src/services/stripe.js` with your actual Payment Link URLs created in the Stripe Dashboard.

### 4. Test the Integration

1. Start the dev server: `npm run dev`
2. Navigate to the Pricing tab
3. Click "Start Free Trial" on the Pro plan
4. Select Stripe or Lemon Squeezy
5. Click "Pay with..." button

You should be redirected to the respective checkout page!

## Important Notes

- **Security**: Never commit `.env` files to Git (already in `.gitignore`)
- **Production**: Use live keys (`pk_live_...`) for production deployments
- **Webhooks**: For subscription management, set up webhook endpoints (requires backend)

## Troubleshooting

**"Payment link not configured"**: Update the payment links in `src/services/stripe.js`

**"Lemon Squeezy not configured"**: Ensure all `VITE_LEMONSQUEEZY_*` variables are set in `.env`

**Redirect not working**: Check browser console for errors and verify API keys are correct
