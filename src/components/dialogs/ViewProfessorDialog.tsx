import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Building2, Calendar, Activity } from "lucide-react";

interface ViewProfessorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    professor: any;
}

export function ViewProfessorDialog({ open, onOpenChange, professor }: ViewProfessorDialogProps) {
    if (!professor) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Profil Professeur</DialogTitle>
                    <DialogDescription>Détails du professeur</DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center justify-center gap-2">
                        <Avatar className="h-24 w-24">
                            <AvatarFallback className="text-xl bg-primary/10 text-primary">
                                {professor.avatar}
                            </AvatarFallback>
                        </Avatar>
                        <h2 className="text-xl font-bold">{professor.name}</h2>
                        <Badge variant="outline">{professor.department}</Badge>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{professor.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{professor.phone}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Building2 className="h-4 w-4 text-muted-foreground" />
                            <span>{professor.department}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Activity className="h-4 w-4 text-muted-foreground" />
                            <span>Charge: {professor.load}%</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Surveillances: {professor.surveillances}</span>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">Statut</span>
                            <Badge variant={professor.availability === "Disponible" ? "default" : "secondary"}>
                                {professor.availability}
                            </Badge>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
