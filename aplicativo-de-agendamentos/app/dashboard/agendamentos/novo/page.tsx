"use client";

import { useSearchParams } from "next/navigation";
import { AppointmentForm } from "@/components/forms/AppointmentForm";

export default function NovoAgendamentoPage() {
  const searchParams = useSearchParams();
  const date = searchParams.get("date") || undefined;
  const patientId = searchParams.get("patientId") || undefined;
  const doctorId = searchParams.get("doctorId") || undefined;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Novo Agendamento</h1>
        <p className="text-muted-foreground">
          Preencha os dados para criar um novo agendamento
        </p>
      </div>

      <AppointmentForm
        preSelectedDate={date}
        preSelectedPatientId={patientId}
        preSelectedDoctorId={doctorId}
      />
    </div>
  );
}
