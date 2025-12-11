import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sparkles,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Zap,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSurveillanceOptimization } from "@/hooks/useSurveillanceOptimization";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const surveillances = [
  {
    id: 1,
    exam: "Analyse Numérique",
    date: "15 Jan 2025",
    time: "08:30 - 10:30",
    room: "Amphi A",
    professors: [
      { name: "Dr. Ahmed Benali", role: "Principal", load: 85 },
      { name: "Prof. Fatima Zahra", role: "Adjoint", load: 65 },
    ],
    status: "assigned",
    students: 85,
  },
  {
    id: 2,
    exam: "Programmation Web",
    date: "15 Jan 2025",
    time: "14:00 - 16:00",
    room: "Salle B-12",
    professors: [
      { name: "Dr. Mohamed Alami", role: "Principal", load: 45 },
    ],
    status: "assigned",
    students: 42,
  },
  {
    id: 3,
    exam: "Base de Données",
    date: "16 Jan 2025",
    time: "10:00 - 12:00",
    room: "Salle C-05",
    professors: [],
    status: "unassigned",
    students: 68,
  },
  {
    id: 4,
    exam: "Électronique Numérique",
    date: "17 Jan 2025",
    time: "08:30 - 10:30",
    room: "Amphi B",
    professors: [
      { name: "Dr. Youssef Tazi", role: "Principal", load: 30 },
      { name: "Prof. Khadija Amrani", role: "Adjoint", load: 55 },
    ],
    status: "assigned",
    students: 45,
  },
  {
    id: 5,
    exam: "Mécanique des Fluides",
    date: "17 Jan 2025",
    time: "14:00 - 16:30",
    room: "Amphi A",
    professors: [
      { name: "Prof. Sara Idrissi", role: "Principal", load: 92 },
    ],
    status: "conflict",
    students: 72,
    conflictMessage: "Prof. Sara Idrissi est en surcharge",
  },
];

const professors = [
  { id: 1, name: "Dr. Ahmed Benali", department: "Informatique", currentLoad: 85, maxLoad: 100, availability: ["Lun", "Mar", "Mer"] },
  { id: 2, name: "Prof. Fatima Zahra", department: "Mathématiques", currentLoad: 65, maxLoad: 100, availability: ["Mar", "Mer", "Jeu"] },
  { id: 3, name: "Dr. Mohamed Alami", department: "Informatique", currentLoad: 45, maxLoad: 100, availability: ["Lun", "Mer", "Ven"] },
  { id: 4, name: "Dr. Youssef Tazi", department: "Électronique", currentLoad: 30, maxLoad: 100, availability: ["Lun", "Mar", "Jeu", "Ven"] },
  { id: 5, name: "Prof. Khadija Amrani", department: "Électronique", currentLoad: 55, maxLoad: 100, availability: ["Mar", "Mer", "Jeu"] },
  { id: 6, name: "Prof. Sara Idrissi", department: "Mécanique", currentLoad: 92, maxLoad: 100, availability: ["Mer", "Jeu", "Ven"] },
  { id: 7, name: "Dr. Rachid Bennani", department: "Informatique", currentLoad: 40, maxLoad: 100, availability: ["Lun", "Mar", "Mer", "Jeu", "Ven"] },
  { id: 8, name: "Prof. Amina Chraibi", department: "Mathématiques", currentLoad: 35, maxLoad: 100, availability: ["Lun", "Mar", "Ven"] },
];

const statusStyles = {
  assigned: {
    badge: "bg-success/10 text-success border-success/20",
    label: "Assigné",
    icon: CheckCircle,
  },
  unassigned: {
    badge: "bg-warning/10 text-warning border-warning/20",
    label: "Non assigné",
    icon: AlertTriangle,
  },
  conflict: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    label: "Conflit",
    icon: AlertTriangle,
  },
};

function getLoadColor(load: number) {
  if (load >= 80) return "text-destructive";
  if (load >= 60) return "text-warning";
  return "text-success";
}

