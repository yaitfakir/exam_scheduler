import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { AddEventDialog } from "@/components/dialogs/AddEventDialog";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  List,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  subDays,
  startOfMonth,
  endOfMonth,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfDay
} from "date-fns";
import { fr } from "date-fns/locale";
import { api } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

const timeSlots = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

export default function Calendar() {
  const [view, setView] = useState<"month" | "week" | "day">("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      const data = await api.events.getAll();
      // Ensure date strings are converted to Date objects for comparison functions
      const processedEvents = data.map((e: any) => ({
        ...e,
        date: new Date(e.date)
      }));
      setEvents(processedEvents);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de charger les événements." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const navigate = (direction: "prev" | "next") => {
    switch (view) {
      case "month":
        setCurrentDate(direction === "next" ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
        break;
      case "week":
        setCurrentDate(direction === "next" ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
        break;
      case "day":
        setCurrentDate(direction === "next" ? addDays(currentDate, 1) : subDays(currentDate, 1));
        break;
    }
  };

  const handleAddEvent = async (newEvent: any) => {
    try {
      await api.events.create(newEvent);
      await fetchEvents();
      toast({ title: "Succès", description: "Événement ajouté avec succès." });
      setAddEventOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur", description: "Erreur lors de l'ajout de l'événement." });
    }
  };

  const currentMonth = format(currentDate, "MMMM yyyy", { locale: fr });

  // Generate days based on view
  const getDaysToRender = () => {
    if (view === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else if (view === "week") {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    } else {
      return [currentDate];
    }
  };

  const daysToRender = getDaysToRender();

  return (
    <MainLayout>
      <div className="p-8 h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendrier</h1>
            <p className="mt-1 text-muted-foreground">
              Vue d'ensemble des examens planifiés
            </p>
          </div>
          <Button variant="gradient" className="gap-2" onClick={() => setAddEventOpen(true)}>
            <Plus className="h-4 w-4" />
            Nouvel événement
          </Button>
        </div>

        {/* Calendar Controls */}
        <div className="flex items-center justify-between mb-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button variant="glass" size="icon" onClick={() => navigate("prev")}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="glass" size="icon" onClick={() => navigate("next")}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold text-foreground capitalize">{currentMonth}</h2>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={view === "month" ? "default" : "glass"}
              size="sm"
              onClick={() => setView("month")}
              className="gap-1.5"
            >
              <LayoutGrid className="h-4 w-4" />
              Mois
            </Button>
            <Button
              variant={view === "week" ? "default" : "glass"}
              size="sm"
              onClick={() => setView("week")}
              className="gap-1.5"
            >
              <CalendarIcon className="h-4 w-4" />
              Semaine
            </Button>
            <Button
              variant={view === "day" ? "default" : "glass"}
              size="sm"
              onClick={() => setView("day")}
              className="gap-1.5"
            >
              <List className="h-4 w-4" />
              Jour
            </Button>
          </div>
        </div>

        {/* Month View */}
        {view === "month" && (
          <div className="flex-1 glass-card p-4 animate-fade-in overflow-hidden">
            <div className="grid grid-cols-7 gap-1 h-full overflow-y-auto">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => (
                <div key={day} className="text-center font-medium p-2 sticky top-0 bg-background/95 backdrop-blur z-10">{day}</div>
              ))}
              {daysToRender.map((day, idx) => (
                <div key={day.toISOString()} className={cn(
                  "border border-border/30 p-2 min-h-[100px] hover:bg-secondary/20 transition-colors flex flex-col",
                  !isSameDay(day, startOfMonth(currentDate)) ? "opacity-40 bg-secondary/10" : "", // Different style for outside days
                  isToday(day) && "bg-primary/5 border-primary/50"
                )}>
                  <div className="font-semibold mb-1">{format(day, "d")}</div>
                  {/* Render Events for this day */}
                  <div className="space-y-1 flex-1">
                    {events.filter(e => isSameDay(e.date, day)).map(e => (
                      <div key={`${e.id}-${day.toISOString()}`} className={cn("text-[10px] p-1 rounded truncate", e.color, "text-primary-foreground")}>
                        {e.title}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day View */}
        {view === "day" && (
          <div className="flex-1 glass-card overflow-hidden animate-fade-in">
            <div className="h-full flex flex-col overflow-y-auto p-4">
              <div className="text-center font-bold text-xl mb-4 text-primary capitalize">
                {format(currentDate, "EEEE d MMMM yyyy", { locale: fr })}
              </div>
              {timeSlots.map(time => {
                const dayEvents = events.filter(e => isSameDay(e.date, currentDate) && e.time.startsWith(time.split(':')[0]));
                return (
                  <div key={time} className="flex border-b border-border/30 min-h-[80px]">
                    <div className="w-20 py-2 text-sm text-muted-foreground border-r border-border/30">{time}</div>
                    <div className="flex-1 p-2 relative">
                      {dayEvents.map(e => (
                        <div key={e.id} className={cn("absolute left-2 right-2 top-1 bottom-1 rounded p-2 text-sm", e.color, "text-primary-foreground")}>
                          <div className="font-bold">{e.title}</div>
                          <div className="text-xs opacity-90">{e.time} - {e.room}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Week View */}
        {view === "week" && (
          <div className="flex-1 glass-card overflow-hidden animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="h-full flex flex-col">
              {/* Days Header */}
              <div className="grid grid-cols-8 border-b border-border/50">
                <div className="p-3 text-center text-sm font-medium text-muted-foreground border-r border-border/50">
                  Heure
                </div>
                {daysToRender.map((day, index) => {
                  const isCurrentDay = isToday(day);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "p-3 text-center border-r border-border/50 last:border-r-0",
                        isCurrentDay && "bg-primary/5"
                      )}
                    >
                      <p className="text-sm font-medium text-muted-foreground capitalize">
                        {format(day, "EEE", { locale: fr })}
                      </p>
                      <p
                        className={cn(
                          "text-lg font-bold",
                          isCurrentDay
                            ? "w-8 h-8 mx-auto rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                            : "text-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Time Grid */}
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-8">
                  {/* Time Column */}
                  <div className="border-r border-border/50">
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className="h-16 p-2 text-xs text-muted-foreground border-b border-border/30"
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Day Columns */}
                  {daysToRender.map((day, dayIndex) => {
                    const isCurrentDay = isToday(day);
                    return (
                      <div
                        key={dayIndex}
                        className={cn(
                          "border-r border-border/50 last:border-r-0 relative",
                          isCurrentDay && "bg-primary/5"
                        )}
                      >
                        {timeSlots.map((time, timeIndex) => (
                          <div
                            key={time}
                            className="h-16 border-b border-border/30 hover:bg-secondary/30 transition-colors cursor-pointer"
                          />
                        ))}

                        {/* Events */}
                        {events.filter(e => isSameDay(e.date, day)).map((event) => {
                          const hour = parseInt(event.time.split(':')[0]);
                          const topOffset = (hour - 8) * 64;

                          return (
                            <div
                              key={event.id}
                              className={cn(
                                "absolute left-1 right-1 rounded-lg p-2 text-xs cursor-pointer transition-transform hover:scale-[1.02]",
                                event.color,
                                "text-primary-foreground"
                              )}
                              style={{
                                top: `${topOffset}px`,
                                height: `${(event.duration / 60) * 64}px`, // approximate height
                              }}
                            >
                              <p className="font-semibold truncate">{event.title}</p>
                              <p className="opacity-80">{event.time} · {event.room}</p>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-primary" />
            <span className="text-sm text-muted-foreground">Informatique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-info" />
            <span className="text-sm text-muted-foreground">Web</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-success" />
            <span className="text-sm text-muted-foreground">Base de Données</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-warning" />
            <span className="text-sm text-muted-foreground">Électronique</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-sm bg-destructive" />
            <span className="text-sm text-muted-foreground">Mécanique</span>
          </div>
        </div>
      </div>
      <AddEventDialog
        open={addEventOpen}
        onOpenChange={setAddEventOpen}
        onAdd={handleAddEvent}
      />
    </MainLayout>
  );
}


