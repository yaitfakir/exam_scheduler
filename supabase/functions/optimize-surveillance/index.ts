import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface Professor {
  id: number;
  first_name: string;
  last_name: string;
  department: string;
  currentLoad: number;
  maxLoad: number;
  availability: string[];
}

interface Surveillance {
  id: number;
  exam: string;
  date: string;
  time: string;
  room: string;
  students: number;
  professors: { name: string; role: string; load: number }[];
  status: string;
  conflictMessage?: string;
}

interface OptimizationRequest {
  surveillances: Surveillance[];
  professors: Professor[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { surveillances, professors }: OptimizationRequest = await req.json();

    console.log("Received optimization request:", {
      surveillanceCount: surveillances?.length,
      professorCount: professors?.length,
    });

    const systemPrompt = `Tu es un assistant IA spécialisé dans l'optimisation des affectations de surveillance d'examens pour une école d'ingénieurs.

Ton rôle est d'analyser les surveillances et les professeurs disponibles, puis de proposer une répartition optimale qui:
1. Équilibre la charge de travail entre les professeurs
2. Évite les conflits d'horaires
3. Respecte les disponibilités des professeurs
4. Assigne un surveillant principal et un adjoint pour les grandes salles (>50 étudiants)

Tu dois répondre UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "assignments": [
    {
      "surveillanceId": number,
      "exam": string,
      "assignedProfessors": [
        { "professorId": number, "name": string, "role": "Principal" | "Adjoint" }
      ],
      "reason": string
    }
  ],
  "conflicts": [
    {
      "surveillanceId": number,
      "issue": string,
      "suggestion": string
    }
  ],
  "summary": {
    "totalAssigned": number,
    "totalConflicts": number,
    "averageLoad": number,
    "recommendation": string
  }
}`;

    const userPrompt = `Voici les données à optimiser:

SURVEILLANCES À AFFECTER:
${JSON.stringify(surveillances, null, 2)}

PROFESSEURS DISPONIBLES:
${JSON.stringify(professors, null, 2)}

Analyse ces données et propose une affectation optimale des surveillants. Prends en compte la charge actuelle de chaque professeur et assure-toi de répartir équitablement les surveillances.`;

    console.log("Calling Lovable AI gateway...");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.3,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error:
              "Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Crédits insuffisants. Veuillez recharger votre compte.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const aiContent = data.choices?.[0]?.message?.content;

    if (!aiContent) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let optimizationResult;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        optimizationResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", aiContent);
      // Return a fallback response
      optimizationResult = {
        assignments: [],
        conflicts: [],
        summary: {
          totalAssigned: 0,
          totalConflicts: 0,
          averageLoad: 0,
          recommendation:
            "L'IA n'a pas pu analyser les données. Veuillez réessayer.",
        },
        rawResponse: aiContent,
      };
    }

    console.log("Optimization result:", optimizationResult);

    return new Response(JSON.stringify(optimizationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in optimize-surveillance function:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Une erreur est survenue",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
