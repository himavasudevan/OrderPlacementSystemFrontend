
import { useState, useEffect } from "react";
import { orderApi } from "@/api/orderApi";

export function useOrder() {
  const [orders, setOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const data = await orderApi.getAll();
      setOrders(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fetchById = async (id: number) => {
    setLoading(true);
    try {
      const data = await orderApi.getById(id);
      setCurrentOrder(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const create = async (order: any) => {
    setLoading(true);
    try {
      const created = await orderApi.create(order);
      setOrders((prev) => [...prev, created]);
      return created;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const update = async (id: number, order: any) => {
    setLoading(true);
    try {
      const updated = await orderApi.update(id, order);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      return updated;
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: number) => {
    setLoading(true);
    try {
      await orderApi.delete(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch (err) {
      setError((err as Error).message);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  const checkEmail = async (email: string) => {
  try {
    const person = await orderApi.checkEmailAndGetPerson(email);
    // If person is null, no customer found (handled in component)
    return person;
  } catch (error) {
    // Pass error up to component to handle toast etc.
    throw error;
  }
};


  useEffect(() => {
    fetchAll();
  }, []);

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    checkEmail
  };
}
