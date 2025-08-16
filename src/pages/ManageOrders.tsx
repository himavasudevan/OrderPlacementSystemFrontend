// ManageOrders.tsx
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { orderApi } from "@/api/orderApi";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ConfirmModal";
import { useOrder } from "@/hooks/useOrders";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Eye, Trash2, ArrowUpDown, PencilLine } from "lucide-react";
import OrderModal from "@/components/OrderModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Tjeneste {
  tjenesteDato: string;
  addressFrom: string;
  addressTo: string;
  kommentar: string;
  tjenester: string[];
  pris: number;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhonenumber: string;
  consultantName: string;
  services: Tjeneste[];
  totalPrice: number;
  orderDate: string;
  orderStatus: string;
  paymentStatus: string;
}

// ---- helpers ----
const statusVariant = (status?: string) => {
  const s = (status ?? "").toUpperCase();
  if (["PAID", "COMPLETED", "DELIVERED", "DONE"].includes(s)) return "default" as const;
  if (["REFUND", "REFUNDED", "PENDING", "PROCESSING"].includes(s)) return "secondary" as const;
  if (["CANCELLED", "CANCELED", "FAILED", "DECLINED"].includes(s)) return "destructive" as const;
  return "outline" as const;
};

const formatNoDate = (iso?: string) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("no-NO", { year: "numeric", month: "2-digit", day: "2-digit" });
};

const ManageOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterId, setFilterId] = useState("");
  const [sortField, setSortField] = useState<keyof Order | "">("");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { remove, pay, updateOrderStatus, refund } = useOrder();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<number | null>(null);

  // refund toggle state for ConfirmModal
  const [refundChecked, setRefundChecked] = useState(false);

  // payment modal state
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [payingOrder, setPayingOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (modalMode === "view" && selectedOrder) {
      setModalOpen(true);
    }
  }, [selectedOrder, modalMode]);

  async function fetchOrders() {
    try {
      setLoading(true);
      const data = await orderApi.getAll();
      if (!Array.isArray(data)) throw new Error("Invalid data format");

      const mapped = data.map((o: any) => ({
        id: o.orderId ?? 0,
        customerName: o.kundeNavn ?? "",
        customerEmail: o.kundeEpost ?? "",
        consultantName: o.konsulentNavn ?? "",
        customerPhonenumber: o.kundeTelefonnummer ?? "",
        services: o.tjenester ?? [],
        totalPrice: o.totalPris ?? 0,
        orderDate: o.ordreOpprettingsDato ?? "",
        orderStatus: o.orderStatus ?? "",
        paymentStatus: o.paymentStatus ?? "",
      })) as Order[];

      setOrders(mapped);
    } catch (error) {
      toast.error("Failed to fetch orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function handleSort(field: keyof Order) {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  const filteredOrders = orders
    .filter((order) => {
      const matchSearch =
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.consultantName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchId = filterId ? order.id.toString().includes(filterId) : true;
      return matchSearch && matchId;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      // date-aware sort for orderDate
      if (sortField === "orderDate") {
        const da = new Date(a.orderDate ?? 0).getTime();
        const db = new Date(b.orderDate ?? 0).getTime();
        return sortAsc ? da - db : db - da;
      }

      const valA = a[sortField] ?? "";
      const valB = b[sortField] ?? "";
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginated = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDeleteClick = (orderId: number) => {
    setOrderToDelete(orderId);
    setRefundChecked(false); // reset each time dialog opens
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (orderToDelete === null) return;
    const order = orders.find((o) => o.id === orderToDelete);

    try {
      await updateOrderStatus(orderToDelete, "cancelled");
      toast.success("Order cancelled successfully!");

      // If refund toggle is ON, and order is PAID, issue refund for totalPrice
      if (refundChecked) {
        const upperPayment = (order?.paymentStatus ?? "").toUpperCase();
        const isPaid = upperPayment === "PAID";
        if (!isPaid) {
          toast.warning("Order is not paid. Refund skipped.");
        } else if (order) {
          try {
            await refund(orderToDelete, order.totalPrice);
            toast.success("Refund processed.");
          } catch (e) {
            toast.error("Failed to process refund.");
            console.error(e);
          }
        }
      }

      await fetchOrders();
    } catch (error) {
      toast.error("Failed to cancel order.");
      console.error(error);
    } finally {
      setDeleteModalOpen(false);
      setOrderToDelete(null);
      setRefundChecked(false);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
    setRefundChecked(false);
  };

  const handleCreateOrder = () => {
    setSelectedOrder(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const handleViewOrder = async (order: Order) => {
    try {
      setLoading(true);
      const fullOrder = await orderApi.getById(order.id);
      const mappedOrder: Order = {
        id: fullOrder.orderId,
        customerName: fullOrder.kundeNavn,
        customerEmail: fullOrder.kundeEpost,
        customerPhonenumber: fullOrder.kundeTelefonnummer,
        consultantName: fullOrder.konsulentNavn,
        services: fullOrder.tjenester,
        totalPrice: fullOrder.totalPris,
        orderDate: fullOrder.ordreOpprettingsDato,
        orderStatus: fullOrder.orderStatus,
        paymentStatus: fullOrder.paymentStatus,
      };
      setSelectedOrder(mappedOrder);
      setModalMode("view");
      setModalOpen(true);
    } catch (error) {
      toast.error("Failed to fetch order details");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = async (orderId: number) => {
    try {
      setModalMode("edit");
      setLoading(true);
      const fullOrder = await orderApi.getById(orderId);
      const mappedOrder: Order = {
        id: fullOrder.orderId,
        customerName: fullOrder.kundeNavn,
        customerEmail: fullOrder.kundeEpost,
        customerPhonenumber: fullOrder.kundeTelefonnummer,
        consultantName: fullOrder.konsulentNavn,
        services: fullOrder.tjenester,
        totalPrice: fullOrder.totalPris,
        orderDate: fullOrder.ordreOpprettingsDato,
        orderStatus: fullOrder.orderStatus,
        paymentStatus: fullOrder.paymentStatus,
      };
      setSelectedOrder(mappedOrder);
      setModalOpen(true);
    } catch {
      toast.error("Failed to fetch order details");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (order: Order) => {
    const up = (order.paymentStatus ?? "").toUpperCase();
    const isTerminalPayment = up === "PAID" || up === "REFUND" || up === "REFUNDED";
    if (isTerminalPayment) {
      toast.info(`This order cannot be paid (status: ${up || "N/A"}).`);
      return;
    }
    setPayingOrder(order);
    setPaymentOpen(true);
  };

  const selectedToCancel = orders.find((o) => o.id === orderToDelete);
  const showRefundToggle =
    !!selectedToCancel && (selectedToCancel.paymentStatus ?? "").toUpperCase() === "PAID";

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-foreground">Manage Orders</h2>
        <Button className="rounded-xl" onClick={handleCreateOrder}>
          <Plus className="mr-2" /> Create Order
        </Button>
      </div>

      <div className="flex flex-wrap gap-4 items-center">
        <Input
          placeholder="Search by customer, email or consultant"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-xl max-w-sm"
        />
        <Input
          placeholder="Filter by Order ID"
          value={filterId}
          onChange={(e) => setFilterId(e.target.value)}
          className="rounded-xl w-48"
        />
      </div>

      <Card className="shadow-lg rounded-2xl border border-border">
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : paginated.length === 0 ? (
            <p className="p-6 text-muted-foreground">No orders found.</p>
          ) : (
            <Table>
              <TableHeader className="bg-muted">
                <TableRow>
                  {[
                    "id",
                    "customerName",
                    "customerEmail",
                    "consultantName",
                    "totalPrice",
                    "orderDate",
                    "orderStatus",
                    "paymentStatus",
                  ].map((field) => (
                    <TableHead
                      key={field}
                      onClick={() => handleSort(field as keyof Order)}
                      className="cursor-pointer select-none text-foreground font-semibold"
                    >
                      <span className="inline-flex items-center">
                        {field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        <ArrowUpDown size={16} className="ml-1 text-muted-foreground" />
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="text-foreground font-semibold">Services</TableHead>
                  <TableHead className="text-right text-foreground font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginated.map((order) => {
                  const upperOrder = (order.orderStatus ?? "").toUpperCase();
                  const isCompleted = upperOrder === "COMPLETED";
                  const isCancelled = upperOrder === "CANCELLED" || upperOrder === "CANCELED";

                  const upperPayment = (order.paymentStatus ?? "").toUpperCase();
                  const isPaid = upperPayment === "PAID";
                  const isRefunded = upperPayment === "REFUND" || upperPayment === "REFUNDED";

                  const showEdit = !(isCompleted || isCancelled || isPaid || isRefunded);
                  const showCancel = !(isCompleted || isCancelled);
                  const showPay = !(isPaid || isRefunded); // hide when PAID or REFUND/REFUNDED

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>{order.customerEmail}</TableCell>
                      <TableCell>{order.consultantName}</TableCell>
                      <TableCell>{order.totalPrice} kr</TableCell>

                      {/* orderDate */}
                      <TableCell>{formatNoDate(order.orderDate)}</TableCell>

                      {/* orderStatus */}
                      <TableCell>
                        <Badge variant={statusVariant(order.orderStatus)}>
                          {order.orderStatus || "-"}
                        </Badge>
                      </TableCell>

                      {/* paymentStatus */}
                      <TableCell>
                        <Badge variant={statusVariant(order.paymentStatus)}>
                          {order.paymentStatus || "-"}
                        </Badge>
                      </TableCell>

                      <TableCell className="flex flex-wrap gap-1">
                        {order.services.flatMap((s) => s.tjenester).map((service, idx) => (
                          <Badge key={idx} variant="secondary">
                            {service}
                          </Badge>
                        ))}
                      </TableCell>

                      <TableCell className="text-right space-x-1">
                        {/* View: always */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="hover:bg-muted"
                          onClick={() => handleViewOrder(order)}
                          aria-label="View order"
                        >
                          <Eye size={18} className="text-primary" />
                        </Button>

                        {/* Edit */}
                        {showEdit && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-muted"
                            onClick={() => handleEditOrder(order.id)}
                            aria-label="Edit order"
                            title="Edit order"
                          >
                            <PencilLine size={18} className="text-muted-foreground" />
                          </Button>
                        )}

                        {/* Cancel */}
                        {showCancel && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-muted"
                            onClick={() => handleDeleteClick(order.id)}
                            aria-label="Cancel order"
                            title="Cancel order"
                          >
                            <Trash2 size={18} className="text-destructive" />
                          </Button>
                        )}

                        {/* Pay */}
                        {showPay && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl ml-1"
                            onClick={() => handleOpenPayment(order)}
                            aria-label="Pay for order"
                            title="Make payment"
                          >
                            Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">
          Page {page} of {totalPages}
        </span>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-xl"
          >
            Prev
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-xl"
          >
            Next
          </Button>
        </div>
      </div>

      {/* existing order modal */}
      <OrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        order={selectedOrder}
        refreshOrders={fetchOrders}
      />

      {/* cancel confirm with refund toggle */}
      <ConfirmModal
        open={deleteModalOpen}
        title="Cancel Order?"
        description="Are you sure you want to cancel this order? Its status will be set to CANCELLED."
        confirmLabel="Cancel order"
        cancelLabel="Close"
        showRefundToggle={showRefundToggle}
        refundChecked={refundChecked}
        onRefundChange={setRefundChecked}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* PAYMENT MODAL */}
      <Dialog
        open={paymentOpen}
        onOpenChange={(o) => {
          if (!o) {
            setPaymentOpen(false);
            setPayingOrder(null);
          }
        }}
      >
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Payment</DialogTitle>
          </DialogHeader>

          {payingOrder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Customer</Label>
                  <div className="mt-1 font-medium">{payingOrder.customerName}</div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Order Status</Label>
                  <div className="mt-1">
                    <Badge variant={statusVariant(payingOrder.orderStatus)}>
                      {payingOrder.orderStatus || "-"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Payment Status</Label>
                  <div className="mt-1">
                    <Badge variant={statusVariant(payingOrder.paymentStatus)}>
                      {payingOrder.paymentStatus || "-"}
                    </Badge>
                  </div>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Order Date</Label>
                  <div className="mt-1">{formatNoDate(payingOrder.orderDate)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Total Amount</Label>
                <Input className="mt-1" value={`${payingOrder.totalPrice} kr`} readOnly />
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Payment Amount</Label>
                  <Input className="mt-1" value={`${payingOrder.totalPrice} kr`} readOnly />
                </div>
              </div>

              {(() => {
                const ps = (payingOrder.paymentStatus ?? "").toUpperCase();
                if (ps === "PAID") return <div className="text-sm text-green-600">This order is already paid.</div>;
                if (ps === "REFUND" || ps === "REFUNDED")
                  return <div className="text-sm text-amber-600">This order has been refunded.</div>;
                return null;
              })()}
            </div>
          ) : null}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setPaymentOpen(false);
                setPayingOrder(null);
              }}
              className="rounded-xl"
            >
              Close
            </Button>
            <Button
              className="rounded-xl"
              disabled={
                !payingOrder ||
                ["PAID", "REFUND", "REFUNDED"].includes((payingOrder.paymentStatus ?? "").toUpperCase())
              }
              onClick={async () => {
                if (!payingOrder) return;
                try {
                  await pay(payingOrder.id, payingOrder.totalPrice);
                  toast.success("Payment successful!");
                  setPaymentOpen(false);
                  setPayingOrder(null);
                  await fetchOrders(); // refresh -> buttons update
                } catch (e: any) {
                  const msg = e?.message || "Payment failed.";
                  toast.error(msg);
                  console.error(e);
                }
              }}
            >
              Pay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default ManageOrders;
