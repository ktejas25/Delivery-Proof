import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

export interface User {
  id?: number;
  uuid: string;
  email: string;
  first_name: string;
  last_name: string;
  user_type: string;
  business_name?: string;
  business_id?: number;
  name?: string;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  googleLogin: (googleData: {
    email: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    business_name?: string;
  }) => Promise<void>;
  customerLogin: (email: string, password: string) => Promise<void>;
  customerRegister: (data: any) => Promise<void>;
  changePassword: (new_password: string, confirm_password: string) => Promise<void>;
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
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        first_name: parsed.first_name || parsed.name?.split(" ")[0] || "",
        last_name:
          parsed.last_name || parsed.name?.split(" ").slice(1).join(" ") || "",
        must_change_password: !!parsed.must_change_password,
      };
    } catch {
      return null;
    }
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

  const googleLogin = async (googleData: {
    email: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    business_name?: string;
  }) => {
    const response = await api.post("/auth/google", googleData);
    const { token, user } = response.data;
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
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

  const changePassword = async (new_password: string, confirm_password: string) => {
    const response = await api.post("/auth/change-password", {
      new_password,
      confirm_password,
    });
    const updatedUser = response.data.user;
    if (updatedUser) {
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else if (user) {
      const refreshed = { ...user, must_change_password: false };
      setUser(refreshed);
      localStorage.setItem("user", JSON.stringify(refreshed));
    }
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
        googleLogin,
        customerLogin,
        customerRegister,
        changePassword,
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
