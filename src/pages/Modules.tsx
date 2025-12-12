import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddModuleDialog } from "@/components/dialogs/AddModuleDialog";
import { ViewModuleDialog } from "@/components/dialogs/ViewModuleDialog";
import {
  Plus,
  Search,
  BookOpen,
  Users,
  GraduationCap,
  MoreVertical,
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

const departments = ["Tous", "Informatique", "Mathématiques", "Électronique", "Génie Civil"];

export default function Modules() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("Tous");
  const [modules, setModules] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      const [modulesData, professorsData] = await Promise.all([
        api.modules.getAll(),
        api.professors.getAll()
      ]);

      // Enhanced mock data to modules because DB only has basic info
      const enhancedModules = modulesData.map((m: any) => ({
        ...m,
        groups: ["G1", "G2"], // Mock
        students: Math.floor(Math.random() * 100),
        examsPlanned: Math.floor(Math.random() * 5),
        color: ["bg-primary", "bg-info", "bg-success", "bg-warning", "bg-destructive"][Math.floor(Math.random() * 5)],
        department: "Informatique" // Default if missing
      }));

      setModules(enhancedModules);
      setProfessors(
        professorsData.map((p: any) => ({
          ...p,
          name: `${p.first_name ?? ""} ${p.last_name ?? ""}`.trim(),
        }))
      );
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

  const handleAddModule = async (newModule: any) => {
    try {
      const code = String(newModule.code || "").trim().toUpperCase();
      if (!code) {
        toast({ variant: "destructive", title: "Erreur", description: "Le code du module est requis." });
        return;
      }

      const semesterNumber = typeof newModule.semester === "string"
        ? Number(newModule.semester.replace("S", ""))
        : newModule.semester;

      await api.modules.create({
        code,
        name: newModule.name,
        semester: semesterNumber,
        credits: newModule.credits,
        professor_id: newModule.professor_id
      });
      await fetchData();
      setDialogOpen(false);
      toast({ title: "Succès", description: "Module ajouté ou mis à jour avec succès." });
    } catch (error) {
      const message = (error as any)?.message || "Erreur lors de l'ajout du module.";
      toast({ variant: "destructive", title: "Erreur", description: message });
    }
  };

  const handleUpdateModule = async (updatedModule: any) => {
    try {
      const code = String(updatedModule.code || "").trim().toUpperCase();
      const semesterNumber = typeof updatedModule.semester === "string"
        ? Number(String(updatedModule.semester).replace("S", ""))
        : updatedModule.semester;
      const professorId = updatedModule.professor_id === "" || updatedModule.professor_id === undefined
        ? null
        : updatedModule.professor_id;

      await api.modules.update(updatedModule.id, {
        code,
        name: updatedModule.name,
        semester: semesterNumber,
        credits: Number(updatedModule.credits) || 3,
        professor_id: professorId
      });
      await fetchData();
      setDialogOpen(false);
      setSelectedModule(null);
      toast({ title: "Succès", description: "Module mis à jour." });
    } catch (error) {
      const message = (error as any)?.message || "Erreur lors de la mise à jour.";
      toast({ variant: "destructive", title: "Erreur", description: message });
    }
  };

  const handleViewDetails = (module: any) => {
    setSelectedModule(module);
    setViewDialogOpen(true);
  };

  const handleEdit = (module: any) => {
    // Find professor ID if only name is available, or pass raw if ID is there
    // The dialog needs to handle pre-selection.
    // Since api.modules.getAll returns professor NAME string, we have a mismatch for editing.
    // We should probably fix api.ts to return ID too? 
    // For now, let's try to match name to ID from professors list.
    const prof = professors.find(p => p.name === module.professor);

    setSelectedModule({
      ...module,
      professor_id: prof ? String(prof.id) : "",
      professor: module.professor
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await api.modules.delete(id);
      setModules(modules.filter(m => m.id !== id));
      toast({ title: "Module supprimé", description: "Le module a été supprimé avec succès" });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de supprimer ce module." });
    }
  };

  const handleOpenAdd = () => {
    setSelectedModule(null);
    setDialogOpen(true);
  };

  const filteredModules = modules.filter(
    (module) =>
      (module.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.code.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedDept === "Tous" || module.department === selectedDept)
  );

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Modules</h1>
            <p className="mt-1 text-muted-foreground">
              Gérer les modules et leurs affectations
            </p>
          </div>
          <Button variant="gradient" className="gap-2" onClick={handleOpenAdd}>
            <Plus className="h-4 w-4" />
            Ajouter un module
          </Button>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-2 mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {departments.map((dept) => (
            <Button
              key={dept}
              variant={selectedDept === dept ? "default" : "glass"}
              size="sm"
              onClick={() => setSelectedDept(dept)}
            >
              {dept}
            </Button>
          ))}
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher un module..."
              className="pl-10 bg-secondary/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Modules Grid */}
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module, index) => (
              <div
                key={module.id}
                className="glass-card overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 animate-fade-in group"
                style={{ animationDelay: `${(index + 3) * 0.05}s` }}
              >
                {/* Color Bar */}
                <div className={cn("h-1.5", module.color)} />

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded mb-2 inline-block">
                        {module.code}
                      </span>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                        {module.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {module.department}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewDetails(module)}>
                          Voir détails
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(module)}>
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(module.id)}>
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span className="truncate">{module.professor}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>{module.students} étudiants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>{module.examsPlanned} examens planifiés</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {module.semester}
                    </span>
                    {module.groups.map((group: string) => (
                      <span
                        key={group}
                        className="rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground"
                      >
                        {group}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-border/50">
                    <Button variant="glass" size="sm" className="w-full" onClick={() => handleViewDetails(module)}>
                      Voir les détails
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <AddModuleDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedModule(null);
          }}
          onAdd={handleAddModule}
          onEdit={handleUpdateModule}
          initialData={selectedModule}
          professors={professors}
        />

        <ViewModuleDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          module={selectedModule}
        />
      </div>
    </MainLayout>
  );
}
