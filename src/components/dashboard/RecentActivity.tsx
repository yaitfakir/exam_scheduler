import { cn } from "@/lib/utils";
import {
  UserPlus,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";

const activities = [
  {
    id: 1,
    icon: UserPlus,
    title: "Nouveau surveillant assigné",
    description: "Dr. Ahmed Benali assigné à Analyse Numérique",
    time: "Il y a 5 min",
    type: "success",
  },
  {
    id: 2,
    icon: Calendar,
    title: "Examen reprogrammé",
    description: "Programmation Web déplacé au 16 Jan",
    time: "Il y a 15 min",
    type: "info",
  },
  {
    id: 3,
    icon: AlertTriangle,
    title: "Conflit détecté",
    description: "Prof. Fatima Zahra - double assignation",
    time: "Il y a 30 min",
    type: "warning",
  },
  {
    id: 4,
    icon: CheckCircle,
    title: "Conflit résolu",
    description: "Surveillance Base de Données réattribuée",
    time: "Il y a 1h",
    type: "success",
  },
  {
    id: 5,
    icon: Edit,
    title: "Salle modifiée",
    description: "Électronique: Amphi A → Amphi B",
    time: "Il y a 2h",
    type: "default",
  },
];

const typeStyles = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  default: "bg-secondary text-muted-foreground",
};

export function RecentActivity() {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.6s" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Activité Récente</h3>
          <p className="text-sm text-muted-foreground">Journal des modifications</p>
        </div>
        <button className="text-sm font-medium text-primary hover:underline">
          Voir tout
        </button>
      </div>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-secondary/30"
          >
            <div
              className={cn(
                "rounded-lg p-2",
                typeStyles[activity.type as keyof typeof typeStyles]
              )}
            >
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground">{activity.title}</p>
              <p className="text-xs text-muted-foreground truncate">
                {activity.description}
              </p>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
