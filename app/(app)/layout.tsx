import BottomNav from "@/components/bottom-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex flex-1 flex-col pb-16">{children}</main>
      <BottomNav />
    </>
  );
}
