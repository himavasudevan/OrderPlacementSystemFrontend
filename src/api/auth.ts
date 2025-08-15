import axiosInstance from "./axiosInstance";


export type LoginRequest = {
  email: string;
  password: string;
};
export type LoginResponse = {
  token: string;
};
export const loginUser = async (credentials: LoginRequest) => {
  try {
    const response = await axiosInstance.post("/api/auth/login", credentials);
    return response.data;
  } catch (error) {
    throw error;
  }
};
