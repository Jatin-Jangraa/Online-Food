"use client";

import { Mail, MailOpen, Archive } from "lucide-react";
import { useState } from "react";
import { ContactNotification } from "@/types";

const statuses: ContactNotification["status"][] = ["New", "Read", "Archived"];

export function AdminNotificationManager({ initialMessages }: { initialMessages: ContactNotification[] }) {
  const [messages, setMessages] = useState(initialMessages);
  const [notice, setNotice] = useState("");

  async function updateStatus(id: string, status: ContactNotification["status"]) {
    setNotice("");
    const response = await fetch(`/api/contact/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      setNotice("Could not update message.");
      return;
    }

    setMessages((current) => current.map((message) => (message.id === id ? { ...message, status } : message)));
    setNotice("Message updated.");
  }

  const visibleMessages = messages.filter((message) => message.status !== "Archived");

  return (
    <div className="mt-8 grid gap-5">
      {notice && <p className="rounded-2xl bg-card p-4 text-sm font-semibold text-muted">{notice}</p>}
      {visibleMessages.map((message) => {
        const isNew = message.status === "New";
        return (
          <article key={message.id} className="rounded-[2rem] border border-line bg-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  {isNew ? <Mail className="size-5 text-brand" /> : <MailOpen className="size-5 text-muted" />}
                  <h2 className="font-bold">{message.name}</h2>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${isNew ? "bg-brand/10 text-brand" : "bg-background text-muted"}`}>
                    {message.status}
                  </span>
                  {message.createdAt && <span className="rounded-full bg-background px-3 py-1 text-xs font-bold text-muted">{message.createdAt}</span>}
                </div>
                <a href={`mailto:${message.email}`} className="mt-2 block break-all text-sm font-semibold text-brand">
                  {message.email}
                </a>
              </div>
              <div className="flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateStatus(message.id, status)}
                    disabled={message.status === status}
                    className="rounded-full border border-line px-4 py-2 text-sm font-bold text-muted hover:bg-background hover:text-brand disabled:opacity-50"
                  >
                    {status === "Archived" ? <Archive className="size-4" /> : status}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-5 whitespace-pre-wrap rounded-3xl bg-background p-5 leading-7 text-muted">{message.message}</p>
          </article>
        );
      })}
      {!visibleMessages.length && <p className="rounded-[2rem] border border-line bg-card p-8 text-center text-muted">No contact notifications yet.</p>}
    </div>
  );
}
