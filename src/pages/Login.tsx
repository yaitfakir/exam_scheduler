import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            navigate("/");
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erreur de connexion",
                description: error.message || "Impossible de se connecter",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSignUp = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email,
                password
            });
            if (error) throw error;
            toast({
                title: "Inscription réussie",
                description: "Veuillez vérifier vos emails pour confirmer votre compte.",
            });
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Erreur d'inscription",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl text-center">Connexion</CardTitle>
                    <CardDescription className="text-center">
                        Accédez à votre espace de gestion
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="nom@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Chargement..." : "Se connecter"}
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={handleSignUp} disabled={loading}>
                            S'inscrire
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
