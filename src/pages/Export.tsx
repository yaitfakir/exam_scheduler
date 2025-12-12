import { MainLayout } from "@/components/layout/MainLayout";
import { FileDown, FileSpreadsheet, FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import JSZip from "jszip";

export default function Export() {
    const { toast } = useToast();

    const handleExport = async (type: string, format: string) => {
        toast({
            title: "Export en cours",
            description: `Génération du fichier ${type} (${format})...`,
        });

        // Small delay to allow toast to render
        await new Promise(resolve => setTimeout(resolve, 500));

        try {
            const dateStr = new Date().toISOString().split('T')[0];
            const cleanType = type.replace(/\s+/g, '_');
            const filename = `${cleanType}_${dateStr}`;

            if (type.includes("Feuilles d'émargement") || format === "ZIP") {
                // ZIP Case
                const zip = new JSZip();
                const folder = zip.folder("Feuilles_Emargement");

                // Add some dummy PDF files to the zip - simulating real content
                const doc1 = new jsPDF();
                doc1.setFontSize(20);
                doc1.text("Feuille d'émargement: Salle A", 20, 20);
                doc1.setFontSize(12);
                doc1.text("Examen: Analyse Numérique", 20, 30);
                doc1.text("Surveillant: Dr. Benali", 20, 40);
                doc1.table(20, 50, [
                    { name: "Nom", width: 40 },
                    { name: "Prénom", width: 40 },
                    { name: "Signature", width: 60 }
                ], [], { autoSize: true });
                folder?.file("Salle_A.pdf", doc1.output('blob'));

                const doc2 = new jsPDF();
                doc2.setFontSize(20);
                doc2.text("Feuille d'émargement: Salle B", 20, 20);
                doc2.text("Examen: Programmation Web", 20, 30);
                folder?.file("Salle_B.pdf", doc2.output('blob'));

                const content = await zip.generateAsync({ type: "blob" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(content);
                link.download = `${filename}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

            } else if (format === "PDF") {
                const doc = new jsPDF();
                doc.setFontSize(20);
                doc.text(`Rapport: ${type}`, 20, 20);
                doc.setFontSize(12);
                doc.text(`Date d'export: ${new Date().toLocaleDateString()}`, 20, 30);
                doc.text("Ceci est un document officiel généré par l'application.", 20, 40);
                doc.text("---------------------------------------------------", 20, 45);

                // Add some dummy content based on type
                if (type.includes("Planning")) {
                    doc.text("Exemple de données de planning:", 20, 55);
doc.text("- 09:00 - 10:00 : Administration Réseaux (Salle R-101)", 20, 65);
                    doc.text("- 10:15 - 11:15 : Administration Système (Salle S-102)", 20, 75);
                    doc.text("- 10:30 - 12:00 : Analyse Numérique (Amphi A)", 20, 85);
                    doc.text("- 14:00 - 15:00 : Cryptologie (Salle C-103)", 20, 95);
                    doc.text("- 15:15 - 16:15 : Conception des Systèmes Mécaniques (Labo M-201)", 20, 105);
                    doc.text("- 16:30 - 17:30 : Électronique Numérique (Salle E-104)", 20, 115);
                    doc.text("- 08:30 - 09:30 : Électronique de Puissance (Labo P-202)", 20, 125);
                    doc.text("- 09:30 - 10:30 : Procédés de Fabrication (Atelier F-301)", 20, 135);                } else {
                    doc.text("Contenu du rapport...", 20, 55);
                }

                doc.save(`${filename}.pdf`);
            }
            else if (format === "Excel") {
                // Generate CSV for Excel compatibility
                const csvContent = "Module,Date,Heure,Salle,Surveillant\nAnalyse Numérique,2025-01-15,08:30,Amphi A,Dr. Benali\nProgrammation Web,2025-01-15,14:00,Salle B-12,Prof. Zahra";
                const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                const link = document.createElement("a");
                link.href = URL.createObjectURL(blob);
                link.download = `${filename}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
            }

            toast({
                title: "Export terminé",
                description: `Le fichier a été téléchargé avec succès.`,
                variant: 'default'
            });

        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'export.",
                variant: "destructive"
            });
        }
    };

    return (
        <MainLayout>
            <div className="p-8">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                        <FileDown className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Export</h1>
                        <p className="mt-1 text-muted-foreground">
                            Exporter les plannings et rapports
                        </p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
                    {/* Planning Global */}
                    <Card className="glass-card border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileSpreadsheet className="h-5 w-5 text-primary" />
                                Planning Global
                            </CardTitle>
                            <CardDescription>
                                Vue d'ensemble de tous les examens et affectations
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Tous les examens de la session</li>
                                <li>Affectations des salles</li>
                                <li>Surveillants assignés</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => handleExport("Planning Global", "PDF")}>
                                <FileText className="mr-2 h-4 w-4" /> PDF
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => handleExport("Planning Global", "Excel")}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Liste des Surveillants */}
                    <Card className="glass-card border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-info" />
                                Planning Surveillants
                            </CardTitle>
                            <CardDescription>
                                Emploi du temps par surveillant
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Nombre de surveillances</li>
                                <li>Chevauchements potentiels</li>
                                <li>Quotas horaires</li>
                            </ul>
                        </CardContent>
                        <CardFooter className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => handleExport("Planning Surveillants", "PDF")}>
                                <FileText className="mr-2 h-4 w-4" /> PDF
                            </Button>
                            <Button variant="outline" className="flex-1" onClick={() => handleExport("Planning Surveillants", "Excel")}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Feuilles d'émargement */}
                    <Card className="glass-card border-none shadow-none">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-warning" />
                                Feuilles d'émargement
                            </CardTitle>
                            <CardDescription>
                                Listes des étudiants par salle
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                <li>Classé par examen</li>
                                <li>Liste alphabétique</li>
                                <li>Colonnes pour signatures</li>
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button variant="gradient" className="w-full" onClick={() => handleExport("Feuilles d'émargement", "ZIP")}>
                                <FileDown className="mr-2 h-4 w-4" /> Tout Télécharger (ZIP)
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </MainLayout>
    );
}
