"use client";

import { Metadata } from "next";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { Invoice } from "@/types/payment";
import axios from "axios";
import ManagerLayout from "@/layouts/ManagerLayout";
import InvoiceList from "@/components/InvoiceList";

export const metadata: Metadata = {
  title: "Invoices | Manager Dashboard",
  description: "View and manage invoices from coaches",
};

// Fetcher function for SWR
async function fetchInvoices(url: string) {
  const response = await axios.get<Invoice[]>(url, { withCredentials: true });
  return response.data;
}

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
