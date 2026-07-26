import BottomNav from "@/components/bottom-nav";
import OfflineBanner from "@/components/offline-banner";
import { ToastProvider } from "@/components/toast";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <OfflineBanner />
      <main className="flex flex-1 flex-col pb-16">{children}</main>
      <BottomNav />
    </ToastProvider>
  );
}
