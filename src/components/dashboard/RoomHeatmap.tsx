import { cn } from "@/lib/utils";

const rooms = [
  { id: "A-01", name: "Amphi A", slots: [90, 75, 60, 85, 40, 20] },
  { id: "A-02", name: "Amphi B", slots: [70, 80, 55, 90, 65, 30] },
  { id: "B-12", name: "Salle B-12", slots: [40, 60, 85, 70, 80, 45] },
  { id: "B-15", name: "Salle B-15", slots: [55, 45, 75, 60, 50, 35] },
  { id: "C-05", name: "Salle C-05", slots: [80, 90, 65, 45, 70, 55] },
  { id: "C-08", name: "Salle C-08", slots: [35, 50, 70, 80, 60, 40] },
];

const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00"];

function getHeatColor(value: number) {
  if (value >= 80) return "bg-destructive/80";
  if (value >= 60) return "bg-warning/80";
  if (value >= 40) return "bg-info/60";
  return "bg-success/60";
}

export function RoomHeatmap() {
  return (
    <div className="glass-card p-6 animate-fade-in" style={{ animationDelay: "0.4s" }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Occupation des Salles</h3>
        <p className="text-sm text-muted-foreground">Heatmap par créneau horaire</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left text-xs font-medium text-muted-foreground pb-3 pr-4">
                Salle
              </th>
              {timeSlots.map((slot) => (
                <th
                  key={slot}
                  className="text-center text-xs font-medium text-muted-foreground pb-3 px-1"
                >
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="text-sm font-medium text-foreground py-1 pr-4 whitespace-nowrap">
                  {room.name}
                </td>
                {room.slots.map((value, index) => (
                  <td key={index} className="px-1 py-1">
                    <div
                      className={cn(
                        "h-8 w-full rounded-md flex items-center justify-center text-xs font-medium transition-all duration-200 hover:scale-105 cursor-pointer",
                        getHeatColor(value),
                        "text-foreground/90"
                      )}
                      title={`${value}% occupé`}
                    >
                      {value}%
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-success/60" />
          <span className="text-xs text-muted-foreground">&lt;40%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-info/60" />
          <span className="text-xs text-muted-foreground">40-60%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-warning/80" />
          <span className="text-xs text-muted-foreground">60-80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-destructive/80" />
          <span className="text-xs text-muted-foreground">&gt;80%</span>
        </div>
      </div>
    </div>
  );
}
