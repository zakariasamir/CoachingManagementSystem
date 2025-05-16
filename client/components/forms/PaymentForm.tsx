import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFormProps {
  onAddPayment: (payment: any) => void;
}

export function PaymentForm({ onAddPayment }: PaymentFormProps) {
  const [coachId, setCoachId] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = () => {
    if (!coachId || !amount) return;
    onAddPayment({
      id: crypto.randomUUID(),
      coachId,
      amount: parseFloat(amount),
      date: new Date().toISOString(),
      invoiceId: `INV-${Math.floor(Math.random() * 10000)}`,
    });
    setCoachId("");
    setAmount("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>+ New Payment</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Coach ID</Label>
            <Input
              value={coachId}
              onChange={(e) => setCoachId(e.target.value)}
              placeholder="Enter coach ID"
            />
          </div>
          <div>
            <Label>Amount</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
            />
          </div>
          <Button onClick={handleSubmit}>Create Payment</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
