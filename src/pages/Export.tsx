import { MainLayout } from "@/components/layout/MainLayout";
import { FileDown, FileSpreadsheet, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import JSZip from "jszip";
import { supabase } from "@/integrations/supabase/client";

type Professor = { id: string; first_name: string; last_name: string };
type Room = { id: string; name: string };
type Module = { id: string; name: string; code: string; professor_id?: string };
type Exam = { id: string; module_id: string; room_id: string; date: string; start_time: string; end_time: string; duration_minutes: number; professor_ids: string[] };
type DataSet = { professors: Professor[]; rooms: Room[]; modules: Module[] };
type Entry = { date: string; weekday: string; start: string; end: string; module: string; room: string; professors: string[] };

const toWeekday = (d: string) => new Date(d).toLocaleDateString(undefined, { weekday: "long" });
const addMinutes = (time: string, minutes: number): string => {
  const [h, m] = time.split(":").map(Number);
  const base = new Date(0, 0, 0, h, m, 0, 0);
  const end = new Date(base.getTime() + minutes * 60000);
  const hh = String(end.getHours()).padStart(2, "0");
  const mm = String(end.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

const buildAiPrompt = (data: DataSet): string => {
  return (
    "You are an exam scheduling assistant. Given modules, professors, and rooms, " +
    "create a plan with these constraints: \n" +
    "- Schedule each module exactly once.\n" +
    "- Weekdays only (Monday to Friday).\n" +
    "- At most 2 exams per day.\n" +
    "- A professor cannot surveil more than once per day.\n" +
    "- Each exam has duration_minutes; default to 120 if unspecified.\n" +
    "- Choose one room per slot; avoid double booking.\n\n" +
    "Return only JSON matching this schema: {\n  \"exams\": [\n    {\n      \"module_id\": \"string\",\n      \"date\": \"YYYY-MM-DD\",\n      \"start_time\": \"HH:MM\",\n      \"end_time\": \"HH:MM\",\n      \"duration_minutes\": number,\n      \"room_id\": \"string\",\n      \"professor_ids\": [\"string\"]\n    }\n  ]\n}."
  );
};

const suggestExamsWithAI = async (data: DataSet): Promise<Exam[]> => {
  console.log("Export: planner API scheduling start");
  try {
    const apiUrl = import.meta.env.VITE_PLANNER_API_URL || "http://localhost:3002/suggest-exams";
    const resp = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        use_ai: true,
        duration_minutes: 120,
        modules: data.modules.map(m => ({ id: m.id, professor_id: m.professor_id })),
        professors: data.professors.map(p => ({ id: p.id })),
        rooms: data.rooms.map(r => ({ id: r.id })),
      }),
    });
    const json = await resp.json();
    const examsRaw: any[] = json.exams || [];
    const exams: Exam[] = examsRaw.map((e: any) => ({
      id: `api-${e.module_id}-${e.date}-${e.start_time}`,
      module_id: e.module_id,
      room_id: e.room_id,
      date: e.date,
      start_time: e.start_time,
      end_time: e.end_time ?? addMinutes(e.start_time, e.duration_minutes ?? 120),
      duration_minutes: e.duration_minutes ?? 120,
      professor_ids: Array.isArray(e.professor_ids) ? e.professor_ids : (e.professor_id ? [e.professor_id] : []),
    }));
    console.log("Export: planner API suggested exams", { count: exams.length });
    if (exams.length) return exams;
  } catch (e) {
    console.error("Export: planner API failed", e);
  }
  return suggestExams(data);
};

const fetchData = async (): Promise<DataSet> => {
  console.time("Export: fetchData");
  const [profRes, roomRes, modRes] = await Promise.all([
    supabase.from("professors").select("id, first_name, last_name"),
    supabase.from("rooms").select("id, name"),
    supabase.from("modules").select("id, name, code, professor_id"),
  ]);
  if (profRes.error || roomRes.error || modRes.error) {
    console.error("Export: fetchData failed", { profErr: profRes.error, roomErr: roomRes.error, modErr: modRes.error });
    throw new Error("Failed to load data for export");
  }
  const professors: Professor[] = (profRes.data || []) as Professor[];
  const rooms: Room[] = (roomRes.data || []) as Room[];
  const modules: Module[] = (modRes.data || []) as Module[];
  console.log("Export: fetchData counts", { professors: professors.length, rooms: rooms.length, modules: modules.length });
  console.timeEnd("Export: fetchData");
  return { professors, rooms, modules };
};

