"use client";

import { Metadata } from "next";
import { Invoice } from "@/types/payment";
import axios from "axios";
import CoachLayout from "@/layouts/CoachLayouts";
import InvoiceList from "@/components/InvoiceList";

// Fetcher function for SWR
async function fetchInvoices(url: string) {
  const response = await axios.get<Invoice[]>(url, { withCredentials: true });
  return response.data;
}

export const metadata: Metadata = {
  title: "My Invoices | Coach Dashboard",
  description: "View your invoices and payment status",
};

export default function CoachInvoicesPage() {
  return (
    <CoachLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">My Invoices</h2>
        </div>
        <InvoiceList role="coach" />
      </div>
    </CoachLayout>
  );
}
