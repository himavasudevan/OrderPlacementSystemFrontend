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
      setOrders((prev) => prev.map((o) => ((o.id ?? o.orderId) === id ? updated : o)));
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
      setOrders((prev) => prev.filter((o) => (o.id ?? o.orderId) !== id));
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
      return person; // could be null if not found
    } catch (error) {
      throw error;
    }
  };

  // pay for an order
  const pay = async (bestilleId: number, amountPaid: number) => {
    setLoading(true);
    try {
      await orderApi.pay(bestilleId, amountPaid);
      await fetchAll();
      if (currentOrder && (currentOrder.id === bestilleId || currentOrder.orderId === bestilleId)) {
        await fetchById(bestilleId);
      }
      return true;
    } catch (err: any) {
      const msg = (err as Error)?.message || "Payment failed.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 👇 NEW: refund for an order
  const refund = async (bestilleId: number, amountPaid: number) => {
    setLoading(true);
    try {
      await orderApi.refund(bestilleId, amountPaid);
      await fetchAll();
      if (currentOrder && (currentOrder.id === bestilleId || currentOrder.orderId === bestilleId)) {
        await fetchById(bestilleId);
      }
      return true;
    } catch (err: any) {
      const msg = (err as Error)?.message || "Refund failed.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // update order status
  const updateOrderStatus = async (orderId: number, orderStatus: string) => {
    setLoading(true);
    try {
      const updated = await orderApi.updateOrderStatus({ orderId, orderStatus });
      await fetchAll();
      if (currentOrder && (currentOrder.id === orderId || currentOrder.orderId === orderId)) {
        await fetchById(orderId);
      }
      return updated;
    } catch (err) {
      setError((err as Error).message || "Failed to update order status.");
      throw err;
    } finally {
      setLoading(false);
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
    checkEmail,
    pay,
    refund,            
    updateOrderStatus,
  };
}
