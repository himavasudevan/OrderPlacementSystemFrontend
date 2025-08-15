import axiosInstance from "./axiosInstance";

const ORDER_API_URL = "/api/orders";

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
      validateStatus: () => true // handle 404 manually
    });

    if (res.status === 404) {
      return null;
    }
    if (res.status >= 400) {
      throw new Error("Failed to check email");
    }
    return res.data;
  }
};