import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

interface User {
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  business_name: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  customerLogin: (email: string, password: string) => Promise<void>;
  customerRegister: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return {
      ...parsed,
      first_name: parsed.first_name || parsed.name?.split(' ')[0] || '',
      last_name: parsed.last_name || parsed.name?.split(' ').slice(1).join(' ') || ''
    };
  });
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const register = async (data: any) => {
    await api.post("/auth/register", data);
  };

  const customerLogin = async (email: string, password: string) => {
    const response = await api.post("/customer/login", { email, password });
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const customerRegister = async (data: any) => {
    await api.post("/customer/register", data);
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        customerLogin,
        customerRegister,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
