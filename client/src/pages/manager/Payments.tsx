import { PaymentCard } from "@/components/PaymentCard";
import { payments } from "@/data/fakeData";

export default function ManagerPayments() {
  return (
    <div>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Coach Payments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {payments.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      </div>
    </div>
  );
}