const buildSchedule = (data: DataSet, exams: Exam[]): Entry[] => {
  const pMap = new Map(data.professors.map(p => [p.id, `${p.first_name} ${p.last_name}`]));
  const rMap = new Map(data.rooms.map(r => [r.id, r.name]));
  const mMap = new Map(data.modules.map(m => [m.id, m.name]));
  const entries: Entry[] = exams.map(e => ({
    date: e.date,
    weekday: toWeekday(e.date),
    start: e.start_time,
    end: e.end_time,
    module: mMap.get(e.module_id) || "",
    room: rMap.get(e.room_id) || "",
    professors: e.professor_ids.map(id => pMap.get(id) || "").filter(x => x)
  }));
  entries.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  const seen = new Map<string, true>();
  const adjusted: Entry[] = [];
  for (const entry of entries) {
    const allowed = [] as string[];
    for (const prof of entry.professors) {
      const key = `${prof}-${entry.date}`;
      if (!seen.has(key)) {
        seen.set(key, true);
        allowed.push(prof);
      }
    }
    adjusted.push({ ...entry, professors: allowed });
  }
  return adjusted.filter(e => e.professors.length > 0);
};

const suggestExams = (data: DataSet): Exam[] => {
  console.time("Export: suggestExams");
  const modules = [...data.modules];
  const professors = data.professors;
  const rooms = data.rooms;
  const defaultDuration = 120;
  const today = new Date();
  const nextWeekdays: string[] = [];
  while (nextWeekdays.length < modules.length) {
    const d = new Date(today.getTime() + (nextWeekdays.length + 1) * 24 * 60 * 60 * 1000);
    const day = d.getDay();
    if (day !== 0 && day !== 6) {
      nextWeekdays.push(d.toISOString().split("T")[0]);
    }
  }
  const slots: { date: string; start: string }[] = [];
  for (const date of nextWeekdays) {
    slots.push({ date, start: "08:30" });
    slots.push({ date, start: "14:00" });
  }
  console.log("Export: slots prepared", { slots: slots.length });
  const profPerDay = new Map<string, Set<string>>();
  const roomPerSlot = new Set<string>();
  const exams: Exam[] = [];
  let slotIdx = 0;
  for (const m of modules) {
    if (slotIdx >= slots.length) break;
    const slot = slots[slotIdx];
    const duration = defaultDuration;
    const end = addMinutes(slot.start, duration);
    let profId = m.professor_id;
    if (!profId) {
      const used = profPerDay.get(slot.date) || new Set<string>();
      const freeProf = professors.find(p => !used.has(p.id));
      profId = freeProf?.id;
    }
    if (!profId) { slotIdx++; continue; }
    const usedSet = profPerDay.get(slot.date) || new Set<string>();
    if (usedSet.has(profId)) { slotIdx++; continue; }
    let roomId = rooms[0]?.id;
    for (const r of rooms) {
      const rk = `${r.id}|${slot.date}|${slot.start}`;
      if (!roomPerSlot.has(rk)) {
        roomId = r.id;
        roomPerSlot.add(rk);
        break;
      }
    }
    if (!roomId) { slotIdx++; continue; }
    usedSet.add(profId);
    profPerDay.set(slot.date, usedSet);
    exams.push({
      id: `auto-${m.id}-${slot.date}-${slot.start}`,
      module_id: m.id,
      room_id: roomId,
      date: slot.date,
      start_time: slot.start,
      end_time: end,
      duration_minutes: duration,
      professor_ids: [profId],
    });
    slotIdx++;
  }
  console.log("Export: exams suggested", { count: exams.length });
  console.timeEnd("Export: suggestExams");
  return exams;
};

