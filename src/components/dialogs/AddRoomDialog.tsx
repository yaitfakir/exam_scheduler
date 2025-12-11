import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

interface AddRoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdd: (room: any) => void;
}

export function AddRoomDialog({ open, onOpenChange, onAdd }: AddRoomDialogProps) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        capacity: "",
        type: "",
        building: "",
        equipment: [] as string[],
    });

    const equipmentOptions = [
        "Vidéoprojecteur",
        "Micro",
        "Wifi",
        "Ordinateurs",
        "Tableau blanc",
        "Climatisation"
    ];

    const handleEquipmentChange = (item: string, checked: boolean) => {
        if (checked) {
            setFormData(prev => ({ ...prev, equipment: [...prev.equipment, item] }));
        } else {
            setFormData(prev => ({ ...prev, equipment: prev.equipment.filter(e => e !== item) }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.capacity || !formData.type || !formData.building) {
            toast({
                title: "Erreur",
                description: "Veuillez remplir tous les champs obligatoires",
                variant: "destructive",
            });
            return;
        }

        const newRoom = {
            id: Date.now(),
            name: formData.name,
            capacity: parseInt(formData.capacity),
            type: formData.type,
            building: formData.building,
            status: "available",
            equipment: formData.equipment,
            currentUsage: 0,
        };

        onAdd(newRoom);

        toast({
            title: "Succès",
            description: "Salle ajoutée avec succès",
        });

        setFormData({ name: "", capacity: "", type: "", building: "", equipment: [] });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Ajouter une salle</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations de la nouvelle salle
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom de la salle *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="A101"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="capacity">Capacité *</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                placeholder="50"
                                min="1"
                            />
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
                                    <SelectItem value="Amphithéâtre">Amphithéâtre</SelectItem>
                                    <SelectItem value="Salle TD">Salle TD</SelectItem>
                                    <SelectItem value="Laboratoire">Laboratoire</SelectItem>
                                    <SelectItem value="Salle TP">Salle TP</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="building">Bâtiment *</Label>
                            <Select
                                value={formData.building}
                                onValueChange={(value) => setFormData({ ...formData, building: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner un bâtiment" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Bâtiment A">Bâtiment A</SelectItem>
                                    <SelectItem value="Bâtiment B">Bâtiment B</SelectItem>
                                    <SelectItem value="Bâtiment C">Bâtiment C</SelectItem>
                                    <SelectItem value="Bâtiment D">Bâtiment D</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid gap-3">
                        <Label>Équipements</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {equipmentOptions.map((item) => (
                                <div key={item} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`equip-${item}`}
                                        checked={formData.equipment.includes(item)}
                                        onCheckedChange={(checked) => handleEquipmentChange(item, checked as boolean)}
                                    />
                                    <Label htmlFor={`equip-${item}`} className="font-normal cursor-pointer">
                                        {item}
                                    </Label>
                                </div>
                            ))}
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
        </Dialog >
    );
}
