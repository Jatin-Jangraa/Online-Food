import { categories, foodItems, reviews as seedReviews } from "@/data/seed";
import { connectDB } from "@/lib/db";
import { Category } from "@/models/Category";
import { ContactMessage } from "@/models/ContactMessage";
import { FoodItem as FoodModel } from "@/models/FoodItem";
import { Offer as OfferModel } from "@/models/Offer";
import { Order as OrderModel } from "@/models/Order";
import { Review as ReviewModel } from "@/models/Review";
import { User } from "@/models/User";
import { ContactNotification, FoodItem, LiveOrder, MonthlySale, Offer, Review } from "@/types";

const defaultCustomizations = {
  sizes: [
    { label: "Regular", price: 0 },
    { label: "Large", price: 80 },
  ],
  toppings: [
    { label: "Extra cheese", price: 60 },
    { label: "Caramel drizzle", price: 45 },
    { label: "Roasted nuts", price: 55 },
  ],
  levels: ["Low sugar", "Balanced", "Extra sweet", "Mild spice", "Medium spice", "Hot"],
};

function serializeFood(item: Record<string, unknown>): FoodItem {
  const id = String(item._id ?? item.id);
  const customizations = item.customizations as FoodItem["customizations"] | undefined;
  return {
    id,
    name: String(item.name),
    category: String(item.categorySlug ?? item.category ?? "coffee"),
    description: String(item.description),
    image: String(item.image),
    images: Array.isArray(item.images) ? (item.images as string[]) : [String(item.image)],
    price: Number(item.price ?? 0),
    rating: Number(item.rating ?? 0),
    reviews: Number(item.reviews ?? 0),
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : [],
    isFeatured: Boolean(item.isFeatured),
    isVeg: item.isVeg !== false,
    customizations: customizations?.sizes?.length ? customizations : defaultCustomizations,
  };
}

function serializeOffer(item: Record<string, unknown>): Offer {
  return {
    id: String(item._id ?? item.id),
    title: String(item.title),
    subtitle: String(item.subtitle),
    code: item.code ? String(item.code) : undefined,
    image: String(item.image),
    foodId: item.foodItem ? String(item.foodItem) : undefined,
    ctaLabel: String(item.ctaLabel ?? "Order now"),
    ctaHref: String(item.ctaHref ?? "/menu"),
    placement: (item.placement as Offer["placement"]) ?? "home-banner",
    isActive: item.isActive !== false,
  };
}

function serializeContactMessage(item: Record<string, unknown>): ContactNotification {
  return {
    id: String(item._id ?? item.id),
    name: String(item.name),
    email: String(item.email),
    message: String(item.message),
    status: (item.status as ContactNotification["status"]) ?? "New",
    createdAt: item.createdAt ? new Date(String(item.createdAt)).toLocaleString("en-IN") : undefined,
  };
}

export async function getLiveFoodItems(options: { featuredOnly?: boolean; limit?: number } = {}) {
  if (!process.env.MONGODB_URI) return foodItems;
  try {
    await connectDB();
    const query = {
      isAvailable: true,
      ...(options.featuredOnly ? { isFeatured: true } : {}),
    };
    const request = FoodModel.find(query).sort({ createdAt: -1 });
    if (options.limit) request.limit(options.limit);
    const items = await request.lean();
    const fallback = options.featuredOnly ? foodItems.filter((item) => item.isFeatured).slice(0, options.limit) : foodItems;
    return items.length ? items.map((item) => serializeFood(item)) : fallback;
  } catch {
    const fallback = options.featuredOnly ? foodItems.filter((item) => item.isFeatured).slice(0, options.limit) : foodItems;
    return fallback;
  }
}

export async function getContactNotifications() {
  if (!process.env.MONGODB_URI) return [];
  try {
    await connectDB();
    const items = await ContactMessage.find().sort({ createdAt: -1 }).lean();
    return items.map((item) => serializeContactMessage(item));
  } catch {
    return [];
  }
}

