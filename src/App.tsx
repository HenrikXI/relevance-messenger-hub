
import React, { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

const App = () => {
  // Add state to handle theme initialization
  const [mounted, setMounted] = useState(false);

  // After mounting, we can render our application
  useEffect(() => {
    setMounted(true);
    
    // Initialize theme from localStorage if available
    const savedSettings = localStorage.getItem("hcs-user-settings");
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        const preferredTheme = settings.theme;
        // Theme will be set by ThemeProvider based on the "class" attribute
        document.documentElement.setAttribute("data-theme", preferredTheme);
        document.documentElement.classList.add(preferredTheme);
      } catch (error) {
        console.error("Fehler beim Laden des Themes:", error);
      }
    }
  }, []);

  if (!mounted) {
    return null; // Prevent flash of incorrect theme
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Public routes */}
                <Route path="/signin" element={<SignIn />} />
                <Route path="/signup" element={<SignUp />} />
                
                {/* Protected routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Index />} />
                </Route>
                
                {/* Admin routes */}
                <Route element={<ProtectedRoute requiredRole="admin" />}>
                  {/* Put admin-only routes here if needed */}
                </Route>
                
                {/* Redirect to signin for undefined routes */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
