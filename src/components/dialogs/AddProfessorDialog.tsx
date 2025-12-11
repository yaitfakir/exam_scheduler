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

interface AddProfessorDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd?: (professor: any) => void;
    onEdit?: (professor: any) => void;
    initialData?: any;
}

export function AddProfessorDialog({ open, onOpenChange, onAdd, onEdit, initialData }: AddProfessorDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        department: "",
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                first_name: initialData.first_name,
                last_name: initialData.last_name,
                email: initialData.email,
                phone: initialData.phone,
                department: initialData.department,
            });
        } else {
            setFormData({ first_name: "", last_name: "", email: "", phone: "", department: "" });
        }
    }, [initialData, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.first_name || !formData.last_name || !formData.email || !formData.department) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs obligatoires",
                variant: "destructive",
            });
            return;
        }

        const professorData = {
            ...(initialData || { id: Date.now(), load: 0, surveillances: 0, availability: "Disponible" }),
            ...formData,
            avatar: formData.first_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) + formData.last_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2),
        };

        if (initialData && onEdit) {
            onEdit(professorData);
            toast({ title: "Succès", description: "Professeur modifié avec succès" });
        } else if (onAdd) {
            onAdd(professorData);
            toast({ title: "Succès", description: "Professeur ajouté avec succès" });
        }

        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? "Modifier le professeur" : "Ajouter un professeur"}</DialogTitle>
                    <DialogDescription>
                        {initialData ? "Modifiez les informations du professeur" : "Remplissez les informations du nouveau professeur"}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Prénom *</Label>
                            <Input
                                id="name"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                placeholder="Dr. Ahmed Benali"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom *</Label>
                            <Input
                                id="name"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                placeholder="Dr. Ahmed Benali"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="a.benali@ensa.ma"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Téléphone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+212 6 12 34 56 78"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="department">Département *</Label>
                            <Select
                                value={formData.department}
                                onValueChange={(value) => setFormData({ ...formData, department: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un département" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Informatique">Informatique</SelectItem>
                                    <SelectItem value="Mathématiques">Mathématiques</SelectItem>
                                    <SelectItem value="Physique">Physique</SelectItem>
                                    <SelectItem value="Électronique">Électronique</SelectItem>
                                    <SelectItem value="Mécanique">Mécanique</SelectItem>
                                    <SelectItem value="Chimie">Chimie</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" variant="gradient">
                            {initialData ? "Modifier" : "Ajouter"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

