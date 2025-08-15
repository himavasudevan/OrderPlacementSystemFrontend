import { loginUser } from "@/api/auth";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export const useLogin = () => {
  const [loading, setLoading] = useState(false);
  const { login: loginToContext } = useAuth();

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const data = await loginUser({ email, password });

      // Save token through context
      loginToContext(data.token);

      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error("Invalid credentials.");
      } else {
        toast.error("Login failed. Please try again.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};
