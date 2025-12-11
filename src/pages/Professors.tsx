import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddProfessorDialog } from "@/components/dialogs/AddProfessorDialog";
import { ViewProfessorDialog } from "@/components/dialogs/ViewProfessorDialog";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building2,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/services/api";

function getLoadColor(load: number) {
  if (load >= 80) return { bg: "bg-destructive/10", text: "text-destructive", bar: "bg-destructive" };
  if (load >= 60) return { bg: "bg-warning/10", text: "text-warning", bar: "bg-warning" };
  return { bg: "bg-success/10", text: "text-success", bar: "bg-success" };
}

function getAvailabilityStyle(status: string) {
  switch (status) {
    case "Disponible":
      return "bg-success/10 text-success border-success/20";
    case "Occupé":
      return "bg-warning/10 text-warning border-warning/20";
    case "Surchargé":
      return "bg-destructive/10 text-destructive border-destructive/20";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export default function Professors() {
  const [searchQuery, setSearchQuery] = useState("");
  const [professors, setProfessors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedProfessor, setSelectedProfessor] = useState<any>(null);
  const [departmentFilter, setDepartmentFilter] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchProfessors = async () => {
    try {
      const data = await api.professors.getAll();
      console.log("Fetched professors:", data);
      // Add mock derived data for UI (load, surveillances) since they aren't in DB yet
      const enhancedData = data.map((p: any) => ({
        ...p,
        load: Math.floor(Math.random() * 100), // Mock load
        surveillances: Math.floor(Math.random() * 15), // Mock surveillances
        availability: Math.random() > 0.5 ? "Disponible" : "Occupé",
        avatar: p.first_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) + p.last_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
      }));
      setProfessors(enhancedData);
    } catch (error) {
      console.error("Failed to fetch professors:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les professeurs." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessors();
  }, []);

  const handleAddProfessor = async (newProf: any) => {
    try {
      const created = await api.professors.create({
        first_name: newProf.first_name,
        last_name: newProf.last_name,
        email: newProf.email,
        phone: newProf.phone,
        department: newProf.department,
      });

      // Refresh local state
      await fetchProfessors();
      setDialogOpen(false);
      toast({ title: "Succès", description: "Professeur ajouté avec succès." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de l'ajout." });
    }
  };

  const handleUpdateProfessor = async (updatedProf: any) => {
    try {
      await api.professors.update(updatedProf.id, {
        first_name: updatedProf.first_name,
        last_name: updatedProf.last_name,
        email: updatedProf.email,
        phone: updatedProf.phone,
        department: updatedProf.department,
      });
      await fetchProfessors();
      setDialogOpen(false);
      setSelectedProfessor(null);
      toast({ title: "Succès", description: "Professeur mis à jour." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de la mise à jour." });
    }
  };

  const handleOpenAdd = () => {
    setSelectedProfessor(null);
    setDialogOpen(true);
  }

  const handleAction = async (action: string, prof: any) => {
    if (action === "Voir profil") {
      setSelectedProfessor(prof);
      setViewDialogOpen(true);
    } else if (action === "Modifier") {
      setSelectedProfessor(prof);
      setDialogOpen(true);
    } else if (action === "Supprimer") {
      try {
        await api.professors.delete(prof.id);
        setProfessors(professors.filter(p => p.id !== prof.id));
        toast({ title: "Supprimé", description: `${prof.name} a été supprimé.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer ce professeur." });
      }
    }
  };

  const departments = Array.from(new Set(professors.map(p => p.department)));

  const filteredProfessors = professors.filter(
    (prof) => {
      const matchesSearch = prof.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prof.department?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = departmentFilter ? prof.department === departmentFilter : true;
      return matchesSearch && matchesDept;
    }
  );

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Professeurs</h1>
            <p className="mt-1 text-muted-foreground">
              Gérer les professeurs et leurs disponibilités
            </p>
          </div>
          <Button variant="gradient" className="gap-2" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            Ajouter un professeur
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un professeur..."
              className="pl-10 bg-secondary/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" className="gap-2">
                <Filter className="h-4 w-4" />
                {departmentFilter || "Filtres"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filtrer par Département</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setDepartmentFilter(null)}>
                Tous
              </DropdownMenuItem>
              {departments.map(dept => (
                <DropdownMenuItem key={dept} onClick={() => setDepartmentFilter(dept)}>
                  {dept}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Professors Grid */}
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProfessors.map((prof, index) => {
              const loadColors = getLoadColor(prof.load);
              return (
                <div
                  key={prof.id}
                  className="glass-card p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold">
                        {prof.avatar}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{prof.first_name} {prof.last_name}</h3>
                        <p className="text-sm text-muted-foreground">{prof.department}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleAction("Voir profil", prof)}>
                          Voir profil
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Modifier", prof)}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleAction("Supprimer", prof)}>
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{prof.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{prof.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{prof.surveillances} surveillances assignées</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Charge de travail</span>
                      <span className={cn("text-sm font-semibold", loadColors.text)}>
                        {prof.load}%
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden mb-3">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", loadColors.bar)}
                        style={{ width: `${prof.load}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        getAvailabilityStyle(prof.availability)
                      )}
                    >
                      {prof.availability}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AddProfessorDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedProfessor(null);
          }}
          onAdd={handleAddProfessor}
          onEdit={handleUpdateProfessor}
          initialData={selectedProfessor}
        />

        <ViewProfessorDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          professor={selectedProfessor}
        />
      </div>
    </MainLayout>
  );
}

