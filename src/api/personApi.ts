const API_URL = "http://localhost:8080/api/person";

export const personApi = {
  async getAll() {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Failed to fetch persons");
    return res.json();
  },
  async getById(id: number) {
    const res = await fetch(`${API_URL}/${id}`);
    if (!res.ok) throw new Error("Failed to fetch person");
    return res.json();
  },
  async create(person: any) {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    });
    if (!res.ok) throw new Error("Failed to create person");
    return res.json();
  },
  async update(id: number, person: any) {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(person),
    });
    if (!res.ok) throw new Error("Failed to update person");
    return res.json();
  },
  async delete(id: number) {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) {
    const errorMessage = await res.text(); // 🔥 get the actual message from backend
    throw new Error(errorMessage);         // pass it along to wherever this function is called
  }
    return true;
  },
};
