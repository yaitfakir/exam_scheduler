import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Users, GraduationCap, Calendar } from "lucide-react";

interface ViewModuleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    module: any;
}

export function ViewModuleDialog({ open, onOpenChange, module }: ViewModuleDialogProps) {
    if (!module) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Détails du Module</DialogTitle>
                    <DialogDescription>{module.code}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <div className={`w-16 h-16 rounded-lg ${module.color} flex items-center justify-center text-primary-foreground text-xl font-bold`}>
                            {module.code.split('-')[0]}
                        </div>
                        <h2 className="text-xl font-bold text-center">{module.name}</h2>
                        <Badge variant="outline">{module.department}</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <span>Professeur: {module.professor}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <span>Semestre: {module.semester}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>Étudiants: {module.students} (Groupes: {module.groups.join(", ")})</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Examens planifiés: {module.examsPlanned}</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
