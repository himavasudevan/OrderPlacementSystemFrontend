// src/api/orderApi.ts
const ORDER_API_URL = "http://localhost:8080/api/orders";

export const orderApi = {
  async getAll() {
    const res = await fetch(ORDER_API_URL);
    if (!res.ok) throw new Error("Failed to fetch orders");
    return res.json();
  },

  async getById(id: number) {
    const res = await fetch(`${ORDER_API_URL}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch order");
    return res.json();
  },

  async create(order: any) {
    const res = await fetch(ORDER_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error("Failed to create order");
    return res.json();
  },

  async update(id: number, order: any) {
    const res = await fetch(`${ORDER_API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    });
    if (!res.ok) throw new Error("Failed to update order");
    return res.json();
  },

  async delete(id: number) {
    const res = await fetch(`${ORDER_API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete order");
    return true;
  },

  // Optional: check by email before creating
  async checkEmailAndGetPerson(email: string) {
  const res = await fetch(`${ORDER_API_URL}/email-check?email=${encodeURIComponent(email)}`);

  if (res.status === 404) {
    // No customer found
    return null;
  }

  if (!res.ok) {
    // Some other error (e.g., 500)
    throw new Error("Failed to check email");
  }

  return res.json(); // Customer found, return person
}

};
