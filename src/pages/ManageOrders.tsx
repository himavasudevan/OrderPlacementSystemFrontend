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
import { Plus, Eye, Trash2, ArrowUpDown } from "lucide-react";
import OrderModal from "@/components/OrderModal";

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
  customerPhonenumber:string;
  consultantName: string;
  services: Tjeneste[];
  totalPrice: number;
}

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
  const {  remove } = useOrder(); 

const [deleteModalOpen, setDeleteModalOpen] = useState(false);
const [orderToDelete, setOrderToDelete] = useState<number | null>(null);


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
        customerPhonenumber:o.kundeTelefonnummer ?? "",
        services: o.tjenester ?? [],
        totalPrice: o.totalPris ?? 0,
      }));

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
  setDeleteModalOpen(true);
};
const handleConfirmDelete = async () => {
  if (orderToDelete === null) return;

  try {
    await remove(orderToDelete);
    toast.success("Order deleted successfully!");
    await fetchOrders(); // ✅ refresh orders from API
  } catch (error) {
    toast.error("Failed to delete order.");
    console.error(error);
  } finally {
    setDeleteModalOpen(false);
    setOrderToDelete(null);
  }
};

const handleCancelDelete = () => {
  setDeleteModalOpen(false);
  setOrderToDelete(null);
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
      customerPhonenumber:fullOrder.kundeTelefonnummer,
      consultantName: fullOrder.konsulentNavn,
      services: fullOrder.tjenester,
      totalPrice: fullOrder.totalPris,
    };

    setSelectedOrder(mappedOrder);
    setModalOpen(true);
  } catch (err) {
    toast.error("Failed to fetch order details");
  } finally {
    setLoading(false);
  }
};

  return (
    <main className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-semibold text-gray-800">Manage Orders</h2>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white shadow rounded-xl"
          onClick={handleCreateOrder}
        >
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

      <Card className="shadow-lg rounded-2xl border border-gray-100">
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
              <TableHeader className="bg-gray-100">
                <TableRow>
                  {["id", "customerName", "customerEmail", "consultantName", "totalPrice"].map((field) => (
                    <TableHead
                      key={field}
                      onClick={() => handleSort(field as keyof Order)}
                      className="cursor-pointer select-none text-gray-700 font-semibold"
                    >
                      <span className="inline-flex items-center">
                        {field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}
                        <ArrowUpDown size={16} className="ml-1" />
                      </span>
                    </TableHead>
                  ))}
                  <TableHead className="text-gray-700 font-semibold">Services</TableHead>
                  <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((order) => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.customerEmail}</TableCell>
                    <TableCell>{order.consultantName}</TableCell>
                    <TableCell>{order.totalPrice} kr</TableCell>
                    <TableCell className="flex flex-wrap gap-1">
                      {order.services.flatMap((s) => s.tjenester).map((service, idx) => (
                        <Badge key={idx} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-blue-50"
                        onClick={() => handleViewOrder(order)}
                      >
                        <Eye size={18} className="text-blue-600" />
                      </Button>

                      <Button
  variant="ghost"
  size="icon"
  className="hover:bg-yellow-50"
  onClick={() => handleEditOrder(order.id)}
>
  ✏️
</Button>


                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-red-50"
                        onClick={() => handleDeleteClick(order.id)}
                      >
                        <Trash2 size={18} className="text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <span className="text-gray-600">Page {page} of {totalPages}</span>
        <div className="space-x-2">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl">
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

      <OrderModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        mode={modalMode}
        order={selectedOrder}
        refreshOrders={fetchOrders}
      />
      <ConfirmModal
  open={deleteModalOpen}
  title="Delete Order?"
  description="Are you sure you want to delete this order? This action cannot be undone."
  onConfirm={handleConfirmDelete}
  onCancel={handleCancelDelete}
/>

    </main>
  );
};

export default ManageOrders;
