import { useState } from "react";
import { useOrganization } from "@/hooks/useOrganization";
import useSWR from "swr";
import { Invoice, InvoiceStatus } from "@/types/payment";
import axios from "axios";
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
import { Skeleton } from "@/components/ui/skeleton";

interface InvoiceListProps {
  role: "manager" | "coach";
}

const getPaymentStatus = (status: Invoice["status"]) => {
  switch (status) {
    case "sent":
      return "Pending Review";
    case "viewed":
      return "Under Processing";
    case "paid":
      return "Payment Received";
    default:
      return status;
  }
};

const getStatusVariant = (
  status: Invoice["status"]
): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "sent":
      return "outline";
    case "viewed":
      return "secondary";
    case "paid":
      return "default";
    default:
      return "secondary";
  }
};

export default function InvoiceList({ role }: InvoiceListProps) {
  const { selectedOrganization } = useOrganization();
  const organizationId = selectedOrganization?.id;
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus>("all");

  const {
    data: invoices,
    error,
    mutate,
    isLoading,
  } = useSWR<Invoice[]>(
    organizationId
      ? `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/${role}/invoices?organizationId=${organizationId}`
      : null,
    async (url) => {
      const response = await axios.get(url, { withCredentials: true });
      return response.data;
    },
    {
      revalidateOnFocus: false,
    }
  );

  const handleProcessInvoice = async (
    invoiceId: string,
    status: Extract<Invoice["status"], "viewed" | "paid">
  ) => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_VITE_BASE_URL}/manager/invoices/${invoiceId}/process`,
        { status, organizationId },
        { withCredentials: true }
      );
      await mutate();
      toast.success(
        `Invoice ${
          status === "paid" ? "marked as paid" : "viewed"
        } successfully`
      );
    } catch (error) {
      toast.error("Failed to process invoice");
    }
  };

  const handleStatusChange = (value: InvoiceStatus) => {
    setStatusFilter(value);
  };

  const filteredInvoices = invoices?.filter((invoice) =>
    statusFilter === "all" ? true : invoice.status === statusFilter
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="sent">
              {role === "coach" ? "Pending Review" : "Sent"}
            </SelectItem>
            <SelectItem value="viewed">
              {role === "coach" ? "Under Processing" : "Viewed"}
            </SelectItem>
            <SelectItem value="paid">
              {role === "coach" ? "Payment Received" : "Paid"}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice Number</TableHead>
              {role === "manager" && <TableHead>Coach</TableHead>}
              <TableHead>Session</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Issued Date</TableHead>
              {role === "manager" ? (
                <TableHead>Actions</TableHead>
              ) : (
                <TableHead>Payment Date</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!invoices || isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={role === "manager" ? 7 : 6}
                  className="text-center py-4"
                >
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={role === "manager" ? 7 : 6}
                  className="text-center py-4 text-destructive"
                >
                  Failed to load invoices
                </TableCell>
              </TableRow>
            ) : !filteredInvoices?.length ? (
              <TableRow>
                <TableCell
                  colSpan={role === "manager" ? 7 : 6}
                  className="text-center py-4 text-muted-foreground"
                >
                  No invoices found
                </TableCell>
              </TableRow>
            ) : (
              filteredInvoices.map((invoice) => (
                <TableRow key={invoice._id}>
                  <TableCell>{invoice.invoiceNumber}</TableCell>
                  {role === "manager" && (
                    <TableCell>
                      {invoice.paymentId.coachId.firstName}{" "}
                      {invoice.paymentId.coachId.lastName}
                    </TableCell>
                  )}
                  <TableCell>
                    {invoice.paymentId.sessionIds[0]?.title || "N/A"}
                  </TableCell>
                  <TableCell>
                    {invoice.currency} {invoice.amount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(invoice.status)}>
                      {role === "coach"
                        ? getPaymentStatus(invoice.status)
                        : invoice.status.charAt(0).toUpperCase() +
                          invoice.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {format(new Date(invoice.issuedAt), "MMM d, yyyy")}
                  </TableCell>
                  {role === "manager" ? (
                    <TableCell>
                      {invoice.status === "sent" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleProcessInvoice(invoice._id, "viewed")
                          }
                        >
                          Mark as Viewed
                        </Button>
                      )}
                      {invoice.status === "viewed" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleProcessInvoice(invoice._id, "paid")
                          }
                        >
                          Process Payment
                        </Button>
                      )}
                    </TableCell>
                  ) : (
                    <TableCell>
                      {invoice.paymentId.paidAt
                        ? format(
                            new Date(invoice.paymentId.paidAt),
                            "MMM d, yyyy"
                          )
                        : "-"}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
