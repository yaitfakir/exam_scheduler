import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddExamDialog } from "@/components/dialogs/AddExamDialog";
import { ViewExamDialog } from "@/components/dialogs/ViewExamDialog";
import {
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  MapPin,
  Users,
  MoreVertical,
  Edit,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

const statusStyles = {
  confirmed: {
    badge: "bg-success/10 text-success border-success/20",
    label: "Confirmé",
  },
  pending: {
    badge: "bg-warning/10 text-warning border-warning/20",
    label: "En attente",
  },
  unassigned: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    label: "Non assigné",
  },
};

export default function Exams() {
  const [searchQuery, setSearchQuery] = useState("");
  const [exams, setExams] = useState<any[]>([]);
  const [modules, setModules] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [showWeekOnly, setShowWeekOnly] = useState(false);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [examsData, modulesData, roomsData, professorsData] = await Promise.all([
        api.exams.getAll(),
        api.modules.getAll(),
        api.rooms.getAll(),
        api.professors.getAll()
      ]);

      setModules(modulesData);
      setRooms(roomsData);
      setProfessors(professorsData);

      // Join data manually for display
      const enhancedExams = examsData.map((e: any) => {
        const module = modulesData.find((m: any) => m.id === e.module_id);
        const room = roomsData.find((r: any) => r.id === e.room_id);
        const supervisor = professorsData.find((p: any) => p.id === e.supervisor_id);

        return {
          ...e,
          module: module ? module.name : "Module Inconnu",
          code: module ? module.code : "N/A",
          room: room ? room.name : "Non assigné",
          supervisor: supervisor ? supervisor.first_name + " " + supervisor.last_name : "Non assigné",
          groups: ["G1"], // Mock
          students: Math.floor(Math.random() * 100), // Mock
          displayDate: e.date, // Use raw date string for now
          status: e.status || "pending"
        };
      });

      setExams(enhancedExams);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les données." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExam = async (newExam: any) => {
    try {
      await api.exams.create({
        module_id: newExam.module_id,
        room_id: newExam.room_id,
        date: newExam.date,
        time: newExam.time,
        duration: parseInt(newExam.duration),
        type: newExam.type,
        supervisor_id: newExam.supervisor_id,
        status: "confirmed"
      });
      await fetchData();
      setDialogOpen(false);
      toast({ title: "Succès", description: "Examen planifié avec succès." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la création de l'examen." });
    }
  };

  const handleUpdateExam = async (updatedExam: any) => {
    try {
      await api.exams.update(updatedExam.id, {
        module_id: updatedExam.module_id,
        room_id: updatedExam.room_id,
        date: updatedExam.date,
        time: updatedExam.time,
        duration: parseInt(updatedExam.duration),
        type: updatedExam.type,
        supervisor_id: updatedExam.supervisor_id
      });
      await fetchData();
      setDialogOpen(false);
      setSelectedExam(null);
      toast({ title: "Succès", description: "Examen mis à jour." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la mise à jour." });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.exams.delete(id);
      setExams(exams.filter(e => e.id !== id));
      toast({ title: "Supprimé", description: "L'examen a été supprimé" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer cet examen." });
    }
  };

  const handleViewDetails = (exam: any) => {
    setSelectedExam(exam);
    setViewDialogOpen(true);
  };

  const handleEdit = (exam: any) => {
    setSelectedExam(exam);
    setDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setSelectedExam(null);
    setDialogOpen(true);
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exam.room.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesWeek = true;
    if (showWeekOnly) {
      // Simple check: current date vs exam date within 7 days
      const examDate = new Date(exam.date);
      const now = new Date();
      const diffTime = Math.abs(examDate.getTime() - now.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      matchesWeek = diffDays <= 7;
    }

    return matchesSearch && matchesWeek;
  });

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Examens</h1>
            <p className="mt-1 text-muted-foreground">
              Planifier et gérer les contrôles continus
            </p>
          </div>
          <Button variant="gradient" className="gap-2" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            Nouvel examen
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: "Total", value: exams.length, color: "text-foreground" },
            { label: "Confirmés", value: exams.filter(e => e.status === "confirmed").length, color: "text-success" },
            { label: "En attente", value: exams.filter(e => e.status === "pending").length, color: "text-warning" },
            { label: "Non assignés", value: exams.filter(e => e.status === "unassigned").length, color: "text-destructive" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="glass-card p-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un examen..."
              className="pl-10 bg-secondary/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" className="gap-2">
                <Filter className="h-4 w-4" />
                Filtres
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrer par</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => { setShowWeekOnly(false); setSearchQuery("") }}>
                Tout voir
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Analyse")}>
                Module: Analyse
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSearchQuery("Amphi")}>
                Salle: Amphi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            variant={showWeekOnly ? "default" : "glass"}
            className="gap-2"
            onClick={() => setShowWeekOnly(!showWeekOnly)}
          >
            <Calendar className="h-4 w-4" />
            Cette semaine
          </Button>
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredExams.map((exam, index) => {
              const statusKey = Object.keys(statusStyles).includes(exam.status) ? exam.status : "pending";
              const status = statusStyles[statusKey as keyof typeof statusStyles];

              return (
                <div
                  key={exam.id}
                  className="glass-card p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 animate-fade-in group"
                  style={{ animationDelay: `${(index + 4) * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {exam.code}
                        </span>
                        <span
                          className={cn(
                            "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium",
                            status.badge
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {exam.module}
                      </h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewDetails(exam)}>
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(exam)}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(exam.id)}>
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{exam.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{exam.time} ({exam.duration}h)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{exam.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{exam.students} étudiants</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(exam.groups || []).map((group: string) => (
                      <span
                        key={group}
                        className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {group}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Surveillant: </span>
                      <span className={cn(
                        "font-medium",
                        exam.supervisor === "Non assigné" ? "text-destructive" : "text-foreground"
                      )}>
                        {exam.supervisor}
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetails(exam)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(exam)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AddExamDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedExam(null);
          }}
          onAdd={handleAddExam}
          onEdit={handleUpdateExam}
          initialData={selectedExam}
          modules={modules}
          rooms={rooms}
          professors={professors}
        />

        <ViewExamDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          exam={selectedExam}
        />
      </div>
    </MainLayout>
  );
}
