import { useState, useEffect } from "react";
import { personApi } from "@/api/personApi";

export function useCustomer() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all customers
  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await personApi.getAll();
      setCustomers(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer by ID
  const fetchById = async (id: number) => {
    setLoading(true);
    try {
      const data = await personApi.getById(id);
      setCurrentCustomer(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Create new customer
  const create = async (person: any) => {
    setLoading(true);
    try {
      const newPerson = await personApi.create(person);
      setCustomers((prev) => [...prev, newPerson]);
      setError(null);
      return newPerson;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing customer
  const update = async (id: number, person: any) => {
    setLoading(true);
    try {
      const updatedPerson = await personApi.update(id, person);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? updatedPerson : c))
      );
      setError(null);
      return updatedPerson;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete customer by ID
const remove = async (id: number) => {
  setLoading(true);
  try {
    await personApi.delete(id);
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    setError(null);
  } catch (err) {
    const errorMsg = (err as Error).message;
    setError(errorMsg); //  Shows: "Cannot delete person because they have existing orders."
    
  } finally {
    setLoading(false);
  }
};


  // Fetch all customers when hook loads
  useEffect(() => {
    fetchAll();
  }, []);

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
  };
}
