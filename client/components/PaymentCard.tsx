import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentCardProps {
  payment: {
    id: number;
    coach: string;
    amount: string;
    date: string;
    status: "Paid" | "Pending";
  };
}

export function PaymentCard({ payment }: PaymentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{payment.coach}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-between items-center">
        <div>
          <p className="text-gray-500">{payment.date}</p>
          <span className="font-bold">{payment.amount}</span>
        </div>
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            payment.status === "Paid"
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {payment.status}
        </span>
      </CardContent>
    </Card>
  );
}
