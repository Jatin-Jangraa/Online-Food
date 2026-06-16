"use client";

import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { CartItem, FoodItem } from "@/types";

type CustomChoice = {
  size: string;
  toppings: string[];
  level: string;
  quantity: number;
};

type CouponRule = {
  discountType: "percent" | "flat";
  value: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: FoodItem, choice: CustomChoice) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  removeItem: (cartId: string) => void;
  clearCart: () => void;
  subtotal: number;
  tax: number;
  delivery: number;
  discount: number;
  total: number;
  coupon: string;
  couponMessage: string;
  applyCoupon: (code: string) => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [couponRule, setCouponRule] = useState<CouponRule | null>(null);

  function addItem(item: FoodItem, choice: CustomChoice) {
    const sizePrice = item.customizations.sizes.find((size) => size.label === choice.size)?.price ?? 0;
    const toppingsPrice = choice.toppings.reduce((sum, topping) => {
      return sum + (item.customizations.toppings.find((option) => option.label === topping)?.price ?? 0);
    }, 0);
    const basePrice = item.price + sizePrice + toppingsPrice;
    const cartId = `${item.id}-${choice.size}-${choice.level}-${choice.toppings.sort().join("-")}`;

    setItems((current) => {
      const existing = current.find((entry) => entry.cartId === cartId);
      if (existing) {
        return current.map((entry) =>
          entry.cartId === cartId
            ? {
                ...entry,
                quantity: entry.quantity + choice.quantity,
                lineTotal: (entry.quantity + choice.quantity) * entry.basePrice,
              }
            : entry,
        );
      }
      return [
        ...current,
        {
          cartId,
          foodId: item.id,
          name: item.name,
          image: item.images?.[0] ?? item.image,
          basePrice,
          quantity: choice.quantity,
          size: choice.size,
          toppings: choice.toppings,
          level: choice.level,
          lineTotal: basePrice * choice.quantity,
        },
      ];
    });
  }

  function updateQuantity(cartId: string, quantity: number) {
    setItems((current) =>
      current.map((item) =>
        item.cartId === cartId
          ? { ...item, quantity: Math.max(1, quantity), lineTotal: Math.max(1, quantity) * item.basePrice }
          : item,
      ),
    );
  }

  function removeItem(cartId: string) {
    setItems((current) => current.filter((item) => item.cartId !== cartId));
  }

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const tax = Math.round(subtotal * 0.05);
  const delivery = subtotal > 999 || subtotal === 0 ? 0 : 70;
  const discount = couponRule
    ? Math.min(
        subtotal,
        couponRule.discountType === "percent" ? Math.round(subtotal * (couponRule.value / 100)) : couponRule.value,
      )
    : 0;
  const total = Math.max(0, subtotal + tax + delivery - discount);

  const applyCoupon = useCallback(async (code: string) => {
    const normalizedCode = code.trim().toUpperCase();
    setCouponMessage("");
    setCouponRule(null);
    setCoupon("");

    const response = await fetch("/api/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: normalizedCode, subtotal }),
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setCouponMessage(typeof data.error === "string" ? data.error : "Coupon could not be applied.");
      return;
    }

    setCoupon(normalizedCode);
    setCouponRule({
      discountType: data.discountType,
      value: Number(data.value),
    });
    setCouponMessage(`${normalizedCode} applied.`);
  }, [subtotal]);

  const value = useMemo(
    () => ({
      items,
      addItem,
      updateQuantity,
      removeItem,
      clearCart: () => setItems([]),
      subtotal,
      tax,
      delivery,
      discount,
      total,
      coupon,
      couponMessage,
      applyCoupon,
    }),
    [items, subtotal, tax, delivery, discount, total, coupon, couponMessage, applyCoupon],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
