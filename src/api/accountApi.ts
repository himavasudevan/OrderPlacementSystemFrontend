// src/api/accountApi.ts
import axiosInstance from "./axiosInstance";

function getAxiosErrorMessage(error: any, fallback = "Request failed") {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    fallback
  );
}

const ACCOUNT_API_URL = "/api/account";

export const accountApi = {
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await axiosInstance.put(`${ACCOUNT_API_URL}/password`, {
        currentPassword,
        newPassword,
      });
      return true;
    } catch (error: any) {
      throw new Error(getAxiosErrorMessage(error, "Failed to update password"));
    }
  },
};
