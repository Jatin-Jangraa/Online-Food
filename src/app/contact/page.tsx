import { Mail, Phone } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { Section } from "@/components/ui";

export const metadata = {
  title: "Contact",
};

export default function ContactPage() {
  return (
    <Section eyebrow="Contact" title="Tell us what you are planning">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <ContactForm />
        <div className="space-y-5">
          <div className="rounded-[2rem] border border-line bg-card p-6"><Phone className="text-brand" /><h2 className="mt-3 font-bold">Phone</h2><p className="text-muted">+91 98765 43210</p></div>
          <div className="rounded-[2rem] border border-line bg-card p-6"><Mail className="text-brand" /><h2 className="mt-3 font-bold">Email</h2><p className="text-muted">hello@brewandbite.in</p></div>
          <iframe title="Cafe map" className="min-h-72 w-full rounded-[2rem] border border-line" loading="lazy" src="https://www.google.com/maps?q=Park%20Street%20Kolkata&output=embed" />
        </div>
      </div>
    </Section>
  );
}
