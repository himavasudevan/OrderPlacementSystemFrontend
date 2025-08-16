// orderApi.ts
import axiosInstance from "./axiosInstance";

const ORDER_API_URL = "/api/orders";
const ORDER_PAYMENTS_URL = `${ORDER_API_URL}/payments`;
const ORDER_REFUNDS_URL = `${ORDER_API_URL}/refunds`; // 👈 NEW
const ORDER_STATUS_URL = `${ORDER_API_URL}/orderStatus`;

export const orderApi = {
  async getAll() {
    const res = await axiosInstance.get(ORDER_API_URL);
    return res.data;
  },

  async getById(id: number) {
    const res = await axiosInstance.get(`${ORDER_API_URL}/${id}`);
    return res.data;
  },

  async create(order: any) {
    const res = await axiosInstance.post(ORDER_API_URL, order);
    return res.data;
  },

  async update(id: number, order: any) {
    const res = await axiosInstance.put(`${ORDER_API_URL}/${id}`, order);
    return res.data;
  },

  async delete(id: number) {
    await axiosInstance.delete(`${ORDER_API_URL}/${id}`);
    return true;
  },

  async checkEmailAndGetPerson(email: string) {
    const res = await axiosInstance.get(`${ORDER_API_URL}/email-check`, {
      params: { email },
      validateStatus: () => true, // handle 404 manually
    });

    if (res.status === 404) {
      return null;
    }
    if (res.status >= 400) {
      throw new Error("Failed to check email");
    }
    return res.data;
  },

  // pay
  async pay(bestilleId: number, amountPaid: number): Promise<boolean> {
    try {
      const payload = { bestilleId, amountPaid } as BestillePaymentDTO;
      const res = await axiosInstance.post(ORDER_PAYMENTS_URL, payload);
      return res.status >= 200 && res.status < 300;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) throw new Error("This order is already paid.");
      throw new Error("Payment failed.");
    }
  },

  //  refund
  async refund(bestilleId: number, amountPaid: number): Promise<boolean> {
    try {
      const payload = { bestilleId, amountPaid } as BestillePaymentDTO;
      const res = await axiosInstance.post(ORDER_REFUNDS_URL, payload);
      return res.status >= 200 && res.status < 300;
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) throw new Error("This order cannot be refunded.");
      throw new Error("Refund failed.");
    }
  },

  async updateOrderStatus(dto: OrderStatusUpdateDTO) {
    const res = await axiosInstance.put(ORDER_STATUS_URL, dto);
    return res.data; // updated Bestille
  },
};

// Types
export type BestillePaymentDTO = {
  bestilleId: number;
  amountPaid: number;
};

export type OrderStatusUpdateDTO = {
  orderId: number;
  orderStatus: string;
};
