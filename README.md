# ProImageEdit

ProImageEdit is a professional, high-performance web-based image editing platform built with React, Vite, and Tailwind CSS. It offers a seamless experience for users to upload, edit, and manage their images with integrated authentication and payment systems.

## Features

- **Advanced Image Editing**: Crop, resize, filter, and enhance images directly in the browser.
- **Secure Authentication**: Built-in user signup, login, and social authentication using JWT and bcrypt.
- **Cloud Storage**: Integrated with Vercel Blob for efficient and reliable image storage.
- **Persistent Data**: Powered by Vercel Postgres for user management and image metadata.
- **Payment Integration**: Supports Stripe and Lemon Squeezy for premium features and subscriptions.
- **API Documentation**: Interactive Swagger/OpenAPI documentation for backend services.
- **Modern UI/UX**: Responsive design with a dark mode aesthetic and smooth micro-interactions.

## Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React (icons)
- **Backend**: Node.js (Vercel Serverless Functions)
- **Database**: Vercel Postgres
- **Storage**: Vercel Blob
- **Payments**: Stripe, Lemon Squeezy
- **Security**: JWT, bcryptjs

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Vercel CLI (optional for deployment)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/RDMjagreeLabs/pro-image-edit.git
   cd pro-image-edit
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a .env file in the root directory and add the required keys (see .env.example).

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The project is optimized for deployment on **Vercel**. Connect your repository to Vercel, and it will automatically detect the configuration from vercel.json and vite.config.js.

## API Reference

You can view the API documentation locally or on the deployed site at /swagger.json or through the interactive UI if configured.

---

Built with ❤️ by [Deepakumar Subbian](https://github.com/DeepakumarSubbian)
