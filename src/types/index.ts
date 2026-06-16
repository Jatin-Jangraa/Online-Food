export type Category = {
  id: string;
  name: string;
  description: string;
  image: string;
};

export type FoodItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  images?: string[];
  price: number;
  rating: number;
  reviews: number;
  tags: string[];
  isFeatured?: boolean;
  isVeg?: boolean;
  customizations: {
    sizes: { label: string; price: number }[];
    toppings: { label: string; price: number }[];
    levels: string[];
  };
};

export type Review = {
  id: string;
  foodId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt?: string;
};

export type ContactNotification = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: "New" | "Read" | "Archived";
  createdAt?: string;
};

export type CheckoutAddress = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  city: string;
  pincode: string;
};

export type Offer = {
  id: string;
  title: string;
  subtitle: string;
  code?: string;
  image: string;
  foodId?: string;
  ctaLabel: string;
  ctaHref: string;
  placement: "home-hero" | "home-banner" | "menu-banner";
  isActive: boolean;
};

export type CartItem = {
  cartId: string;
  foodId: string;
  name: string;
  image: string;
  basePrice: number;
  quantity: number;
  size: string;
  toppings: string[];
  level: string;
  lineTotal: number;
};

export type OrderStatus =
  | "Pending"
  | "Preparing"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled";

export type DeliveryPartnerLocation = {
  name?: string;
  phone?: string;
  vehicle?: string;
  latitude?: number;
  longitude?: number;
  etaMinutes?: number;
  updatedAt?: string;
};

export type LiveOrder = {
  id: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    size?: string;
    toppings?: string[];
    level?: string;
    price: number;
  }[];
  total: number;
  subtotal?: number;
  tax?: number;
  deliveryCharge?: number;
  discount?: number;
  status: OrderStatus;
  paymentMethod?: string;
  paymentStatus?: string;
  fulfillment?: string;
  couponCode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryPartner?: DeliveryPartnerLocation;
  address?: {
    name?: string;
    email?: string;
    phone?: string;
    line1?: string;
    city?: string;
    pincode?: string;
  };
};

export type MonthlySale = {
  label: string;
  total: number;
  orders: number;
};
