import { TopNav, MobileTabBar } from "@/components/app-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col">
      <TopNav />
      <div className="flex-1 pb-16 md:pb-0">{children}</div>
      <MobileTabBar />
    </div>
  );
}
