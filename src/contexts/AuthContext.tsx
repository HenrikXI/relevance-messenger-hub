
import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "user" | "admin";

interface User {
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Initialize user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("hcs-user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("hcs-user");
      }
    }
    setLoading(false);
  }, []);

  // Mock user database for demo purposes
  const [users, setUsers] = useState<Record<string, { password: string; role: UserRole }>>(() => {
    const storedUsers = localStorage.getItem("hcs-users");
    return storedUsers ? JSON.parse(storedUsers) : {
      "admin@example.com": { password: "admin123", role: "admin" },
      "user@example.com": { password: "user123", role: "user" }
    };
  });

  useEffect(() => {
    localStorage.setItem("hcs-users", JSON.stringify(users));
  }, [users]);

  const signUp = async (email: string, password: string, isAdmin: boolean = false) => {
    if (users[email]) {
      toast.error("Benutzer existiert bereits");
      return;
    }

    const newUser = {
      password,
      role: isAdmin ? "admin" as UserRole : "user" as UserRole
    };

    setUsers({ ...users, [email]: newUser });
    
    const userData = { email, role: newUser.role };
    setUser(userData);
    localStorage.setItem("hcs-user", JSON.stringify(userData));
    toast.success("Registrierung erfolgreich");
    router.navigate("/");
  };

  const signIn = async (email: string, password: string) => {
    const userRecord = users[email];
    
    if (!userRecord || userRecord.password !== password) {
      toast.error("Ungültige Anmeldedaten");
      return;
    }

    const userData = { email, role: userRecord.role };
    setUser(userData);
    localStorage.setItem("hcs-user", JSON.stringify(userData));
    toast.success("Anmeldung erfolgreich");
    router.navigate("/");
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("hcs-user");
    router.navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
