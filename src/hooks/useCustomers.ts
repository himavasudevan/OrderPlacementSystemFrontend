// useCustomer.ts
import { useEffect, useState, useCallback } from "react";
import { personApi } from "@/api/personApi";
import type { PersonDTO, CreateCustomerDTO } from "@/api/personApi"; // adjust if your types live elsewhere

export function useCustomer() {
  const [customers, setCustomers] = useState<PersonDTO[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<PersonDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper: extract human-friendly message from Axios/Spring
  const setNiceError = (err: unknown, fallback = "Something went wrong") => {
    const msg =
      (err as any)?.response?.data?.message ||
      (err as any)?.response?.data?.error ||
      (err as Error)?.message ||
      fallback;
    setError(msg);
  };

  // Fetch all customers (role_id = 3 under the hood)
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await personApi.getAll(); // customers only
      setCustomers(data as PersonDTO[]);
      setError(null);
    } catch (err) {
      setNiceError(err, "Failed to load customers");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch a single customer
  const fetchById = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = (await personApi.getById(id)) as PersonDTO;
      setCurrentCustomer(data);
      // keep list in sync if already present
      setCustomers((prev) =>
        prev.some((c) => c.id === id) ? prev.map((c) => (c.id === id ? data : c)) : prev
      );
      setError(null);
    } catch (err) {
      setNiceError(err, "Failed to load customer");
    } finally {
      setLoading(false);
    }
  }, []);

  // Create new customer (client forces roleId=3 in personApi.create)
  const create = useCallback(async (person: CreateCustomerDTO) => {
    setLoading(true);
    try {
      const newPerson = (await personApi.create(person)) as PersonDTO;
      setCustomers((prev) => [...prev, newPerson]);
      setCurrentCustomer(newPerson);
      setError(null);
      return newPerson;
    } catch (err) {
      setNiceError(err, "Failed to create customer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update existing customer
  const update = useCallback(async (id: number, person: Partial<PersonDTO>) => {
    setLoading(true);
    try {
      const updatedPerson = (await personApi.update(id, person)) as PersonDTO;
      setCustomers((prev) => prev.map((c) => (c.id === id ? updatedPerson : c)));
      setCurrentCustomer((prev) => (prev?.id === id ? updatedPerson : prev));
      setError(null);
      return updatedPerson;
    } catch (err) {
      setNiceError(err, "Failed to update customer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete customer by ID
  const remove = useCallback(async (id: number) => {
    setLoading(true);
    try {
      await personApi.delete(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setCurrentCustomer((prev) => (prev?.id === id ? null : prev));
      setError(null);
    } catch (err) {
      // e.g. "Cannot delete person because they have existing orders."
      setNiceError(err, "Failed to delete customer");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchAll();
  }, [fetchAll]);

  const clearError = useCallback(() => setError(null), []);

  // initial load
  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    customers,
    currentCustomer,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    refresh,
    clearError,

    // expose setters if a page needs to directly tweak state
    setCurrentCustomer,
    setCustomers,
  };
}
