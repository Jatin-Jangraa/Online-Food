import { Category, FoodItem, OrderStatus } from "@/types";

export const categories: Category[] = [
  {
    id: "coffee",
    name: "Signature Coffee",
    description: "Slow brewed espresso, cold foam, and house roasts.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "breakfast",
    name: "Breakfast",
    description: "Warm, fresh plates for unrushed mornings.",
    image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "bowls",
    name: "Bowls & Plates",
    description: "Comforting cafe meals with bright seasonal produce.",
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "desserts",
    name: "Desserts",
    description: "Small-batch cakes, cookies, and patisserie.",
    image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
  },
];

const custom = {
  sizes: [
    { label: "Regular", price: 0 },
    { label: "Large", price: 80 },
    { label: "Family", price: 180 },
  ],
  toppings: [
    { label: "Extra cheese", price: 60 },
    { label: "Caramel drizzle", price: 45 },
    { label: "Roasted nuts", price: 55 },
    { label: "Avocado", price: 90 },
  ],
  levels: ["Low sugar", "Balanced", "Extra sweet", "Mild spice", "Medium spice", "Hot"],
};

export const foodItems: FoodItem[] = [
  {
    id: "honey-latte",
    name: "Honey Cinnamon Latte",
    category: "coffee",
    description: "Double espresso, steamed milk, wild honey, and cinnamon dust.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
    price: 240,
    rating: 4.9,
    reviews: 328,
    tags: ["Bestseller", "Cafe favorite"],
    isFeatured: true,
    isVeg: true,
    customizations: custom,
  },
  {
    id: "brunch-toast",
    name: "Truffle Mushroom Toast",
    category: "breakfast",
    description: "Sourdough, whipped ricotta, garlic mushrooms, greens, and truffle oil.",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80",
    price: 420,
    rating: 4.8,
    reviews: 212,
    tags: ["Vegetarian", "Chef pick"],
    isFeatured: true,
    isVeg: true,
    customizations: custom,
  },
  {
    id: "med-bowl",
    name: "Mediterranean Power Bowl",
    category: "bowls",
    description: "Herbed rice, hummus, falafel, pickled onion, cucumber, and tahini.",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=900&q=80",
    price: 520,
    rating: 4.7,
    reviews: 184,
    tags: ["High protein", "Vegan"],
    isFeatured: true,
    isVeg: true,
    customizations: custom,
  },
  {
    id: "peri-chicken",
    name: "Peri Peri Chicken Panini",
    category: "breakfast",
    description: "Grilled chicken, peppers, mozzarella, and smoky peri peri mayo.",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=900&q=80",
    price: 480,
    rating: 4.6,
    reviews: 151,
    tags: ["Spicy", "Lunch"],
    customizations: custom,
  },
  {
    id: "cold-brew",
    name: "Vanilla Cream Cold Brew",
    category: "coffee",
    description: "18-hour cold brew with vanilla cream and coffee ice cubes.",
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    price: 280,
    rating: 4.8,
    reviews: 267,
    tags: ["Iced", "Smooth"],
    isVeg: true,
    customizations: custom,
  },
  {
    id: "berry-cheesecake",
    name: "Berry Basque Cheesecake",
    category: "desserts",
    description: "Burnt vanilla cheesecake with macerated berries and cream.",
    image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80",
    price: 360,
    rating: 4.9,
    reviews: 193,
    tags: ["Limited", "Sweet"],
    isFeatured: true,
    isVeg: true,
    customizations: custom,
  },
];

export const reviews = [
  { name: "Aarav Mehta", text: "The ordering flow is fast and the coffee arrives hot every single time.", rating: 5 },
  { name: "Nisha Rao", text: "Premium cafe quality without the usual wait. The truffle toast is unreal.", rating: 5 },
  { name: "Kabir Singh", text: "Reserved a table and pre-ordered brunch. Smooth, calm, and very polished.", rating: 4.8 },
];

export const orders = [
  { id: "BNB-1042", date: "15 Jun 2026", total: 1180, status: "Delivered" as OrderStatus, items: ["Honey Cinnamon Latte", "Mediterranean Power Bowl"] },
  { id: "BNB-1038", date: "11 Jun 2026", total: 760, status: "Preparing" as OrderStatus, items: ["Vanilla Cream Cold Brew", "Berry Basque Cheesecake"] },
  { id: "BNB-1029", date: "04 Jun 2026", total: 1460, status: "Delivered" as OrderStatus, items: ["Peri Peri Chicken Panini", "Truffle Mushroom Toast"] },
];
