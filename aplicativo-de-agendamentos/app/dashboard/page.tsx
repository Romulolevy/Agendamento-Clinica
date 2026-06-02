"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { StatsCard } from "@/components/cards/StatsCard";
import { AppointmentCard } from "@/components/cards/AppointmentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/contexts/AuthContext";
import { AppointmentService } from "@/lib/services/AppointmentService";
import { PatientService } from "@/lib/services/PatientService";
import { DoctorService } from "@/lib/services/DoctorService";
import { AppointmentJSON } from "@/lib/models/Appointment";
import {
  Users,
  UserCog,
  CalendarDays,
  CalendarCheck,
  Plus,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<AppointmentJSON[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentJSON[]>([]);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    todayCount: 0,
    monthCount: 0,
    weeklyData: [] as { day: string; count: number }[],
  });

  useEffect(() => {
    const loadData = async () => {
      const appointmentService = AppointmentService.getInstance();
      const patientService = PatientService.getInstance();
      const doctorService = DoctorService.getInstance();

      // Carregar estatísticas
      const [patientStats, doctorStats, appointmentStats] = await Promise.all([
        patientService.getStatistics(),
        doctorService.getStatistics(),
        appointmentService.getStatistics(),
      ]);

      // Dados semanais para o gráfico
      const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      const weeklyData = days.map((day, index) => ({
        day,
        count: appointmentStats.byDayOfWeek[index] || 0,
      }));

      setStats({
        totalPatients: patientStats.total,
        totalDoctors: doctorStats.active,
        todayCount: appointmentStats.today,
        monthCount: appointmentStats.thisMonth,
        weeklyData,
      });

      // Carregar agendamentos
      const today = await appointmentService.getToday();
      const upcoming = await appointmentService.getUpcoming(5);

      setTodayAppointments(today.map((a) => a.toJSON()));
      setUpcomingAppointments(upcoming.map((a) => a.toJSON()));
    };

    loadData();
  }, []);

  return (
    <div className="flex flex-col h-full">
      <Header title={`Olá, ${user?.name?.split(" ")[0] || "Usuário"}`} />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total de Pacientes"
            value={stats.totalPatients}
            icon={Users}
            variant="primary"
          />
          <StatsCard
            title="Médicos Ativos"
            value={stats.totalDoctors}
            icon={UserCog}
            variant="success"
          />
          <StatsCard
            title="Consultas Hoje"
            value={stats.todayCount}
            icon={CalendarDays}
            variant="warning"
          />
          <StatsCard
            title="Consultas no Mês"
            value={stats.monthCount}
            icon={CalendarCheck}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Consultas por Dia da Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      className="text-muted-foreground"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="count"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                      name="Consultas"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Today's Appointments */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base font-semibold">
                Consultas de Hoje
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard/agendamentos")}
              >
                Ver todas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {todayAppointments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhuma consulta agendada para hoje
                </p>
              ) : (
                todayAppointments.slice(0, 4).map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    compact
                    onClick={() =>
                      router.push(`/dashboard/agendamentos?id=${appointment.id}`)
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base font-semibold">
              Próximos Agendamentos
            </CardTitle>
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/dashboard/agendamentos/novo")}
            >
              <Plus className="w-4 h-4 mr-1" />
              Novo Agendamento
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum agendamento próximo
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onClick={() =>
                      router.push(`/dashboard/agendamentos?id=${appointment.id}`)
                    }
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
