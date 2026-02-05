# Requirements: Deployment Configuration

## Overview
ProImageEdit is deployed as a static site (SPA) using Vercel. The deployment process is automated through GitHub integration.

## Configuration Requirements

### 1. Production URL
- **Primary Domain**: `pro-image-edit.vercel.app`
- SSL/TLS must be enabled and enforced (HTTPS).

### 2. Build Settings
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

### 3. SPA Routing
- The deployment must handle client-side routing.
- A `vercel.json` file should be present to redirect all requests to `index.html`.

### 4. Environment Variables
- `VITE_STRIPE_PUBLIC_KEY`: For payment integration.
- `VITE_LEMON_SQUEEZY_API_KEY`: For payment integration.
- `VITE_SUPABASE_URL`: For authentication and database.
- `VITE_SUPABASE_ANON_KEY`: For authentication and database.

## Technical Implementation Notes
- Ensure `vercel.json` is in the root directory.
- GitHub Actions or Vercel's built-in CI/CD is used for automatic deployments on push to `main`.
