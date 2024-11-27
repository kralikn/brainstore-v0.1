import Navbar from "@/components/layout/navbar";
import Sidebar from "@/components/layout/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="grid lg:grid-cols-6 md:grid-cols-1">
      <div className="hidden lg:block lg:col-span-1 lg:min-h-screen">
        <Sidebar />
      </div>
      <div className="lg:col-span-5">
        <Navbar />
        <div className="p-4 pt-0">
          {children}
        </div>
      </div>
    </div>
  )
}
