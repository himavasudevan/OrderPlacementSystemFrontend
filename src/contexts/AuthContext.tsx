import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import type { ReactNode } from "react";


type Role = "admin" | "Konsulent";

// Match the JWT payload from backend
type DecodedToken = {
  sub: string;   // email (subject)
  role: string;  // read as string, normalize to Role below
  id?: number;
  name?: string; // <-- backend claim key is "name"
  exp: number;   // seconds since epoch
  iat?: number;
};

// What we store in context
type UserInfo = {
  email: string;
  role: Role;
  id?: number;
  name?: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  user: UserInfo | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Optional: normalize role strings from backend to your UI roles
const normalizeRole = (raw: string): Role => {
  const r = (raw || "").toLowerCase();
  if (r === "admin") return "admin";
  if (r === "konsulent") return "Konsulent";
  // fallback: treat unknown as lowest-priv user (pick one)
  return "Konsulent";
};

// Optional: token is expired?
const isExpired = (exp?: number) => {
  if (!exp) return true;
  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowSeconds;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

  const decodeToken = (token: string): UserInfo | null => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // If expired, ignore
      if (isExpired(decoded.exp)) {
        return null;
      }

      return {
        email: decoded.sub,
        role: normalizeRole(decoded.role),
        id: decoded.id,
        name: decoded.name, // <-- use "name"
      };
    } catch (error) {
      console.error("Invalid token", error);
      return null;
    }
  };

  const login = (token: string) => {
    const userInfo = decodeToken(token);
    if (userInfo) {
      localStorage.setItem("token", token);
      setUser(userInfo);
      setIsAuthenticated(true);
    } else {
      // If token invalid/expired, ensure clean state
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userInfo = decodeToken(token);
      if (userInfo) {
        setUser(userInfo);
        setIsAuthenticated(true);
      } else {
        // auto-logout expired token
        localStorage.removeItem("token");
        setIsAuthenticated(false);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
