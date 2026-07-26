import BottomNav from "@/components/bottom-nav";
import OfflineBanner from "@/components/offline-banner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OfflineBanner />
      <main className="flex flex-1 flex-col pb-16">{children}</main>
      <BottomNav />
    </>
  );
}
