import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface AddEventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (event: any) => void;
}

export function AddEventDialog({ open, onOpenChange, onAdd }: AddEventDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        title: "",
        date: "",
        time: "",
        duration: "90",
        room: "",
        type: "Cours",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.date || !formData.time) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir les champs obligatoires",
                variant: "destructive",
            });
            return;
        }

        const newEvent = {
            id: Date.now(),
            title: formData.title,
            date: new Date(formData.date), // Convert string to Date
            time: formData.time,
            duration: parseInt(formData.duration),
            room: formData.room || "Non assignée",
            color: "bg-primary", // Default color
        };

        onAdd(newEvent);

        toast({
            title: "Succès",
            description: "Événement ajouté au calendrier",
        });

        setFormData({ title: "", date: "", time: "", duration: "90", room: "", type: "Cours" });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Nouvel événement</DialogTitle>
                    <DialogDescription>
                        Ajouter un cours, examen ou autre événement.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Titre *</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Nom de l'événement"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner le type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Cours">Cours</SelectItem>
                                    <SelectItem value="Examen">Examen</SelectItem>
                                    <SelectItem value="Réunion">Réunion</SelectItem>
                                    <SelectItem value="Autre">Autre</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="time">Heure *</Label>
                                <Input
                                    id="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="duration">Durée (min)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    step="15"
                                    value={formData.duration}
                                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="room">Salle</Label>
                            <Input
                                id="room"
                                value={formData.room}
                                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                                placeholder="Ex: Amphi A"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="gradient">
                            Ajouter
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