const exportCsvSchedule = (entries: Entry[], filename: string) => {
  console.log("Export: CSV entries", { count: entries.length, filename });
  const header = ["Date", "Weekday", "Start", "End", "Module", "Room", "Professors"];
  const rows = entries.map(e => [e.date, e.weekday, e.start, e.end, e.module, e.room, e.professors.join(" | ")]);
  const csv = [header.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(link.href);
};

const exportPdfSchedule = (entries: Entry[], filename: string) => {
  console.log("Export: PDF entries", { count: entries.length, filename });
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text("Planning des examens", 20, 20);
  let y = 30;
  const byDate: Record<string, Entry[]> = {};
  for (const e of entries) {
    (byDate[e.date] ??= []).push(e);
  }
  const dates = Object.keys(byDate).sort();
  for (const d of dates) {
    doc.setFontSize(12);
    doc.text(`${d} ${toWeekday(d)}`, 20, y);
    y += 6;
    for (const e of byDate[d]) {
      const line = `${e.start}-${e.end} | ${e.module} | ${e.room} | ${e.professors.join(", ")}`;
      doc.text(line, 20, y);
      y += 6;
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    }
    y += 4;
    if (y > 285) {
      doc.addPage();
      y = 20;
    }
  }
  doc.save(`${filename}.pdf`);
};

export default function Export() {
    const { toast } = useToast();

    const handleExport = async (type: string, format: string) => {
        toast({
            title: "Export en cours",
            description: `Génération du fichier ${type} (${format})...`,
        });

        // Small delay to allow toast to render
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const cleanType = type.replace(/\s+/g, '_');
            const filename = `${cleanType}_${dateStr}`;
            console.log("Export: start", { type, format, filename });

            if (type.includes("Feuilles d'émargement") || format === "ZIP") {
                // ZIP Case
                const zip = new JSZip();
                const folder = zip.folder("Feuilles_Emargement");

                // Add some dummy PDF files to the zip - simulating real content
                const doc1 = new jsPDF();
                doc1.setFontSize(20);
                doc1.text("Feuille d'émargement: Salle A", 20, 20);
                doc1.setFontSize(12);
                doc1.text("Examen: Analyse Numérique", 20, 30);
                doc1.text("Surveillant: Dr. Benali", 20, 40);
                doc1.table(20, 50, [
                    { name: "Nom", width: 40 },
                    { name: "Prénom", width: 40 },
                    { name: "Signature", width: 60 }
                ], [], { autoSize: true });
                folder?.file("Salle_A.pdf", doc1.output('blob'));

                const doc2 = new jsPDF();
                doc2.setFontSize(20);
                doc2.text("Feuille d'émargement: Salle B", 20, 20);
                doc2.text("Examen: Programmation Web", 20, 30);
                folder?.file("Salle_B.pdf", doc2.output('blob'));

                const content = await zip.generateAsync({ type: "blob" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(content);
                link.download = `${filename}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

            } else if (format === "PDF") {
                const data = await fetchData();
                console.log("Export: planning with local scheduler");
                const examsPlanned = await suggestExamsWithAI(data);
                const entries = buildSchedule(data, examsPlanned);
                exportPdfSchedule(entries, filename);
            }
            else if (format === "Excel") {
                const data = await fetchData();
                console.log("Export: planning with local scheduler");
                const examsPlanned = await suggestExamsWithAI(data);
                const entries = buildSchedule(data, examsPlanned);
                exportCsvSchedule(entries, filename);
            }

            toast({
                title: "Export terminé",
                description: `Le fichier a été téléchargé avec succès.`,
                variant: 'default'
            });

        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'export.",
                variant: "destructive"
            });
        }
    };

    return (
        <MainLayout>
            <div className="p-8">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <FileDown className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Export</h1>
                        <p className="mt-1 text-muted-foreground">
                            Exporter les plannings et rapports
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                    {/* Planning Global */}
                    <Card className="glass-card border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                                Planning Global
                            </CardTitle>
                            <CardDescription>
                                Vue d'ensemble de tous les examens et affectations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Tous les examens de la session</li>
                                <li>Affectations des salles</li>
                                <li>Surveillants assignés</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => handleExport("Planning Global", "PDF")}>
                                <FileText className="mr-2 h-4 w-4" /> PDF
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => handleExport("Planning Global", "Excel")}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Liste des Surveillants */}
                    <Card className="glass-card border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-info" />
                                Planning Surveillants
                            </CardTitle>
                            <CardDescription>
                                Emploi du temps par surveillant
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Nombre de surveillances</li>
                                <li>Chevauchements potentiels</li>
                                <li>Quotas horaires</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => handleExport("Planning Surveillants", "PDF")}>
                                <FileText className="mr-2 h-4 w-4" /> PDF
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => handleExport("Planning Surveillants", "Excel")}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Feuilles d'émargement */}
                    <Card className="glass-card border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-warning" />
                                Feuilles d'émargement
                            </CardTitle>
                            <CardDescription>
                                Listes des étudiants par salle
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Classé par examen</li>
                                <li>Liste alphabétique</li>
                                <li>Colonnes pour signatures</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="gradient" className="w-full" onClick={() => handleExport("Feuilles d'émargement", "ZIP")}>
                                <FileDown className="mr-2 h-4 w-4" /> Tout Télécharger (ZIP)
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
