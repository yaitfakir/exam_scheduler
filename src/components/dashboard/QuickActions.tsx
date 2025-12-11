import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Calendar,
  Sparkles,
  FileDown,
  Users,
  Building2,
} from "lucide-react";

const actions = [
  {
    icon: Plus,
    label: "Nouvel Examen",
    description: "Planifier un CC",
    variant: "gradient" as const,
    action: "navigate",
    path: "/exams",
  },
  {
    icon: Sparkles,
    label: "IA Optimisation",
    description: "Répartir les surveillances",
    variant: "glass" as const,
    action: "toast",
    message: "Fonctionnalité d'optimisation IA en cours de développement",
  },
  {
    icon: Calendar,
    label: "Vue Calendrier",
    description: "Voir le planning",
    variant: "glass" as const,
    action: "navigate",
    path: "/calendar",
  },
  {
    icon: FileDown,
    label: "Exporter PDF",
    description: "Télécharger le planning",
    variant: "glass" as const,
    action: "toast",
    message: "Export PDF en cours de développement",
  },
];

export function QuickActions() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAction = (action: typeof actions[0]) => {
    if (action.action === "navigate" && action.path) {
      navigate(action.path);
    } else if (action.action === "toast" && action.message) {
      toast({
        title: action.label,
        description: action.message,
      });
    }
  };

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.5s" }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Actions Rapides</h3>
        <p className="text-sm text-muted-foreground">Gérer les examens et surveillances</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className="h-auto flex-col items-start gap-2 p-4"
            onClick={() => handleAction(action)}
          >
            <action.icon className="h-5 w-5" />
            <div className="text-left">
              <div className="font-medium text-sm">{action.label}</div>
              <div className="text-xs opacity-70">{action.description}</div>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}

