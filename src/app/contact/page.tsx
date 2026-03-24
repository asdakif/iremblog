import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ContactForm from "./ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — send a message or share your thoughts.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-warm-50 dark:bg-stone-900">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-16">
        <div className="mb-10">
          <h1
            className="text-4xl font-bold text-stone-800 dark:text-stone-100 mb-3"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Get in touch
          </h1>
          <p className="text-stone-500 dark:text-stone-400 text-lg leading-relaxed">
            Have a thought, a story idea, or just want to say hello? I&apos;d love to hear from you.
          </p>
        </div>
        <ContactForm />
      </main>
      <Footer />
    </div>
  );
}
