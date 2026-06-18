import { MessageCircle } from "lucide-react";

export function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/918571024744?text=Hi%20Brew%20%26%20Bite%2C%20I%20want%20to%20place%20an%20order."
      target="_blank"
      rel="noreferrer"
      aria-label="Order on WhatsApp"
      className="fixed bottom-5 right-5 z-50 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl hover:scale-105"
    >
      <MessageCircle size={26} />
    </a>
  );
}
