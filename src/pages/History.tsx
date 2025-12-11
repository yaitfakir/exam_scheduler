import { MainLayout } from "@/components/layout/MainLayout";
import { History as HistoryIcon, User, Calendar, Edit, Trash2, PlusCircle, CheckCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initialHistory = [
    {
        id: 1,
        user: "Admin",
        action: "Ajout d'examen",
        details: "A ajouté l'examen 'Analyse Numérique' pour le 15 Janvier",
        time: "Il y a 2 minutes",
        icon: PlusCircle,
        color: "text-success",
    },
    {
        id: 2,
        user: "Dr. Benali",
        action: "Modification",
        details: "A changé la salle de l'examen 'Programmation Web' vers Salle B-12",
        time: "Il y a 15 minutes",
        icon: Edit,
        color: "text-warning",
    },
    {
        id: 3,
        user: "Admin",
        action: "Suppression",
        details: "A supprimé le module 'Ancien Module 2023'",
        time: "Il y a 1 heure",
        icon: Trash2,
        color: "text-destructive",
    },
    {
        id: 4,
        user: "Admin",
        action: "Validation",
        details: "A validé le planning de la semaine du 15 Janvier",
        time: "Il y a 3 heures",
        icon: CheckCircle,
        color: "text-primary",
    },
    {
        id: 5,
        user: "Système",
        action: "Synchronisation",
        details: "Synchronisation automatique des listes d'étudiants",
        time: "Hier à 23:00",
        icon: Calendar,
        color: "text-muted-foreground",
    },
];

export default function History() {
    return (
        <MainLayout>
            <div className="p-8 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <HistoryIcon className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Historique</h1>
                        <p className="mt-1 text-muted-foreground">
                            Journal des modifications et actions récentes
                        </p>
                    </div>
                </div>

                <div className="glass-card flex-1 p-6 animate-fade-in">
                    <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-8">
                            {initialHistory.map((item, index) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center bg-background z-10 ${item.color.replace('text-', 'border-')}`}>
                                            <item.icon className={`h-4 w-4 ${item.color}`} />
                                        </div>
                                        {index !== initialHistory.length - 1 && (
                                            <div className="w-0.5 h-full bg-border -mb-8 mt-2" />
                                        )}
                                    </div>
                                    <div className="flex-1 pb-8 border-b border-border/50 last:border-0 last:pb-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-foreground">{item.action}</h3>
                                            <span className="text-xs text-muted-foreground">{item.time}</span>
                                        </div>
                                        <p className="text-sm text-muted-foreground mb-3">{item.details}</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-foreground/80 bg-secondary/50 px-2 py-1 rounded w-fit">
                                            <User className="h-3 w-3" />
                                            {item.user}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </MainLayout>
    );
}
