import { MainLayout } from "@/components/layout/MainLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AvailabilityChart } from "@/components/dashboard/AvailabilityChart";
import { UpcomingExams } from "@/components/dashboard/UpcomingExams";
import { ProfessorLoad } from "@/components/dashboard/ProfessorLoad";
import { RoomHeatmap } from "@/components/dashboard/RoomHeatmap";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Calendar, Users, Building2, ClipboardList, TrendingUp, AlertTriangle } from "lucide-react";
export default function Index() {
  return <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground">
            Tableau de Bord
          </h1>
          <p className="mt-1 text-muted-foreground">
            Bienvenue sur GSEA Scheduler - Gestion des examens et surveillances
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard title="Examens cette semaine" value={12} subtitle="4 en attente de validation" icon={Calendar} variant="primary" trend={{
          value: 15,
          isPositive: true
        }} />
          <StatCard title="Professeurs actifs" value={24} subtitle="6 en surcharge" icon={Users} variant="info" />
          <StatCard title="Salles disponibles" value="18/25" subtitle="72% de disponibilité" icon={Building2} variant="success" />
          <StatCard title="Surveillances assignées" value={48} subtitle="3 conflits détectés" icon={ClipboardList} variant="warning" />
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          <div className="lg:col-span-2">
            
          </div>
          <QuickActions />
        </div>

        {/* Secondary Grid */}
        <div className="grid gap-6 lg:grid-cols-2 mb-8">
          <UpcomingExams />
          <ProfessorLoad />
        </div>

        {/* Tertiary Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <RoomHeatmap />
          <RecentActivity />
        </div>
      </div>
    </MainLayout>;
}