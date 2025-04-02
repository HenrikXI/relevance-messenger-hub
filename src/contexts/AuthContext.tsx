
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type UserRole = "user" | "admin";

interface User {
  email: string;
  role: UserRole;
  verified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, isAdmin?: boolean) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  verifyEmail: (verificationCode: string) => Promise<boolean>;
  sendVerificationEmail: (email: string) => Promise<void>;
  pendingVerificationEmail: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Simulierte Verifizierungscodes für Benutzer
const generateVerificationCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string | null>(null);
  const [verificationCodes, setVerificationCodes] = useState<Record<string, string>>({});
  const navigate = useNavigate();

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
  const [users, setUsers] = useState<Record<string, { password: string; role: UserRole; verified: boolean }>>(() => {
    const storedUsers = localStorage.getItem("hcs-users");
    return storedUsers ? JSON.parse(storedUsers) : {
      "admin@example.com": { password: "admin123", role: "admin", verified: true },
      "user@example.com": { password: "user123", role: "user", verified: true }
    };
  });

  useEffect(() => {
    localStorage.setItem("hcs-users", JSON.stringify(users));
  }, [users]);

  const sendVerificationEmail = async (email: string) => {
    // Generiere einen Verifikationscode
    const code = generateVerificationCode();
    setVerificationCodes(prev => ({ ...prev, [email]: code }));
    
    // Setze die E-Mail als ausstehend zur Verifizierung
    setPendingVerificationEmail(email);
    
    // In einer echten App würde hier eine E-Mail gesendet werden
    toast.success(`Bestätigungs-E-Mail wurde an ${email} gesendet`, {
      description: "Bitte überprüfen Sie Ihre E-Mail und bestätigen Sie Ihre Anmeldung."
    });
    
    // Navigiere zur Bestätigungsseite
    navigate("/verify-email");
  };

  const verifyEmail = async (inputCode: string): Promise<boolean> => {
    if (!pendingVerificationEmail) {
      toast.error("Keine ausstehende E-Mail-Überprüfung");
      return false;
    }

    const correctCode = verificationCodes[pendingVerificationEmail];
    
    if (inputCode === correctCode) {
      // Aktualisiere den Benutzer als verifiziert
      const updatedUsers = { ...users };
      if (updatedUsers[pendingVerificationEmail]) {
        updatedUsers[pendingVerificationEmail].verified = true;
        setUsers(updatedUsers);
        
        // Aktualisiere den aktuellen Benutzer falls angemeldet
        if (user && user.email === pendingVerificationEmail) {
          const updatedUser = { ...user, verified: true };
          setUser(updatedUser);
          localStorage.setItem("hcs-user", JSON.stringify(updatedUser));
        }
      }
      
      // Lösche den verifizierten Code und die ausstehende E-Mail
      const { [pendingVerificationEmail]: _, ...restCodes } = verificationCodes;
      setVerificationCodes(restCodes);
      setPendingVerificationEmail(null);
      
      toast.success("E-Mail erfolgreich verifiziert!");
      navigate("/");
      return true;
    } else {
      toast.error("Ungültiger Verifizierungscode");
      return false;
    }
  };

  const signUp = async (email: string, password: string, isAdmin: boolean = false) => {
    if (users[email]) {
      toast.error("Benutzer existiert bereits");
      return;
    }

    const newUser = {
      password,
      role: isAdmin ? "admin" as UserRole : "user" as UserRole,
      verified: false
    };

    setUsers({ ...users, [email]: newUser });
    
    // Sende Verifizierungs-E-Mail anstatt den Benutzer direkt anzumelden
    await sendVerificationEmail(email);
    
    toast.success("Registrierung erfolgreich", {
      description: "Bitte überprüfen Sie Ihre E-Mail, um Ihr Konto zu bestätigen."
    });
  };

  const signIn = async (email: string, password: string) => {
    const userRecord = users[email];
    
    if (!userRecord || userRecord.password !== password) {
      toast.error("Ungültige Anmeldedaten");
      return;
    }

    if (!userRecord.verified) {
      toast.warning("Konto nicht verifiziert", {
        description: "Bitte bestätigen Sie zuerst Ihre E-Mail-Adresse."
      });
      await sendVerificationEmail(email);
      return;
    }

    const userData = { email, role: userRecord.role, verified: userRecord.verified };
    setUser(userData);
    localStorage.setItem("hcs-user", JSON.stringify(userData));
    toast.success("Anmeldung erfolgreich");
    navigate("/");
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem("hcs-user");
    navigate("/signin");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signUp, 
      signIn, 
      signOut, 
      verifyEmail, 
      sendVerificationEmail,
      pendingVerificationEmail
    }}>
      {children}
    </AuthContext.Provider>
  );
};
