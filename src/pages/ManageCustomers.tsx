"use client";

import { useState, useEffect } from "react";
import { personApi } from "@/api/personApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CustomerModal } from "@/components/CustomerModal";
import { Pencil, Trash2, Plus, Filter, ArrowUpDown } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ConfirmModal } from "@/components/ConfirmModal";

interface Customer {
  id: number;
  navn: string;
  epost: string;
  telefonnummer: string;
  roleId: number;
}

export default function ManageCustomer() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Customer | "">("");
  const [sortAsc, setSortAsc] = useState(true);
  const itemsPerPage = 5;
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      setLoading(true);
      const data = await personApi.getAll();
      if (!Array.isArray(data)) throw new Error("Invalid data format");
      const mapped = data.map((c: any) => ({
        id: c.id,
        navn: c.navn,
        epost: c.epost,
        telefonnummer: c.telefonnummer,
        roleId: c.roleId
      }));
      setCustomers(mapped);
    } catch (error) {
      toast.error("Failed to fetch customers");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(data: any) {
  try {
    if (editingCustomer) {
      await personApi.update(editingCustomer.id, { ...data, roleId: editingCustomer.roleId });
      toast.success("Customer updated!");
    } else {
      await personApi.create({ ...data, roleId: 2 });
      toast.success("Customer created!"); // ✅ only runs if no error above
    }
    fetchCustomers();
    setEditingCustomer(null);
  } catch (error: any) {
    toast.error(error.message || "Failed to save customer");
    console.error("Save Error:", error);
  }
}





  async function handleDeleteConfirmed() {
  if (!customerToDelete) return;

  try {
    await personApi.delete(customerToDelete.id);
    toast.success("Customer deleted");
    fetchCustomers();
  } catch (err) {
    const errorMsg = (err as Error).message || "Failed to delete customer";
    toast.error(errorMsg); //  shows real backend message
  } finally {
    setDeleteModalOpen(false);
    setCustomerToDelete(null);
  }
}

  function handleSort(field: keyof Customer) {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  const filtered = (customers ?? [])
    .filter(c => {
      if (!c) return false;
      const epost = (c.epost ?? '').toLowerCase();
      const domain = epost.split('@')[1] ?? '';
      const matchesDomain = selectedDomain === "all" || domain === selectedDomain;
      const matchesSearch =
        (c.navn ?? '').toLowerCase().includes(search.toLowerCase()) ||
        epost.includes(search.toLowerCase());
      return matchesDomain && matchesSearch;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      const valA = a[sortField] ?? '';
      const valB = b[sortField] ?? '';
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    if (!loading && search && filtered.length === 0) {
      toast.error("No matching customers found.");
    }
  }, [filtered, search, loading]);

  return (
    <>
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold text-gray-800">Manage Customers</h1>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow rounded-xl"
          >
            <Plus className="mr-2" /> New Customer
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search name or email"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="max-w-xs rounded-xl"
          />

          <div className="flex items-center gap-1">
            <Filter size={16} className="text-gray-600" />
            <select
              value={selectedDomain}
              onChange={e => setSelectedDomain(e.target.value)}
              className="border rounded-xl px-2 py-1 text-gray-700"
            >
              <option value="all">All domains</option>
              <option value="gmail.com">gmail.com</option>
              <option value="yahoo.com">yahoo.com</option>
              <option value="outlook.com">outlook.com</option>
              <option value="hotmail.com">hotmail.com</option>
            </select>
          </div>
        </div>

        <Card className="shadow-lg rounded-2xl border border-gray-100">
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-center text-gray-500">Loading...</p>
            ) : (
              <Table>
                <TableHeader className="bg-gray-100">
                  <TableRow>
                    <TableHead className="text-gray-700 font-semibold cursor-pointer" onClick={() => handleSort("navn")}>Name <ArrowUpDown className="inline ml-1" size={16} /></TableHead>
                    <TableHead className="text-gray-700 font-semibold cursor-pointer" onClick={() => handleSort("epost")}>Email <ArrowUpDown className="inline ml-1" size={16} /></TableHead>
                    <TableHead className="text-gray-700 font-semibold cursor-pointer" onClick={() => handleSort("telefonnummer")}>Phone <ArrowUpDown className="inline ml-1" size={16} /></TableHead>
                    <TableHead className="text-right text-gray-700 font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map(customer => (
                    <TableRow
                      key={customer.id}
                      className="hover:bg-gray-50 even:bg-gray-50/30 transition-colors"
                    >
                      <TableCell className="py-3">{customer.navn}</TableCell>
                      <TableCell className="py-3">{customer.epost}</TableCell>
                      <TableCell className="py-3">{customer.telefonnummer}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCustomer(customer);
                            setShowModal(true);
                          }}
                          className="hover:bg-blue-50"
                        >
                          <Pencil size={18} className="text-blue-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCustomerToDelete(customer);
                            setDeleteModalOpen(true);
                          }}
                          className="hover:bg-red-50"
                        >
                          <Trash2 size={18} className="text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                        No customers to display.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <div className="space-x-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-xl"
            >
              Prev
            </Button>
            <Button
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      <CustomerModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingCustomer(null);
        }}
        onSave={handleSave}
        initialData={editingCustomer ?? undefined}
      />

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Customer"
        description={`Are you sure you want to delete "${customerToDelete?.navn}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setDeleteModalOpen(false);
          setCustomerToDelete(null);
        }}
      />
    </>
  );
}
