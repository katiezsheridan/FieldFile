import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header />
        {/* min-h-0 lets this flex child shrink below its content so overflow-auto
            scrolls here instead of growing the shell and scrolling the window. */}
        <main className="flex-1 min-h-0 overflow-auto p-6 bg-field-cream">
          {children}
        </main>
      </div>
    </div>
  );
}
