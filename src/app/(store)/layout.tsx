import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { isChatConfigured } from "@/lib/chat/context";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      {/* Shows in prototype demo mode without API credits, and uses OpenAI when configured. */}
      {isChatConfigured() && <ChatWidget />}
    </div>
  );
}
