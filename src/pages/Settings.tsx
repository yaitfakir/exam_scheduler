import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Settings as SettingsIcon, Save, Bell, Moon, Sun, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";

export default function Settings() {
    const { toast } = useToast();
    const [settings, setSettings] = useState({
        universityName: "Université Hassan II",
        academicYear: "2024-2025",
        emailNotifications: true,
        darkMode: true,
        autoSave: true,
        language: "Français",
    });

    const handleSave = () => {
        toast({
            title: "Paramètres sauvegardés",
            description: "Vos modifications ont été enregistrées avec succès.",
        });
    };

    return (
        <MainLayout>
            <div className="p-8 pb-20">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <SettingsIcon className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
                        <p className="mt-1 text-muted-foreground">
                            Configuration de l'application
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="general" className="w-full animate-fade-in">
                    <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-8">
                        <TabsTrigger value="general">Général</TabsTrigger>
                        <TabsTrigger value="appearance">Apparence</TabsTrigger>
                        <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Informations Générales</CardTitle>
                                <CardDescription>
                                    Configurez les informations de base de l'établissement.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="university">Nom de l'établissement</Label>
                                    <Input
                                        id="university"
                                        value={settings.universityName}
                                        onChange={(e) => setSettings({ ...settings, universityName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="year">Année Universitaire</Label>
                                    <Input
                                        id="year"
                                        value={settings.academicYear}
                                        onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="language">Langue</Label>
                                    <div className="flex items-center gap-2 border rounded-md p-2 bg-secondary/50">
                                        <Globe className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm">{settings.language}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Sauvegarde Automatique</Label>
                                        <p className="text-sm text-muted-foreground">Sauvegarder les changements automatiquement</p>
                                    </div>
                                    <Switch
                                        checked={settings.autoSave}
                                        onCheckedChange={(checked) => setSettings({ ...settings, autoSave: checked })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Apparence</CardTitle>
                                <CardDescription>Personnalisez l'interface utilisateur.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Mode Sombre</Label>
                                        <p className="text-sm text-muted-foreground">Basculer entre les thèmes clair et sombre</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Sun className="h-4 w-4 text-muted-foreground" />
                                        <Switch
                                            checked={settings.darkMode}
                                            onCheckedChange={(checked) => setSettings({ ...settings, darkMode: checked })}
                                        />
                                        <Moon className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="notifications">
                        <Card className="glass-card">
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Gérez vos préférences de notifications.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-base">Notifications Email</Label>
                                        <p className="text-sm text-muted-foreground">Recevoir des résumés quotidiens par email</p>
                                    </div>
                                    <Switch
                                        checked={settings.emailNotifications}
                                        onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
                                    />
                                </div>
                                <Separator />
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Shield className="h-4 w-4" />
                                        <span>Sécurité et Alertes</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="conflicts" className="font-normal">Alertes de conflits d'horaire</Label>
                                        <Switch defaultChecked id="conflicts" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="capacity" className="font-normal">Alertes de capacité des salles</Label>
                                        <Switch defaultChecked id="capacity" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                <div className="mt-6 flex justify-end">
                    <Button variant="gradient" className="gap-2" onClick={handleSave}>
                        <Save className="h-4 w-4" />
                        Enregistrer les modifications
                    </Button>
                </div>
            </div>
        </MainLayout>
    );
}

