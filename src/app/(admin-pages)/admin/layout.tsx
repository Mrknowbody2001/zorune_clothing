import Sidebar from "@/components/admin-components/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-8 py-10">{children}</main>
      </div>
    </div>
  );
}