export async function getUnreadContactMessageCount() {
  if (!process.env.MONGODB_URI) return 0;
  try {
    await connectDB();
    return ContactMessage.countDocuments({ status: "New" });
  } catch {
    return 0;
  }
}

export async function getLiveCategories() {
  if (!process.env.MONGODB_URI) return categories;
  try {
    await connectDB();
    const items = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
    return items.length
      ? items.map((item) => ({
          id: String(item.slug ?? item._id),
          name: String(item.name),
          description: String(item.description ?? ""),
          image: String(item.image ?? categories[0].image),
        }))
      : categories;
  } catch {
    return categories;
  }
}

export async function getLiveOffers() {
  if (!process.env.MONGODB_URI) return [];
  try {
    await connectDB();
    const items = await OfferModel.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    return items.map((item) => serializeOffer(item));
  } catch {
    return [];
  }
}

export async function getLiveReviews() {
  if (!process.env.MONGODB_URI) {
    return seedReviews.map((review, index) => ({
      id: `seed-review-${index}`,
      foodId: "seed",
      userName: review.name,
      rating: review.rating,
      comment: review.text,
    }));
  }
  try {
    await connectDB();
    const items = await ReviewModel.find({ isApproved: true }).sort({ createdAt: -1 }).limit(6).lean();
    if (!items.length) {
      return seedReviews.map((review, index) => ({
        id: `seed-review-${index}`,
        foodId: "seed",
        userName: review.name,
        rating: review.rating,
        comment: review.text,
      }));
    }
    return items.map((item) => ({
      id: String(item._id),
      foodId: String(item.foodItem),
      userName: String(item.userName),
      rating: Number(item.rating ?? 5),
      comment: String(item.comment),
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : undefined,
    })) satisfies Review[];
  } catch {
    return seedReviews.map((review, index) => ({
      id: `seed-review-${index}`,
      foodId: "seed",
      userName: review.name,
      rating: review.rating,
      comment: review.text,
    }));
  }
}

function serializeOrder(order: Record<string, unknown>): LiveOrder {
  const items = Array.isArray(order.items)
    ? order.items.map((item) => {
        const entry = item as {
          name?: string;
          quantity?: number;
          size?: string;
          toppings?: string[];
          level?: string;
          price?: number;
        };
        return {
          name: String(entry.name ?? "Food item"),
          quantity: Number(entry.quantity ?? 1),
          size: entry.size ? String(entry.size) : undefined,
          toppings: Array.isArray(entry.toppings) ? entry.toppings.map(String) : [],
          level: entry.level ? String(entry.level) : undefined,
          price: Number(entry.price ?? 0),
        };
      })
    : [];
  const address = order.address as LiveOrder["address"] | undefined;
  return {
    id: String(order._id ?? order.id),
    date: order.createdAt ? new Date(String(order.createdAt)).toLocaleDateString("en-IN") : String(order.date ?? ""),
    items,
    subtotal: Number(order.subtotal ?? 0),
    tax: Number(order.tax ?? 0),
    deliveryCharge: Number(order.deliveryCharge ?? 0),
    discount: Number(order.discount ?? 0),
    total: Number(order.total ?? 0),
    status: (order.status as LiveOrder["status"]) ?? "Pending",
    paymentMethod: order.paymentMethod ? String(order.paymentMethod) : undefined,
    paymentStatus: order.paymentStatus ? String(order.paymentStatus) : undefined,
    fulfillment: order.fulfillment ? String(order.fulfillment) : undefined,
    couponCode: order.couponCode ? String(order.couponCode) : undefined,
    razorpayOrderId: order.razorpayOrderId ? String(order.razorpayOrderId) : undefined,
    razorpayPaymentId: order.razorpayPaymentId ? String(order.razorpayPaymentId) : undefined,
    deliveryPartner: serializeDeliveryPartner(order.deliveryPartner),
    address,
  };
}

