import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddRoomDialog } from "@/components/dialogs/AddRoomDialog";
import {
  Plus,
  Search,
  Filter,
  Users,
  Monitor,
  Wifi,
  Building2,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const statusStyles = {
  available: {
    badge: "bg-success/10 text-success border-success/20",
    label: "Disponible",
    dot: "bg-success",
  },
  occupied: {
    badge: "bg-destructive/10 text-destructive border-destructive/20",
    label: "Occupée",
    dot: "bg-destructive",
  },
  maintenance: {
    badge: "bg-warning/10 text-warning border-warning/20",
    label: "Maintenance",
    dot: "bg-warning",
  },
};

const typeIcons: Record<string, any> = {
  Amphithéâtre: Building2,
  "Salle TD": Users,
  "Salle TP": Monitor,
};

export default function Rooms() {
  const [searchQuery, setSearchQuery] = useState("");
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const { toast } = useToast();

  const fetchRooms = async () => {
    try {
      const data = await api.rooms.getAll();
      // Add mock derived data for UI (status, usage) as these might be dynamic or not fully implemented in DB yet
      const enhancedData = data.map((r: any) => ({
        ...r,
        status: r.status || ["available", "occupied", "maintenance"][Math.floor(Math.random() * 3)],
        currentUsage: Math.floor(Math.random() * 100),
      }));
      setRooms(enhancedData);
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les salles." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleAddRoom = async (newRoom: any) => {
    try {
      await api.rooms.create({
        name: newRoom.name,
        capacity: newRoom.capacity,
        type: newRoom.type,
        equipment: newRoom.equipment
      });
      await fetchRooms();
      setDialogOpen(false); // Close dialog
      toast({ title: "Succès", description: "Salle ajoutée avec succès." });
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de l'ajout de la salle." });
    }
  };

  const filteredRooms = rooms.filter(
    (room) =>
      (room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.building?.toLowerCase().includes(searchQuery.toLowerCase()) || // potential missing building field in DB, check schema
        room.type.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (activeFilter === "all" || room.status === activeFilter)
  );

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Salles</h1>
            <p className="mt-1 text-muted-foreground">
              Gérer les salles et leur disponibilité
            </p>
          </div>
          <Button variant="gradient" className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Ajouter une salle
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          {[
            { label: "Total", value: rooms.length, color: "text-foreground" },
            { label: "Disponibles", value: rooms.filter(r => r.status === "available").length, color: "text-success" },
            { label: "Occupées", value: rooms.filter(r => r.status === "occupied").length, color: "text-destructive" },
            { label: "En maintenance", value: rooms.filter(r => r.status === "maintenance").length, color: "text-warning" },
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
              placeholder="Rechercher une salle..."
              className="pl-10 bg-secondary/50 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant={showFilters ? "default" : "glass"}
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filtres
          </Button>
        </div>

        {/* Filter Bar */}
        {showFilters && (
          <div className="flex flex-wrap gap-2 mb-6 p-4 glass-card animate-fade-in">
            <span className="text-sm font-medium mr-2 self-center">Afficher:</span>
            <Button
              variant={activeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("all")}
            >
              Tout
            </Button>
            <Button
              variant={activeFilter === "available" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("available")}
              className="text-success hover:text-success-foreground"
            >
              Disponibles
            </Button>
            <Button
              variant={activeFilter === "occupied" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("occupied")}
              className="text-destructive hover:text-destructive-foreground"
            >
              Occupées
            </Button>
            <Button
              variant={activeFilter === "maintenance" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveFilter("maintenance")}
              className="text-warning hover:text-warning-foreground"
            >
              Maintenance
            </Button>
          </div>
        )}

        {/* Rooms Grid */}
        {loading ? (
          <div className="text-center py-10">Chargement...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRooms.map((room, index) => {
              const status = statusStyles[room.status as keyof typeof statusStyles] || statusStyles.available;
              const TypeIcon = typeIcons[room.type] || Building2;

              return (
                <div
                  key={room.id}
                  className="glass-card p-6 transition-all duration-300 hover:scale-[1.02] hover:border-primary/30 animate-fade-in"
                  style={{ animationDelay: `${(index + 4) * 0.05}s` }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center">
                        <TypeIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{room.name}</h3>
                        <p className="text-sm text-muted-foreground">{room.type}</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                        status.badge
                      )}
                    >
                      <span className={cn("h-1.5 w-1.5 rounded-full", status.dot)} />
                      {status.label}
                    </span>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{room.building || "Bâtiment Principal"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" />
                      <span>Capacité: {room.capacity} places</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(room.equipment || []).map((equip: string) => (
                      <span
                        key={equip}
                        className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-xs text-muted-foreground"
                      >
                        {equip === "Wifi" && <Wifi className="h-3 w-3" />}
                        {equip === "Ordinateurs" && <Monitor className="h-3 w-3" />}
                        {equip}
                      </span>
                    ))}
                  </div>

                  {room.status === "occupied" && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Occupation actuelle</span>
                        <span className="text-sm font-semibold text-destructive">
                          {room.currentUsage}%
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full bg-destructive transition-all duration-500"
                          style={{ width: `${room.currentUsage}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <AddRoomDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onAdd={handleAddRoom}
        />
      </div>
    </MainLayout>
  );
}
