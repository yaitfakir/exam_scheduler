import { useState, useEffect } from "react";
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

interface AddExamDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd?: (exam: any) => void;
    onEdit?: (exam: any) => void;
    initialData?: any;
    modules: any[];
    rooms: any[];
    professors?: any[];
}

export function AddExamDialog({ open, onOpenChange, onAdd, onEdit, initialData, modules, rooms, professors = [] }: AddExamDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        module_id: "",
        date: "",
        time: "",
        duration: "",
        room_id: "",
        type: "",
        supervisor_id: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                module_id: initialData.module_id ? initialData.module_id.toString() : "",
                date: initialData.displayDate || initialData.date || "", // Handle varying date formats if any
                time: initialData.time ? initialData.time.split(" - ")[0] : "",
                duration: initialData.duration ? initialData.duration.toString().replace("h", "") : "",
                room_id: initialData.room_id ? initialData.room_id.toString() : "",
                type: initialData.type || "CC",
                supervisor_id: initialData.supervisor_id
                    ? initialData.supervisor_id.toString()
                    : initialData.professor_id
                    ? initialData.professor_id.toString()
                    : "",
            });
        } else {
            setFormData({ module_id: "", date: "", time: "", duration: "", room_id: "", type: "", supervisor_id: "" });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.module_id || !formData.date || !formData.time || !formData.duration) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs obligatoires",
                variant: "destructive",
            });
            return;
        }

        const selectedModule = modules.find(m => m.id.toString() === formData.module_id);
        const moduleName = selectedModule ? selectedModule.name : "";

        const examData = {
            ...(initialData || {
                status: "confirmed",
                students: 0,
                groups: []
            }),
            module_id: formData.module_id,
            room_id: formData.room_id ? formData.room_id : null,
            supervisor_id: formData.supervisor_id ? formData.supervisor_id : null,
            date: formData.date,
            time: formData.time,
            duration: formData.duration,
            type: formData.type,
            module: moduleName
        };

        if (initialData && onEdit) {
            onEdit(examData);
            toast({ title: "Succès", description: "Examen modifié avec succès" });
        } else if (onAdd) {
            onAdd(examData);
            toast({ title: "Succès", description: "Examen ajouté avec succès" });
        }

        onOpenChange(false);
    };

    const addTime = (start: string, duration: string) => {
        const [h, m] = start.split(':').map(Number);
        const dur = parseFloat(duration);
        let endH = h + Math.floor(dur);
        let endM = m + (dur % 1) * 60;
        if (endM >= 60) {
            endH += 1;
            endM -= 60;
        }
        return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Modifier l'examen" : "Nouvel examen"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Modifiez les détails de l'examen" : "Planifiez un nouvel examen ou contrôle continu"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="module">Module *</Label>
                            <Select
                                value={formData.module_id}
                                onValueChange={(value) => setFormData({ ...formData, module_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un module" />
                                </SelectTrigger>
                                <SelectContent>
                                    {modules.map(m => (
                                        <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(value) => setFormData({ ...formData, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CC">Contrôle Continu</SelectItem>
                                    <SelectItem value="Examen Final">Examen Final</SelectItem>
                                    <SelectItem value="Rattrapage">Rattrapage</SelectItem>
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
                        <div className="grid gap-2">
                            <Label htmlFor="time">Heure de début *</Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="duration">Durée (heures) *</Label>
                            <Input
                                id="duration"
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                placeholder="2"
                                min="0.5"
                                max="5"
                                step="0.5"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="room">Salle</Label>
                            <Select
                                value={formData.room_id}
                                onValueChange={(value) => setFormData({ ...formData, room_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner une salle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {rooms.map(r => (
                                        <SelectItem key={r.id} value={r.id.toString()}>{r.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="supervisor">Surveillant</Label>
                            <Select
                                value={formData.supervisor_id}
                                onValueChange={(value) => setFormData({ ...formData, supervisor_id: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un surveillant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {professors.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="gradient">
                            {initialData ? "Modifier" : "Créer l'examen"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

