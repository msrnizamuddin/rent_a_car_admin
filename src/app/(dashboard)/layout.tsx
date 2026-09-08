import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import RequireAuth from "@/components/auth/RequireAuth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <div className="flex h-screen bg-[#EEF1F6] overflow-hidden">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Topbar />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-[1400px] mx-auto bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] min-h-[calc(100vh-8rem)] p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
