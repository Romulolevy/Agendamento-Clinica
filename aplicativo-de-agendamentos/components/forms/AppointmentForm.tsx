"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Appointment,
  AppointmentStatus,
  AppointmentType,
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_TYPE_LABELS,
} from "@/lib/models/Appointment";
import { Patient } from "@/lib/models/Patient";
import { Doctor } from "@/lib/models/Doctor";
import { AppointmentService } from "@/lib/services/AppointmentService";
import { PatientService } from "@/lib/services/PatientService";
import { DoctorService } from "@/lib/services/DoctorService";
import { format } from "date-fns";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface AppointmentFormProps {
  appointment?: Appointment;
  preSelectedPatientId?: string;
  preSelectedDoctorId?: string;
  preSelectedDate?: string;
  preSelectedTime?: string;
}

export function AppointmentForm({
  appointment,
  preSelectedPatientId,
  preSelectedDoctorId,
  preSelectedDate,
  preSelectedTime,
}: AppointmentFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    patientId: preSelectedPatientId || appointment?.patientId || "",
    doctorId: preSelectedDoctorId || appointment?.doctorId || "",
    date: preSelectedDate || (appointment ? format(appointment.dateTime, "yyyy-MM-dd") : ""),
    time: preSelectedTime || (appointment ? format(appointment.dateTime, "HH:mm") : ""),
    duration: appointment?.duration.toString() || "30",
    type: appointment?.type || ("consultation" as AppointmentType),
    notes: appointment?.notes || "",
    status: appointment?.status || ("scheduled" as AppointmentStatus),
  });

  useEffect(() => {
    const patientService = PatientService.getInstance();
    const doctorService = DoctorService.getInstance();
    setPatients(patientService.getAll());
    setDoctors(doctorService.getAll());
  }, []);

  useEffect(() => {
    if (formData.doctorId && formData.date) {
      const appointmentService = AppointmentService.getInstance();
      const slots = appointmentService.getAvailableSlots(
        formData.doctorId,
        new Date(formData.date)
      );
      setAvailableSlots(slots);
    }
  }, [formData.doctorId, formData.date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const appointmentService = AppointmentService.getInstance();
      const dateTime = `${formData.date}T${formData.time}:00`;

      if (appointment) {
        appointment.update({
          dateTime,
          duration: parseInt(formData.duration),
          type: formData.type as AppointmentType,
          notes: formData.notes,
          status: formData.status as AppointmentStatus,
        });
        appointmentService.update(appointment);
        toast.success("Agendamento atualizado com sucesso!");
      } else {
        const newAppointment = new Appointment({
          patientId: formData.patientId,
          doctorId: formData.doctorId,
          dateTime,
          duration: parseInt(formData.duration),
          type: formData.type as AppointmentType,
          notes: formData.notes,
        });
        appointmentService.create(newAppointment);
        toast.success("Agendamento criado com sucesso!");
      }

      router.push("/dashboard/agendamentos");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar agendamento");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDoctor = doctors.find(d => d.id === formData.doctorId);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Dados do Agendamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="patientId">Paciente *</Label>
              <Select
                value={formData.patientId}
                onValueChange={(value) => setFormData({ ...formData, patientId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.fullName} - {patient.cpf}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doctorId">Médico *</Label>
              <Select
                value={formData.doctorId}
                onValueChange={(value) => setFormData({ ...formData, doctorId: value, time: "" })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr(a). {doctor.fullName} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedDoctor && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p className="font-medium">Informações do Médico:</p>
              <p>Especialidade: {selectedDoctor.specialty}</p>
              <p>Valor da consulta: R$ {selectedDoctor.consultationFee.toFixed(2)}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value, time: "" })}
                min={format(new Date(), "yyyy-MM-dd")}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Horário *</Label>
              <Select
                value={formData.time}
                onValueChange={(value) => setFormData({ ...formData, time: value })}
                disabled={!formData.doctorId || !formData.date}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {availableSlots.length > 0 ? (
                    availableSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Nenhum horário disponível
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Select
                value={formData.duration}
                onValueChange={(value) => setFormData({ ...formData, duration: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1h30</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Atendimento</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as AppointmentType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {appointment && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value as AppointmentStatus })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Observações sobre o agendamento..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {appointment ? "Atualizar" : "Criar"} Agendamento
        </Button>
      </div>
    </form>
  );
}