export default function Surveillance() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showResultDialog, setShowResultDialog] = useState(false);
  const { optimize, isOptimizing, result, clearResult } = useSurveillanceOptimization();

  const handleOptimize = async () => {
    const optimizationResult = await optimize(surveillances, professors);
    if (optimizationResult) {
      setShowResultDialog(true);
    }
  };

  const filteredSurveillances = surveillances.filter(
    (s) =>
      s.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: surveillances.length,
    assigned: surveillances.filter(s => s.status === "assigned").length,
    unassigned: surveillances.filter(s => s.status === "unassigned").length,
    conflicts: surveillances.filter(s => s.status === "conflict").length,
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Surveillances</h1>
            <p className="mt-1 text-muted-foreground">
              Gérer l'affectation des surveillants aux examens
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="glass" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Rafraîchir
            </Button>
            <Button 
              variant="gradient" 
              className="gap-2"
              onClick={handleOptimize}
              disabled={isOptimizing}
            >
              {isOptimizing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isOptimizing ? "Optimisation..." : "Optimiser avec IA"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: "Total surveillances", value: stats.total, color: "text-foreground", icon: Calendar },
            { label: "Assignées", value: stats.assigned, color: "text-success", icon: CheckCircle },
            { label: "Non assignées", value: stats.unassigned, color: "text-warning", icon: AlertTriangle },
            { label: "Conflits", value: stats.conflicts, color: "text-destructive", icon: Zap },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card p-4 animate-fade-in flex items-center gap-4"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={cn("p-3 rounded-xl bg-secondary", stat.color)}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Suggestion Card */}
        <div className="glass-card p-6 mb-8 border-primary/30 glow-primary animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Suggestion IA</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {result?.summary?.recommendation || 
                  "Cliquez sur \"Optimiser avec IA\" pour obtenir des suggestions intelligentes de répartition des surveillances."}
              </p>
              <div className="flex gap-2">
                <Button 
                  variant="gradient" 
                  size="sm"
                  onClick={handleOptimize}
                  disabled={isOptimizing}
                >
                  {isOptimizing ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                      Analyse en cours...
                    </>
                  ) : (
                    "Lancer l'optimisation"
                  )}
                </Button>
                {result && (
                  <Button 
                    variant="glass" 
                    size="sm"
                    onClick={() => setShowResultDialog(true)}
                  >
                    Voir les détails
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher une surveillance..."
              className="pl-10 bg-secondary/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="glass" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        {/* Surveillances List */}
        <div className="space-y-4">
          {filteredSurveillances.map((surveillance, index) => {
            const status = statusStyles[surveillance.status as keyof typeof statusStyles];
            const StatusIcon = status.icon;
            
            return (
              <div
                key={surveillance.id}
                className={cn(
                  "glass-card p-6 transition-all duration-300 hover:border-primary/30 animate-fade-in",
                  surveillance.status === "conflict" && "border-destructive/30"
                )}
                style={{ animationDelay: `${(index + 6) * 0.05}s` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-semibold text-lg text-foreground">
                        {surveillance.exam}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          status.badge
                        )}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {surveillance.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {surveillance.time}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {surveillance.room}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users className="h-3.5 w-3.5" />
                        {surveillance.students} étudiants
                      </span>
                    </div>

                    {surveillance.status === "conflict" && surveillance.conflictMessage && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <span className="text-sm text-destructive">{surveillance.conflictMessage}</span>
                      </div>
                    )}

                    {surveillance.professors.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {surveillance.professors.map((prof, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                              {prof.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{prof.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {prof.role} · <span className={getLoadColor(prof.load)}>{prof.load}% charge</span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        Aucun surveillant assigné
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="glass" size="sm">
                      Modifier
                    </Button>
                    {surveillance.status === "unassigned" && (
                      <Button variant="gradient" size="sm" className="gap-1">
                        <Sparkles className="h-3.5 w-3.5" />
                        Auto-assigner
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optimization Result Dialog */}
        <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Résultats de l'optimisation IA
              </DialogTitle>
              <DialogDescription>
                Analyse et recommandations pour la répartition des surveillances
              </DialogDescription>
            </DialogHeader>

            {result && (
              <div className="space-y-6 mt-4">
                {/* Summary */}
                <div className="glass-card p-4 border-primary/30">
                  <h4 className="font-semibold text-foreground mb-2">Résumé</h4>
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-success">{result.summary?.totalAssigned || 0}</p>
                      <p className="text-xs text-muted-foreground">Assignées</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-warning">{result.summary?.totalConflicts || 0}</p>
                      <p className="text-xs text-muted-foreground">Conflits</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-info">{result.summary?.averageLoad || 0}%</p>
                      <p className="text-xs text-muted-foreground">Charge moyenne</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{result.summary?.recommendation}</p>
                </div>

                {/* Assignments */}
                {result.assignments && result.assignments.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Affectations proposées</h4>
                    <div className="space-y-3">
                      {result.assignments.map((assignment, idx) => (
                        <div key={idx} className="glass-card p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground">{assignment.exam}</span>
                            <CheckCircle className="h-4 w-4 text-success" />
                          </div>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {assignment.assignedProfessors?.map((prof, pidx) => (
                              <span 
                                key={pidx}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs"
                              >
                                {prof.name} ({prof.role})
                              </span>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">{assignment.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Conflicts */}
                {result.conflicts && result.conflicts.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Conflits détectés</h4>
                    <div className="space-y-3">
                      {result.conflicts.map((conflict, idx) => (
                        <div key={idx} className="glass-card p-4 border-warning/30">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-warning mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-foreground">{conflict.issue}</p>
                              <p className="text-xs text-muted-foreground mt-1">{conflict.suggestion}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-border">
                  <Button variant="glass" onClick={() => setShowResultDialog(false)}>
                    Fermer
                  </Button>
                  <Button variant="gradient">
                    Appliquer les suggestions
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
