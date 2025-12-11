import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
const data = [{
  day: "Lun",
  profs: 85,
  salles: 70
}, {
  day: "Mar",
  profs: 72,
  salles: 85
}, {
  day: "Mer",
  profs: 90,
  salles: 65
}, {
  day: "Jeu",
  profs: 65,
  salles: 80
}, {
  day: "Ven",
  profs: 78,
  salles: 75
}, {
  day: "Sam",
  profs: 45,
  salles: 90
}];
export function AvailabilityChart() {
  return <div className="glass-card p-6 animate-fade-in" style={{
    animationDelay: "0.1s"
  }}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">Disponibilités</h3>
        <p className="text-sm text-muted-foreground">
          Taux de disponibilité par jour
        </p>
      </div>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: "hsl(var(--card))", 
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px"
              }} 
            />
            <Area type="monotone" dataKey="profs" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.3)" />
            <Area type="monotone" dataKey="salles" stroke="hsl(var(--info))" fill="hsl(var(--info) / 0.3)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-primary" />
          <span className="text-sm text-muted-foreground">Professeurs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-info" />
          <span className="text-sm text-muted-foreground">Salles</span>
        </div>
      </div>
    </div>;
}