"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DoctorForm } from "@/components/forms/DoctorForm";
import { DoctorService } from "@/lib/services/DoctorService";
import { DoctorData, DoctorJSON, DAYS_OF_WEEK } from "@/lib/models/Doctor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ArrowLeft,
  Pencil,
  Mail,
  Phone,
  FileText,
  Clock,
  Stethoscope,
} from "lucide-react";

export default function DoctorDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";

  const [doctor, setDoctor] = useState<DoctorJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDoctor = async () => {
      try {
        const doctorService = DoctorService.getInstance();
        const data = await doctorService.getById(id);
        if (data) {
          setDoctor(data.toJSON());
        } else {
          toast.error("Médico não encontrado");
          router.push("/dashboard/medicos");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctor();
  }, [id, router]);

  const handleUpdate = async (data: DoctorData) => {
    try {
      const doctorService = DoctorService.getInstance();
      await doctorService.update(id, data);
      toast.success("Médico atualizado com sucesso!");
      router.push(`/dashboard/medicos/${id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar médico"
      );
    }
  };

  if (isLoading || !doctor) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Carregando dados do médico...
          </div>
        </div>
      </div>
    );
  }

  if (isEdit) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Editar Médico" />

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => router.push(`/dashboard/medicos/${id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <DoctorForm
              initialData={{
                name: doctor.name,
                email: doctor.email,
                phone: doctor.phone,
                cpf: doctor.cpf,
                crm: doctor.crm,
                specialty: doctor.specialty,
                active: doctor.active,
                availableSlots: doctor.availableSlots,
              }}
              onSubmit={handleUpdate}
              onCancel={() => router.push(`/dashboard/medicos/${id}`)}
              isEdit
            />
          </div>
        </div>
      </div>
    );
  }

  // Agrupar horários por dia
  const slotsByDay = doctor.availableSlots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = [];
    }
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, typeof doctor.availableSlots>);

  return (
    <div className="flex flex-col h-full">
      <Header title="Detalhes do Médico" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={() => router.push(`/dashboard/medicos/${id}?edit=true`)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>

          {/* Info Principal */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{doctor.name}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {doctor.specialty}
                  </p>
                </div>
                <Badge
                  variant={doctor.active ? "default" : "secondary"}
                  className={
                    doctor.active
                      ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : ""
                  }
                >
                  {doctor.active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Stethoscope className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">CRM</p>
                    <p className="font-medium">{doctor.crm}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{doctor.email}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{doctor.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{doctor.cpf}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Horários de Atendimento */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Horários de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Object.keys(slotsByDay).length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum horário de atendimento cadastrado
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(slotsByDay)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([day, slots]) => (
                      <div
                        key={day}
                        className="p-4 rounded-lg border bg-secondary/30"
                      >
                        <p className="font-medium text-foreground mb-2">
                          {DAYS_OF_WEEK[Number(day)]}
                        </p>
                        <div className="space-y-1">
                          {slots.map((slot, idx) => (
                            <p
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {slot.startTime} - {slot.endTime}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
