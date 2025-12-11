import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Professor {
  id: number;
  name: string;
  department: string;
  currentLoad: number;
  maxLoad: number;
  availability: string[];
}

interface Surveillance {
  id: number;
  exam: string;
  date: string;
  time: string;
  room: string;
  students: number;
  professors: { name: string; role: string; load: number }[];
  status: string;
  conflictMessage?: string;
}

interface Assignment {
  surveillanceId: number;
  exam: string;
  assignedProfessors: { professorId: number; name: string; role: string }[];
  reason: string;
}

interface Conflict {
  surveillanceId: number;
  issue: string;
  suggestion: string;
}

interface OptimizationResult {
  assignments: Assignment[];
  conflicts: Conflict[];
  summary: {
    totalAssigned: number;
    totalConflicts: number;
    averageLoad: number;
    recommendation: string;
  };
  error?: string;
}

export function useSurveillanceOptimization() {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);

  const optimize = async (surveillances: Surveillance[], professors: Professor[]) => {
    setIsOptimizing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('optimize-surveillance', {
        body: { surveillances, professors }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        toast.error(data.error);
        return null;
      }

      setResult(data);
      toast.success("Optimisation terminée avec succès !");
      return data;

    } catch (error) {
      console.error("Optimization error:", error);
      toast.error("Erreur lors de l'optimisation. Veuillez réessayer.");
      return null;
    } finally {
      setIsOptimizing(false);
    }
  };

  return {
    optimize,
    isOptimizing,
    result,
    clearResult: () => setResult(null)
  };
}