function serializeDeliveryPartner(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const partner = value as Record<string, unknown>;
  return {
    name: partner.name ? String(partner.name) : undefined,
    phone: partner.phone ? String(partner.phone) : undefined,
    vehicle: partner.vehicle ? String(partner.vehicle) : undefined,
    latitude: partner.latitude === undefined ? undefined : Number(partner.latitude),
    longitude: partner.longitude === undefined ? undefined : Number(partner.longitude),
    etaMinutes: partner.etaMinutes === undefined ? undefined : Number(partner.etaMinutes),
    updatedAt: partner.updatedAt ? new Date(String(partner.updatedAt)).toLocaleString("en-IN") : undefined,
  };
}

export async function getLiveOrders(email?: string): Promise<LiveOrder[]> {
  if (!process.env.MONGODB_URI) {
    const { orders } = await import("@/data/seed");
    return orders.map((order) => ({
      ...order,
      items: order.items.map((name) => ({ name, quantity: 1, price: 0 })),
    }));
  }
  try {
    await connectDB();
    const query = email ? { "address.email": email } : {};
    const items = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
    if (!items.length) return [];
    return items.map((item) => serializeOrder(item));
  } catch {
    const { orders } = await import("@/data/seed");
    return orders.map((order) => ({
      ...order,
      items: order.items.map((name) => ({ name, quantity: 1, price: 0 })),
    }));
  }
}

export async function getAdminStats(): Promise<{
  totalOrders: number;
  sales: number;
  customers: number;
  popularItems: number;
  recentOrders: LiveOrder[];
  monthlySales: MonthlySale[];
}> {
  const fallbackFoods = foodItems;
  const emptyMonthlySales = buildEmptyMonthlySales();
  if (!process.env.MONGODB_URI) {
    const { orders } = await import("@/data/seed");
    const recentOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((name) => ({ name, quantity: 1, price: 0 })),
    }));
    return {
      totalOrders: orders.length,
      sales: orders.reduce((sum, order) => sum + order.total, 0),
      customers: 0,
      popularItems: fallbackFoods.filter((item) => item.isFeatured).length,
      recentOrders,
      monthlySales: emptyMonthlySales,
    };
  }
  try {
    await connectDB();
    const [orders, customers, popularItems] = await Promise.all([
      OrderModel.find().sort({ createdAt: -1 }).limit(8).lean(),
      User.countDocuments(),
      FoodModel.countDocuments({ isFeatured: true }),
    ]);
    const allOrderTotals = await OrderModel.aggregate([{ $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }]);
    const monthlySales = await getMonthlySales();
    return {
      totalOrders: Number(allOrderTotals[0]?.count ?? 0),
      sales: Number(allOrderTotals[0]?.total ?? 0),
      customers,
      popularItems,
      recentOrders: orders.map((order) => serializeOrder(order)),
      monthlySales,
    };
  } catch {
    const { orders } = await import("@/data/seed");
    const recentOrders = orders.map((order) => ({
      ...order,
      items: order.items.map((name) => ({ name, quantity: 1, price: 0 })),
    }));
    return {
      totalOrders: orders.length,
      sales: orders.reduce((sum, order) => sum + order.total, 0),
      customers: 0,
      popularItems: fallbackFoods.filter((item) => item.isFeatured).length,
      recentOrders,
      monthlySales: emptyMonthlySales,
    };
  }
}

function buildEmptyMonthlySales() {
  const months: MonthlySale[] = [];
  const now = new Date();
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    months.push({
      label: date.toLocaleString("en-IN", { month: "short" }),
      total: 0,
      orders: 0,
    });
  }
  return months;
}

async function getMonthlySales() {
  const start = new Date();
  start.setMonth(start.getMonth() - 5, 1);
  start.setHours(0, 0, 0, 0);

  const rows = await OrderModel.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: "$total" },
        orders: { $sum: 1 },
      },
    },
  ]);

  const salesByMonth = new Map(
    rows.map((row) => [`${row._id.year}-${row._id.month}`, { total: Number(row.total ?? 0), orders: Number(row.orders ?? 0) }]),
  );

  return buildEmptyMonthlySales().map((entry, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index, 1);
    const sale = salesByMonth.get(`${date.getFullYear()}-${date.getMonth() + 1}`);
    return sale ? { ...entry, ...sale } : entry;
  });
}
