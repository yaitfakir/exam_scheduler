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

    interface AddModuleDialogProps {
        open: boolean;
        onOpenChange: (open: boolean) => void;
        onAdd?: (module: any) => void;
        onEdit?: (module: any) => void;
        initialData?: any;
        professors: { id: number; name: string }[];
    }

    export function AddModuleDialog({
        open,
        onOpenChange,
        onAdd,
        onEdit,
        initialData,
        professors
    }: AddModuleDialogProps) {

        const { toast } = useToast();
        const [formData, setFormData] = useState({
            code: "",
            name: "",
            professor_id: "",
            semester: "",
            credits: "",
        });

        useEffect(() => {
            if (initialData) {
                setFormData({
                    code: initialData.code || "",
                    name: initialData.name || "",
                    professor_id: initialData.professor_id ? initialData.professor_id.toString() : "",
                    semester: initialData.semester || "",
                    credits: initialData.credits ? initialData.credits.toString() : "3",
                });
            } else {
                setFormData({ code: "", name: "", professor_id: "", semester: "", credits: "" });
            }
        }, [initialData, open]);

        const handleSubmit = (e: React.FormEvent) => {
            e.preventDefault();

            if (!formData.code || !formData.name || !formData.semester) {
                toast({
                    title: "Erreur",
                    description: "Veuillez remplir tous les champs obligatoires",
                    variant: "destructive",
                });
                return;
            }

            const moduleData = {
                ...(initialData || {
                    students: 0,
                    examsPlanned: 0,
                    groups: ["G1"],
                    department: "Informatique",
                    color: "bg-primary",
                }),
                code: formData.code,
                name: formData.name,
                semester: formData.semester,
                credits: parseInt(formData.credits) || 3,
                professor_id: formData.professor_id || null
            };

            if (initialData && onEdit) {
                onEdit(moduleData);
                toast({ title: "Succès", description: "Module modifié avec succès" });
            } else if (onAdd) {
                onAdd(moduleData);
                toast({ title: "Succès", description: "Module ajouté avec succès" });
            }

            onOpenChange(false);
        };

        return (
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {initialData ? "Modifier le module" : "Ajouter un module"}
                        </DialogTitle>
                        <DialogDescription>
                            {initialData
                                ? "Modifiez les informations du module"
                                : "Remplissez les informations du nouveau module"}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 py-4">

                            <div className="grid gap-2">
                                <Label htmlFor="code">Code du module *</Label>
                                <Input
                                    id="code"
                                    value={formData.code}
                                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                    placeholder="INF101"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom du module *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Algorithmique"
                                />
                            </div>

                            {/* FIXED PROFESSOR SELECT */}
                            <div className="grid gap-2">
                                <Label htmlFor="professor">Professeur</Label>
                                <Select
                                    value={formData.professor_id}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, professor_id: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un professeur" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {professors.map((p) => (
                                            <SelectItem key={p.id} value={p.id.toString()}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="semester">Semestre *</Label>
                                <Select
                                    value={formData.semester}
                                    onValueChange={(value) =>
                                        setFormData({ ...formData, semester: value })
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un semestre" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="S1">Semestre 1</SelectItem>
                                        <SelectItem value="S2">Semestre 2</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="credits">Crédits</Label>
                                <Input
                                    id="credits"
                                    type="number"
                                    value={formData.credits}
                                    onChange={(e) => setFormData({ ...formData, credits: e.target.value })}
                                    placeholder="3"
                                    min="1"
                                    max="10"
                                />
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
