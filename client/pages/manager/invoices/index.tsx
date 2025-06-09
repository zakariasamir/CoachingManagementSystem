"use client";

import { Metadata } from "next";
import ManagerLayout from "@/layouts/ManagerLayout";
import InvoiceList from "@/components/InvoiceList";

export const metadata: Metadata = {
  title: "Invoices | Manager Dashboard",
  description: "View and manage invoices from coaches",
};

export default function InvoicesPage() {
  return (
    <ManagerLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
        </div>
        <InvoiceList role="manager" />
      </div>
    </ManagerLayout>
  );
}
