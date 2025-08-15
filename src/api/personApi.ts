// personApi.ts
import axiosInstance from "./axiosInstance";

/** Centralized role IDs so it’s not magic numbers all over the app */
export const ROLE = {
  KONSULENT: 2,
  CUSTOMER: 3,
} as const;

const PERSON_API_URL = "/api/person";

/** ---- Types you return/render in the UI (no password!) ---- */
export interface PersonDTO {
  id: number;
  navn: string;
  epost: string;
  telefonnummer: string;
  roleId: number;
}

/** ---- Request DTOs ---- */
export interface CreateCustomerDTO {
  navn: string;
  epost: string;
  telefonnummer: string;
  /** roleId is optional; we’ll default to CUSTOMER on the client */
  roleId?: number;
}

export interface CreateKonsulentDTO {
  navn: string;
  epost: string;
  telefonnummer: string;
  password: string;
  /** optional; server will default to KONSULENT if omitted */
  roleId?: number;
}

/** Small helper to extract a nice error message from Spring */
function getAxiosErrorMessage(error: any, fallback = "Request failed") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

export const personApi = {
  /** ========== CUSTOMER CRUD (default) ========== */

  // List ONLY customers (role_id = 3)
  async getAll(): Promise<PersonDTO[]> {
    const res = await axiosInstance.get(`${PERSON_API_URL}/customers`);
    return res.data;
  },

  // Get by id (works for any person; you’ll usually use it for customers)
  async getById(id: number): Promise<PersonDTO> {
    const res = await axiosInstance.get(`${PERSON_API_URL}/${id}`);
    return res.data;
  },

  // Create CUSTOMER (no password). We force roleId=3 on the client for safety.
  async create(person: CreateCustomerDTO): Promise<PersonDTO> {
    try {
      const payload = { ...person, roleId: ROLE.CUSTOMER };
      const res = await axiosInstance.post(PERSON_API_URL, payload);
      return res.data;
    } catch (error: any) {
      throw new Error(getAxiosErrorMessage(error, "Failed to create customer"));
    }
  },

  // Update CUSTOMER (generic update; server will not touch password)
  async update(id: number, person: Partial<PersonDTO>): Promise<PersonDTO> {
    try {
      const res = await axiosInstance.put(`${PERSON_API_URL}/${id}`, person);
      return res.data;
    } catch (error: any) {
      throw new Error(getAxiosErrorMessage(error, "Failed to update customer"));
    }
  },

  // Delete CUSTOMER (server will block if they have orders)
  async delete(id: number): Promise<boolean> {
    try {
      await axiosInstance.delete(`${PERSON_API_URL}/${id}`);
      return true;
    } catch (error: any) {
      throw new Error(getAxiosErrorMessage(error, "Failed to delete customer"));
    }
  },

  /** ========== KONSULENT HELPERS (separate) ========== */

  // List ONLY konsulenter (role_id = 2)
  async getAllKonsulenter(): Promise<PersonDTO[]> {
    const res = await axiosInstance.get(`${PERSON_API_URL}/konsulenter`);
    return res.data;
    // If you later want pagination, add query params here.
  },

  // Create KONSULENT (with password). We default roleId=2 if caller doesn't pass it.
  async createKonsulent(k: CreateKonsulentDTO): Promise<PersonDTO> {
    try {
      const payload = { roleId: ROLE.KONSULENT, ...k };
      const res = await axiosInstance.post(`${PERSON_API_URL}/konsulent`, payload);
      return res.data;
    } catch (error: any) {
      throw new Error(getAxiosErrorMessage(error, "Failed to create konsulent"));
    }
  },
};
