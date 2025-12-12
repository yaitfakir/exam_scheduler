import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

import Index from "./pages/Index";
import Professors from "./pages/Professors";
import Rooms from "./pages/Rooms";
import Modules from "./pages/Modules";
import Exams from "./pages/Exams";
import Surveillance from "./pages/Surveillance";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Export from "./pages/Export";
import Login from "./pages/Login";

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  if (!session) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<PrivateRoute><Index /></PrivateRoute>} />
          <Route path="/professors" element={<PrivateRoute><Professors /></PrivateRoute>} />
          <Route path="/rooms" element={<PrivateRoute><Rooms /></PrivateRoute>} />
          <Route path="/modules" element={<PrivateRoute><Modules /></PrivateRoute>} />
          <Route path="/exams" element={<PrivateRoute><Exams /></PrivateRoute>} />
          <Route path="/surveillance" element={<PrivateRoute><Surveillance /></PrivateRoute>} />
          {/* <Route path="/calendar" element={<PrivateRoute><Calendar /></PrivateRoute>} /> */}
          <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
          <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
          <Route path="/export" element={<PrivateRoute><Export /></PrivateRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
