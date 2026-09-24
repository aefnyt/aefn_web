"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

/** Carga el chatbot en las páginas React públicas (no en /admin). */
export function ChatbotLoader() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return <Script src="/js/chatbot.js" strategy="lazyOnload" />;
}
