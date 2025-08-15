import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/useLogin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { jwtDecode } from "jwt-decode";

type LoginFormInputs = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>();

  const { login, loading } = useLogin();
  const navigate = useNavigate();
  const {user}=useAuth();

  const onSubmit = async (data: LoginFormInputs) => {
  const success = await login(data.email, data.password);
  if (success) {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded: { role: string } = jwtDecode(token);
      const rolePath = decoded.role.toLowerCase();
      navigate(`/${rolePath}`);
    }
  }
};

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left side - full background image */}
      <div
        className="hidden md:block bg-cover bg-center"
        style={{ backgroundImage: "url('/newimg.webp')" }}
      ></div>

      {/* Right side - login form + logo + heading */}
      <div className="relative flex flex-col items-center justify-center p-4 bg-gray-100">
        {/* Top-left logo + heading (branding row) */}
        <div className="absolute top-4 left-4 flex items-center space-x-3">
          <img
            src="/logo.jpeg"
            alt="Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain"
          />
          <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-700">
            Order Management System
          </h1>
        </div>

        {/* Login Card */}
        <Card className="w-full max-w-md shadow-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Login</CardTitle>
          
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  id="email"
                  {...register("email", { required: "Email is required" })}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  id="password"
                  {...register("password", { required: "Password is required" })}
                />
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
