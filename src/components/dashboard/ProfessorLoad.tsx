import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const professors = [
  { id: 1, name: "Dr. Ahmed Benali", load: 85, surveillances: 12 },
  { id: 2, name: "Prof. Fatima Zahra", load: 65, surveillances: 8 },
  { id: 3, name: "Dr. Mohamed Alami", load: 45, surveillances: 5 },
  { id: 4, name: "Prof. Sara Idrissi", load: 92, surveillances: 14 },
  { id: 5, name: "Dr. Youssef Tazi", load: 30, surveillances: 3 },
  { id: 6, name: "Prof. Khadija Amrani", load: 55, surveillances: 7 },
];

function getLoadColor(load: number) {
  if (load >= 80) return { bar: "bg-destructive", text: "text-destructive", glow: "glow-destructive" };
  if (load >= 60) return { bar: "bg-warning", text: "text-warning", glow: "glow-warning" };
  return { bar: "bg-success", text: "text-success", glow: "glow-success" };
}

export function ProfessorLoad() {
  const { toast } = useToast();
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Charge des Professeurs</h3>
          <p className="text-sm text-muted-foreground">Répartition des surveillances</p>
        </div>
        <button
          className="text-sm font-medium text-primary hover:underline"
          onClick={() => toast({ title: "Optimisation", description: "Lancement de l'optimisation..." })}
        >
          Optimiser
        </button>
      </div>
      <div className="space-y-4">
        {professors.map((prof) => {
          const colors = getLoadColor(prof.load);
          return (
            <div
              key={prof.id}
              className="group rounded-lg border border-border/30 bg-secondary/20 p-3 transition-all duration-200 hover:border-primary/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-foreground text-sm">{prof.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {prof.surveillances} surveillances
                  </span>
                  <span className={cn("text-sm font-bold", colors.text)}>
                    {prof.load}%
                  </span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    colors.bar
                  )}
                  style={{ width: `${prof.load}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
