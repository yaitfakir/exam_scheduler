import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const exams = [
  {
    id: 1,
    module: "Analyse Numérique",
    date: "15 Jan 2025",
    time: "08:30 - 10:30",
    room: "Amphi A",
    groups: ["1A-G1", "1A-G2"],
    status: "upcoming",
  },
  {
    id: 2,
    module: "Programmation Web",
    date: "15 Jan 2025",
    time: "14:00 - 16:00",
    room: "Salle B-12",
    groups: ["2A-G1"],
    status: "upcoming",
  },
  {
    id: 3,
    module: "Base de Données",
    date: "16 Jan 2025",
    time: "10:00 - 12:00",
    room: "Salle C-05",
    groups: ["2A-G2", "2A-G3"],
    status: "pending",
  },
  {
    id: 4,
    module: "Électronique",
    date: "17 Jan 2025",
    time: "08:30 - 10:30",
    room: "Amphi B",
    groups: ["1A-G3"],
    status: "pending",
  },
];

const statusStyles = {
  upcoming: "bg-primary/10 text-primary border-primary/20",
  pending: "bg-warning/10 text-warning border-warning/20",
  completed: "bg-success/10 text-success border-success/20",
};

const statusLabels = {
  upcoming: "Confirmé",
  pending: "En attente",
  completed: "Terminé",
};

export function UpcomingExams() {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Examens à venir</h3>
          <p className="text-sm text-muted-foreground">Cette semaine</p>
        </div>
        <Link to="/exams" className="text-sm font-medium text-primary hover:underline">
          Voir tout
        </Link>
      </div>
      <div className="space-y-4">
        {exams.map((exam, index) => (
          <div
            key={exam.id}
            className="group rounded-xl border border-border/50 bg-secondary/30 p-4 transition-all duration-200 hover:border-primary/30 hover:bg-secondary/50"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                  {exam.module}
                </h4>
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    {exam.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {exam.time}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {exam.room}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <div className="flex gap-1.5">
                    {exam.groups.map((group) => (
                      <span
                        key={group}
                        className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {group}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-1 text-xs font-medium",
                  statusStyles[exam.status as keyof typeof statusStyles]
                )}
              >
                {statusLabels[exam.status as keyof typeof statusLabels]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
