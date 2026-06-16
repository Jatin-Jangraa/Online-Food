"use client";

import Image from "next/image";
import { useState } from "react";
import { categoryOptions } from "@/data/admin-options";
import { Category } from "@/types";

export function AdminCategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
  });

  function applyCommonCategory(slug: string) {
    const category = categoryOptions.find((item) => item.slug === slug);
    if (!category) return;
    setForm((current) => ({
      ...current,
      slug: category.slug,
      name: category.name,
      description: `${category.name} items for the cafe menu.`,
    }));
  }

  function chooseFile(file: File | null) {
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  }

  async function uploadImage() {
    if (!selectedFile) return "";
    setUploading(true);
    const imageData = new FormData();
    imageData.append("images", selectedFile);
    const response = await fetch("/api/uploads", {
      method: "POST",
      body: imageData,
    });
    setUploading(false);
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(typeof data.error === "string" ? data.error : "Category image upload failed.");
    }
    const data = await response.json();
    return String(data.images[0]?.url ?? "");
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    try {
      const uploadedImage = await uploadImage();
      const payload = { ...form, image: uploadedImage || form.image };
      const response = await fetch(editingId ? `/api/categories/${editingId}` : "/api/categories", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(typeof data.error === "string" ? data.error : "Could not save category. Check MongoDB and required fields.");
        return;
      }
      const saved = await response.json();
      const normalized = {
        id: saved.slug,
        name: saved.name,
        description: saved.description,
        image: saved.image,
      };
      setCategories((current) => editingId ? current.map((category) => category.id === editingId ? normalized : category) : [normalized, ...current]);
      setMessage(editingId ? "Category updated." : "Category saved.");
      setEditingId(null);
      setForm({ name: "", slug: "", description: "", image: "" });
      chooseFile(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save category.");
    }
  }

  function editCategory(category: Category) {
    setEditingId(category.id);
    setMessage("");
    chooseFile(null);
    setForm({
      name: category.name,
      slug: category.id,
      description: category.description,
      image: category.image,
    });
  }

  async function deleteCategory(id: string) {
    setMessage("");
    const response = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(typeof data.error === "string" ? data.error : "Could not delete category.");
      return;
    }
    setCategories((current) => current.filter((category) => category.id !== id));
    setMessage("Category removed from menu.");
  }

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-[24rem_1fr]">
      <form onSubmit={submit} className="grid h-fit gap-4 rounded-[2rem] border border-line bg-card p-6">
        <h2 className="text-xl font-bold">{editingId ? "Edit category" : "Add category"}</h2>
        <select defaultValue="" onChange={(event) => applyCommonCategory(event.target.value)} className="h-12 rounded-2xl border border-line bg-background px-4 outline-none">
          <option value="">Choose common category</option>
          {categoryOptions.map((category) => (
            <option key={category.slug} value={category.slug}>{category.name}</option>
          ))}
        </select>
        <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Category name, e.g. Signature Coffee" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="Slug, e.g. coffee" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        <textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description, e.g. Espresso, iced coffee, and house drinks." rows={3} className="rounded-2xl border border-line bg-background p-4 outline-none" />
        <label className="grid gap-2 rounded-3xl border border-dashed border-line bg-background p-4">
          <span className="text-sm font-bold">Browse category image</span>
          <input type="file" accept="image/*" onChange={(event) => chooseFile(event.target.files?.[0] ?? null)} className="text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-bold file:text-white" />
          <span className="text-xs text-muted">Uploads to Cloudinary before saving.</span>
        </label>
        {(preview || form.image) && (
          preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Category preview" className="h-32 w-full rounded-3xl object-cover" />
          ) : (
            <div className="relative h-32 overflow-hidden rounded-3xl">
              <Image src={form.image} alt="Category preview" fill sizes="24rem" className="object-cover" />
            </div>
          )
        )}
        <input value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} placeholder="Optional image URL fallback, e.g. https://example.com/category.jpg" className="h-12 rounded-2xl border border-line bg-background px-4 outline-none" />
        {message && <p className="rounded-2xl bg-background p-3 text-sm font-semibold text-muted">{message}</p>}
        <button disabled={uploading} className="h-12 rounded-full bg-brand font-bold text-white disabled:opacity-60">{uploading ? "Uploading..." : editingId ? "Update category" : "Save category"}</button>
        {editingId && (
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm({ name: "", slug: "", description: "", image: "" });
              chooseFile(null);
            }}
            className="h-12 rounded-full border border-line font-bold"
          >
            Cancel edit
          </button>
        )}
      </form>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {categories.map((category) => (
          <article key={category.id} className="overflow-hidden rounded-[2rem] border border-line bg-card">
            <div className="relative h-36">
              <Image src={category.image} alt={category.name} fill sizes="(min-width: 1280px) 20vw, (min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
            <div className="p-5">
              <h2 className="font-bold">{category.name}</h2>
              <p className="mt-2 text-sm text-muted">{category.description}</p>
              <p className="mt-4 rounded-full bg-background px-3 py-1 text-xs font-bold text-brand">{category.id}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => editCategory(category)} className="rounded-full border border-line px-4 py-2 text-sm font-bold">Edit</button>
                <button onClick={() => deleteCategory(category.id)} className="rounded-full bg-brand px-4 py-2 text-sm font-bold text-white">Delete</button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
