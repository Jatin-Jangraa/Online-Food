# Brew & Bite Cafe

A modern cafe ordering website built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB/Mongoose, NextAuth, Razorpay, Cloudinary, and Zod.

## Features

- Premium responsive cafe homepage with hero, featured items, offers, reviews, hours, contact, Google Maps, newsletter, and WhatsApp order button
- Menu with categories, search, filters, ratings, prices, and cart customizations
- Food customization for size, toppings, quantity, and sugar/spice level
- Cart with quantity updates, remove item, coupon support, tax, delivery charge, and total
- Checkout with delivery/pickup, address form, COD, and Razorpay-ready payment route
- Order confirmation, user dashboard, saved address, order history, and reorder entry points
- Admin dashboard, food/category/order/coupon management screens
- Admin offer and ad banner management for home and menu placements
- Admin product images can be selected from the local device and uploaded to Cloudinary
- Email/password registration, credentials login, and Google OAuth login
- Food review submission and MongoDB rating aggregation
- Multiple image URLs per product
- Table reservation and contact forms
- Dark/light mode, loading states, error state, empty states, SEO metadata
- MongoDB models for User, FoodItem, Category, Order, Coupon, Reservation
- MongoDB models for Review and Offer

## Installation

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

```bash
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/brew-and-bite
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace-with-a-long-random-secret
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Main Folder Structure

```text
src/app                 App Router pages and API routes
src/components          Reusable UI, layout, menu, cart, checkout components
src/context             Client cart state
src/data                Demo seed data for local UI
src/lib                 Database, validation, payment, Cloudinary utilities
src/models              Mongoose models
src/types               Shared TypeScript types
```

## Production Notes

- Add real credentials in `.env.local`.
- Add MongoDB credentials to make admin-created products, coupons, reviews, and offers appear on the public website.
- If MongoDB is unavailable, public product sections fall back to the demo cafe products so the site never opens blank.
- Add Google OAuth credentials in Google Cloud Console and set the callback URL to `/api/auth/callback/google`.
- Add Razorpay Checkout script on the checkout client after order creation.
- Cloudinary credentials are required for local-device product image uploads in `/admin/foods`.
- Admin routes and management APIs are protected with NextAuth role checks. Set a user's `role` to `admin` in MongoDB to access the admin panel.
