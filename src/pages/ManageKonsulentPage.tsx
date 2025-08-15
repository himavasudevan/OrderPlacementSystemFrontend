"use client";

import { useEffect, useMemo, useState } from "react";
import { personApi } from "@/api/personApi";
import type { CreateKonsulentDTO, PersonDTO } from "@/api/personApi";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Filter, ArrowUpDown } from "lucide-react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { ConfirmModal } from "@/components/ConfirmModal";
import { KonsulentModal } from "@/components/KonsulentModal";

type Konsulent = PersonDTO;

export default function ManageKonsulentPage() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [konsulentToDelete, setKonsulentToDelete] = useState<Konsulent | null>(null);
  const [konsulenter, setKonsulenter] = useState<Konsulent[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingKonsulent, setEditingKonsulent] = useState<Konsulent | null>(null);

  const [search, setSearch] = useState("");
  const [selectedDomain, setSelectedDomain] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof Konsulent | "">("");
  const [sortAsc, setSortAsc] = useState(true);


  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchKonsulenter();
  }, []);

  async function fetchKonsulenter() {
    try {
      setLoading(true);
      const data = await personApi.getAllKonsulenter(); // role_id = 2
      if (!Array.isArray(data)) throw new Error("Invalid data format");
      const mapped: Konsulent[] = data.map((k: any) => ({
        id: k.id,
        navn: k.navn,
        epost: k.epost,
        telefonnummer: k.telefonnummer,
        roleId: k.roleId,
      }));
      setKonsulenter(mapped);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to fetch konsulenter";
      toast.error(msg);
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // CREATE (requires password)
  async function handleCreate(data: CreateKonsulentDTO) {
    try {
      await personApi.createKonsulent(data); // API will enforce roleId=KONSULENT if omitted
      toast.success("Konsulent created!");
      await fetchKonsulenter();
      setShowModal(false);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create konsulent";
      toast.error(msg);
      // eslint-disable-next-line no-console
      console.error("Create Error:", error);
    }
  }

  // UPDATE (no password here)
  async function handleUpdate(data: Partial<PersonDTO>) {
    if (!editingKonsulent) return;
    try {
      await personApi.update(editingKonsulent.id, {
        ...data,
        roleId: editingKonsulent.roleId, // keep konsulent role
      });
      toast.success("Konsulent updated!");
      await fetchKonsulenter();
      setEditingKonsulent(null);
      setShowModal(false);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update konsulent";
      toast.error(msg);
      // eslint-disable-next-line no-console
      console.error("Update Error:", error);
    }
  }

  // DELETE
  async function handleDeleteConfirmed() {
    if (!konsulentToDelete) return;
    try {
      await personApi.delete(konsulentToDelete.id);
      toast.success("Konsulent deleted");
      await fetchKonsulenter();
    } catch (err: any) {
      const errorMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to delete konsulent";
      toast.error(errorMsg);
    } finally {
      setDeleteModalOpen(false);
      setKonsulentToDelete(null);
    }
  }

  function handleSort(field: keyof Konsulent) {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  }

  // domain list
  const domainOptions = useMemo(() => {
    const domains = new Set<string>();
    konsulenter.forEach((k) => {
      const d = k?.epost?.split("@")[1];
      if (d) domains.add(d.toLowerCase());
    });
    ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com"].forEach((d) => domains.add(d));
    return ["all", ...Array.from(domains).sort()];
  }, [konsulenter]);

  const filtered = useMemo(() => {
    return (konsulenter ?? [])
      .filter((k) => {
        const epost = (k.epost ?? "").toLowerCase();
        const domain = epost.split("@")[1] ?? "";
        const matchesDomain = selectedDomain === "all" || domain === selectedDomain;
        const matchesSearch =
          (k.navn ?? "").toLowerCase().includes(search.toLowerCase()) ||
          epost.includes(search.toLowerCase());
        return matchesDomain && matchesSearch;
      })
      .sort((a, b) => {
        if (!sortField) return 0;
        const valA = a[sortField] ?? "";
        const valB = b[sortField] ?? "";
        return sortAsc
          ? String(valA).localeCompare(String(valB))
          : String(valB).localeCompare(String(valA));
      });
  }, [konsulenter, search, selectedDomain, sortField, sortAsc]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  useEffect(() => {
    setPage(1);
  }, [search, selectedDomain]);

  useEffect(() => {
    if (!loading && search && filtered.length === 0) {
      toast.error("No matching konsulenter found.");
    }
  }, [filtered, search, loading]);

  return (
    <>
      <main className="max-w-6xl mx-auto p-6 space-y-6 bg-background text-foreground">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Manage Konsulenter</h1>
          <Button
            onClick={() => {
              setEditingKonsulent(null);
              setShowModal(true);
            }}
            className="rounded-xl"
          >
            <Plus className="mr-2 h-4 w-4" /> New Konsulent
          </Button>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <Input
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-xs rounded-xl"
          />

          <div className="flex items-center gap-2">
            <Filter size={16} className="text-muted-foreground" />
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="rounded-xl px-3 py-2 bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {domainOptions.map((d) => (
                <option key={d} value={d}>
                  {d === "all" ? "All domains" : d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Card className="shadow-lg rounded-2xl border border-border">
          <CardContent className="p-0">
            {loading ? (
              <p className="p-6 text-center text-muted-foreground">Loading...</p>
            ) : (
              <Table>
                <TableHeader className="bg-muted/60">
                  <TableRow>
                    <TableHead
                      className="font-semibold cursor-pointer text-foreground"
                      onClick={() => handleSort("navn")}
                    >
                      Name <ArrowUpDown className="inline ml-1 h-4 w-4 text-muted-foreground" />
                    </TableHead>
                    <TableHead
                      className="font-semibold cursor-pointer text-foreground"
                      onClick={() => handleSort("epost")}
                    >
                      Email <ArrowUpDown className="inline ml-1 h-4 w-4 text-muted-foreground" />
                    </TableHead>
                    <TableHead
                      className="font-semibold cursor-pointer text-foreground"
                      onClick={() => handleSort("telefonnummer")}
                    >
                      Phone <ArrowUpDown className="inline ml-1 h-4 w-4 text-muted-foreground" />
                    </TableHead>
                    <TableHead className="text-right font-semibold text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((konsulent) => (
                    <TableRow key={konsulent.id} className="hover:bg-accent/50 even:bg-muted/30 transition-colors">
                      <TableCell className="py-3">{konsulent.navn}</TableCell>
                      <TableCell className="py-3">{konsulent.epost}</TableCell>
                      <TableCell className="py-3">{konsulent.telefonnummer}</TableCell>
                      <TableCell className="text-right space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingKonsulent(konsulent);
                            setShowModal(true);
                          }}
                          className="hover:bg-accent"
                          aria-label="Edit konsulent"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setKonsulentToDelete(konsulent);
                            setDeleteModalOpen(true);
                          }}
                          className="hover:bg-accent"
                          aria-label="Delete konsulent"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {paginated.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                        No konsulenter to display.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">
            Page {page} of {totalPages || 1}
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
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl"
            >
              Next
            </Button>
          </div>
        </div>
      </main>

      {/* Render modal with discriminated props to satisfy TS */}
      {editingKonsulent ? (
        <KonsulentModal
          mode="edit"
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingKonsulent(null);
          }}
          onSave={handleUpdate} // Partial<PersonDTO>
          initialData={editingKonsulent}
        />
      ) : (
        <KonsulentModal
          mode="create"
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingKonsulent(null);
          }}
          onSave={handleCreate} // CreateKonsulentDTO
        />
      )}

      <ConfirmModal
        open={deleteModalOpen}
        title="Delete Konsulent"
        description={`Are you sure you want to delete "${konsulentToDelete?.navn}"? This action cannot be undone.`}
        onConfirm={handleDeleteConfirmed}
        onCancel={() => {
          setDeleteModalOpen(false);
          setKonsulentToDelete(null);
        }}
      />
    </>
  );
}
