import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const ManagerLayout = ({ children }: any) => {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <div className="p-8 space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ManagerLayout;
