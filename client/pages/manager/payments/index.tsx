import { PaymentCard } from "@/components/PaymentCard";
import ManagerLayout from "@/layouts/ManagerLayout";

export default function ManagerPayments() {
  return (
    <ManagerLayout>
      <div>
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Payments</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"></div>
        </div>
      </div>
    </ManagerLayout>
  );
}
