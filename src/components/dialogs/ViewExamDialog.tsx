import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, User, GraduationCap } from "lucide-react";

interface ViewExamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    exam: any;
}

export function ViewExamDialog({ open, onOpenChange, exam }: ViewExamDialogProps) {
    if (!exam) return null;

    const statusStyles = {
        confirmed: { label: "Confirmé", class: "bg-success/10 text-success border-success/20" },
        pending: { label: "En attente", class: "bg-warning/10 text-warning border-warning/20" },
        unassigned: { label: "Non assigné", class: "bg-destructive/10 text-destructive border-destructive/20" },
        "Planifié": { label: "Planifié", class: "bg-primary/10 text-primary border-primary/20" }
    };

    const statusObj = statusStyles[exam.status as keyof typeof statusStyles] || statusStyles["Planifié"];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Détails de l'examen</DialogTitle>
                    <DialogDescription>{exam.code}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <h2 className="text-xl font-bold text-center">{exam.module}</h2>
                        <Badge variant="outline" className={statusObj.class}>{statusObj.label}</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Date: {exam.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>Heure: {exam.time} ({exam.duration})</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>Salle: {exam.room}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>Surveillant: {exam.supervisor || "Non assigné"}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Étudiants: {exam.students}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span>Groupes: {exam.groups ? exam.groups.join(", ") : "N/A"}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
