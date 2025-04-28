// import { Sidebar } from "@/components/EntrepreneurSidebar";
import Sidebar from "@/components/Sidebar";
import { Navbar } from "@/components/Navbar";
import { Outlet } from "react-router-dom";

export default function EntrepreneurLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-8 space-y-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
