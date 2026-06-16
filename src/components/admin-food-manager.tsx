"use client";

import Image from "next/image";
import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { FoodItem } from "@/types";

export function AdminFoodManager({ initialItems }: { initialItems: FoodItem[] }) {
  const [items, setItems] = useState(initialItems);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [form, setForm] = useState({
    name: "",
    category: "coffee",
    description: "",
    price: "",
    image: "",
    images: "",
    rating: "0",
    tags: "",
    isFeatured: false,
    isVeg: true,
    offerBadge: "",
    offerPrice: "",
  });

  function chooseFiles(files: FileList | null) {
    const nextFiles = Array.from(files ?? []);
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setSelectedFiles(nextFiles);
    setPreviews(nextFiles.map((file) => URL.createObjectURL(file)));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    let uploadedUrls: string[] = [];
    if (selectedFiles.length) {
      setUploading(true);
      const imageData = new FormData();
      selectedFiles.forEach((file) => imageData.append("images", file));

      const uploadResponse = await fetch("/api/uploads", {
        method: "POST",
        body: imageData,
      });
      setUploading(false);

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json().catch(() => ({}));
        setMessage(typeof data.error === "string" ? data.error : "Image upload failed.");
        return;
      }

      const data = await uploadResponse.json();
      uploadedUrls = data.images.map((image: { url: string }) => image.url);
    }

    const payload = {
      ...form,
      image: uploadedUrls[0] ?? form.image,
      images: uploadedUrls.length ? uploadedUrls.join("\n") : form.images,
    };

    const response = await fetch(editingId ? `/api/foods/${editingId}` : "/api/foods", {
      method: editingId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(typeof data.error === "string" ? data.error : "Could not save product. Check MongoDB and required fields.");
      return;
    }

    const saved = await response.json();
    const normalized = {
        id: saved._id,
        name: saved.name,
        category: saved.categorySlug,
        description: saved.description,
        image: saved.image,
        images: saved.images,
        price: saved.price,
      rating: saved.rating,
      reviews: saved.reviews,
      tags: saved.tags ?? [],
      isFeatured: saved.isFeatured,
      isVeg: saved.isVeg,
        customizations: saved.customizations,
      };
    setItems((current) => editingId ? current.map((item) => item.id === editingId ? normalized : item) : [normalized, ...current]);
    setMessage(editingId ? "Product updated." : "Product added and ready for menu display.");
    setEditingId(null);
    setForm({
      name: "",
      category: "coffee",
      description: "",
      price: "",
      image: "",
      images: "",
      rating: "0",
      tags: "",
      isFeatured: false,
      isVeg: true,
      offerBadge: "",
      offerPrice: "",
    });
    setSelectedFiles([]);
    setPreviews([]);
  }

  function editItem(item: FoodItem) {
    setEditingId(item.id);
    setMessage("");
    previews.forEach((preview) => URL.revokeObjectURL(preview));
    setPreviews([]);
    setSelectedFiles([]);
    setForm({
      name: item.name,
      category: item.category,
      description: item.description,
      price: String(item.price),
      image: item.image,
      images: item.images?.join("\n") ?? item.image,
      rating: String(item.rating),
      tags: item.tags.join(", "),
      isFeatured: Boolean(item.isFeatured),
      isVeg: item.isVeg !== false,
      offerBadge: "",
      offerPrice: "",
    });
  }

  async function deleteItem(id: string) {
    setMessage("");
    const response = await fetch(`/api/foods/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(typeof data.error === "string" ? data.error : "Could not delete product.");
      return;
    }
    setItems((current) => current.filter((item) => item.id !== id));
    setMessage("Product removed from menu.");
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[26rem_1fr]">
      <form onSubmit={submit} className="grid h-fit gap-4 rounded-[2rem] border border-line bg-card p-6">
        <h2 className="text-xl font-bold">{editingId ? "Edit product" : "Add product"}</h2>
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Food name, e.g. Classic Cappuccino" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="Category slug, e.g. coffee, pizza, desserts" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description, e.g. Rich espresso with steamed milk and soft foam." rows={4} className="rounded-2xl border border-line bg-background p-4 outline-none" />
        <input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="Price, e.g. 220" type="number" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <label className="grid gap-2 rounded-3xl border border-dashed border-line bg-background p-4">
          <span className="text-sm font-bold">Browse food images</span>
          <input type="file" accept="image/*" multiple onChange={(event) => chooseFiles(event.target.files)} className="text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" />
          <span className="text-xs text-muted">Select one or more images. They upload to Cloudinary before saving.</span>
        </label>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((preview) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={preview} src={preview} alt="Selected food preview" className="h-24 w-full rounded-2xl object-cover" />
            ))}
          </div>
        )}
        <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Optional image URL fallback, e.g. https://example.com/latte.jpg" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <input value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="Tags, e.g. Bestseller, Hot, Vegetarian" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-bold">
            <input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} className="size-4 accent-brand" />
            Featured on home
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-line bg-background px-4 py-3 text-sm font-bold">
            <input type="checkbox" checked={form.isVeg} onChange={(event) => setForm({ ...form, isVeg: event.target.checked })} className="size-4 accent-brand" />
            Vegetarian
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={form.offerBadge} onChange={(event) => setForm({ ...form, offerBadge: event.target.value })} placeholder="Offer badge, e.g. 20% OFF" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
          <input value={form.offerPrice} onChange={(event) => setForm({ ...form, offerPrice: event.target.value })} placeholder="Offer price, e.g. 199" type="number" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        </div>
        {message && <p className="rounded-2xl bg-background p-3 text-sm font-semibold text-muted">{message}</p>}
        <button disabled={uploading} className="h-12 rounded-full bg-brand font-bold text-white disabled:opacity-60">
          {uploading ? "Uploading images..." : editingId ? "Update product" : "Save product"}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", category: "coffee", description: "", price: "", image: "", images: "", rating: "0", tags: "", isFeatured: false, isVeg: true, offerBadge: "", offerPrice: "" });
            }}
            className="h-12 rounded-full border border-line font-bold"
          >
            Cancel edit
          </button>
        )}
      </form>
      <div className="overflow-hidden rounded-[2rem] border border-line bg-card">
        {items.map((item) => (
          <div key={item.id} className="grid gap-4 border-b border-line p-4 last:border-b-0 sm:grid-cols-[5rem_1fr_auto]">
            <div className="relative size-20 overflow-hidden rounded-3xl">
              <Image src={item.images?.[0] ?? item.image} alt={item.name} fill sizes="5rem" className="object-cover" />
            </div>
            <div>
              <h3 className="font-bold">{item.name}</h3>
              <p className="text-sm text-muted">{item.description}</p>
              <p className="mt-1 text-xs font-bold text-brand">{item.images?.length ?? 1} image(s) - {item.rating} rating</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{formatMoney(item.price)}</span>
              <button onClick={() => editItem(item)} className="rounded-full border border-line px-4 py-2 text-sm font-bold">Edit</button>
              <button onClick={() => deleteItem(item.id)} className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
