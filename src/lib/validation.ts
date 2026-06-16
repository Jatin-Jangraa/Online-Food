import { z } from "zod";

export const addressSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  line1: z.string().min(5, "Address line is required"),
  city: z.string().min(2, "City is required"),
  pincode: z.string().min(5, "Pincode is required"),
});

export const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});

export const reservationSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(10),
  date: z.string().min(1),
  time: z.string().min(1),
  guests: z.coerce.number().min(1).max(12),
});

export const foodItemSchema = z.object({
  name: z.string().min(2, "Food name is required"),
  category: z.string().min(2, "Choose a category"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive(),
  image: z.string().url("Upload an image or provide a valid image URL"),
  images: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).default(0),
  tags: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isVeg: z.coerce.boolean().optional(),
  offerBadge: z.string().optional(),
  offerPrice: z.coerce.number().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  discountType: z.enum(["percent", "flat"]),
  value: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0).optional(),
  expiresAt: z.string().min(1),
});

export const reviewSchema = z.object({
  foodId: z.string().min(1),
  userName: z.string().min(2).optional(),
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().min(4).max(500),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const offerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().min(5),
  code: z.string().optional(),
  image: z.string().url(),
  foodId: z.string().optional(),
  ctaLabel: z.string().min(2).default("Order now"),
  ctaHref: z.string().min(1).default("/menu"),
  placement: z.enum(["home-hero", "home-banner", "menu-banner"]).default("home-banner"),
  isActive: z.coerce.boolean().optional(),
});
