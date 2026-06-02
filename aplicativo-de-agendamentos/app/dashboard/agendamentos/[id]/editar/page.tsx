"use client";

import { useState, useEffect, use } from "react";
import { Appointment } from "@/lib/models/Appointment";
import { AppointmentService } from "@/lib/services/AppointmentService";
import { AppointmentForm } from "@/components/forms/AppointmentForm";

export default function EditarAgendamentoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [appointment, setAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const appointmentService = AppointmentService.getInstance();
    const foundAppointment = appointmentService.getById(id);
    if (foundAppointment) {
      setAppointment(foundAppointment);
    }
  }, [id]);

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Agendamento não encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Editar Agendamento</h1>
        <p className="text-muted-foreground">
          Atualize os dados do agendamento
        </p>
      </div>

      <AppointmentForm appointment={appointment} />
    </div>
  );
}
