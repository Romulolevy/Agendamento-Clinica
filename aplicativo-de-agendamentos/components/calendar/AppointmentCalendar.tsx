"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Appointment, AppointmentStatus } from "@/lib/models/Appointment";
import { Doctor } from "@/lib/models/Doctor";
import { Patient } from "@/lib/models/Patient";
import { AppointmentService } from "@/lib/services/AppointmentService";
import { DoctorService } from "@/lib/services/DoctorService";
import { PatientService } from "@/lib/services/PatientService";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import Link from "next/link";

interface AppointmentCalendarProps {
  onSelectDate?: (date: Date) => void;
  onSelectAppointment?: (appointment: Appointment) => void;
}

export function AppointmentCalendar({
  onSelectDate,
  onSelectAppointment,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("all");

  useEffect(() => {
    const appointmentService = AppointmentService.getInstance();
    const doctorService = DoctorService.getInstance();
    const patientService = PatientService.getInstance();

    setAppointments(appointmentService.getAll());
    setDoctors(doctorService.getAll());
    setPatients(patientService.getAll());
  }, []);

  const filteredAppointments = useMemo(() => {
    if (selectedDoctorId === "all") return appointments;
    return appointments.filter((a) => a.getDoctorId() === selectedDoctorId);
  }, [appointments, selectedDoctorId]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getAppointmentsForDate = (date: Date) => {
    return filteredAppointments.filter((appointment) =>
      isSameDay(appointment.getDateTime(), date)
    );
  };

  const selectedDateAppointments = selectedDate
    ? getAppointmentsForDate(selectedDate)
    : [];

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.getId() === doctorId);
    return doctor ? `Dr(a). ${doctor.getFullName()}` : "Médico não encontrado";
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.getId() === patientId);
    return patient ? patient.getFullName() : "Paciente não encontrado";
  };

  const getStatusColor = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.SCHEDULED]: "bg-blue-100 text-blue-800 border-blue-200",
      [AppointmentStatus.CONFIRMED]: "bg-green-100 text-green-800 border-green-200",
      [AppointmentStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800 border-yellow-200",
      [AppointmentStatus.COMPLETED]: "bg-gray-100 text-gray-800 border-gray-200",
      [AppointmentStatus.CANCELLED]: "bg-red-100 text-red-800 border-red-200",
      [AppointmentStatus.NO_SHOW]: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return colors[status];
  };

  const getStatusLabel = (status: AppointmentStatus) => {
    const labels: Record<AppointmentStatus, string> = {
      [AppointmentStatus.SCHEDULED]: "Agendado",
      [AppointmentStatus.CONFIRMED]: "Confirmado",
      [AppointmentStatus.IN_PROGRESS]: "Em Atendimento",
      [AppointmentStatus.COMPLETED]: "Concluído",
      [AppointmentStatus.CANCELLED]: "Cancelado",
      [AppointmentStatus.NO_SHOW]: "Não Compareceu",
    };
    return labels[status];
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onSelectDate?.(date);
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <CardTitle className="text-lg font-medium capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </CardTitle>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por médico" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os médicos</SelectItem>
              {doctors.map((doctor) => (
                <SelectItem key={doctor.getId()} value={doctor.getId()}>
                  Dr(a). {doctor.getFullName()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div
                key={day}
                className="h-10 flex items-center justify-center text-sm font-medium text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {days.map((day, index) => {
              const dayAppointments = getAppointmentsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isDayToday = isToday(day);

              return (
                <button
                  key={index}
                  onClick={() => handleDateClick(day)}
                  className={`
                    min-h-[80px] p-1 border rounded-lg text-left transition-colors
                    ${!isCurrentMonth ? "bg-muted/30 text-muted-foreground" : "bg-card"}
                    ${isSelected ? "border-primary ring-2 ring-primary/20" : "border-border"}
                    ${isDayToday ? "bg-primary/5" : ""}
                    hover:border-primary/50
                  `}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`
                        text-sm font-medium w-6 h-6 flex items-center justify-center rounded-full
                        ${isDayToday ? "bg-primary text-primary-foreground" : ""}
                      `}
                    >
                      {format(day, "d")}
                    </span>
                    {dayAppointments.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {dayAppointments.length}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-0.5">
                    {dayAppointments.slice(0, 2).map((apt) => (
                      <div
                        key={apt.getId()}
                        className={`text-xs p-1 rounded truncate ${getStatusColor(apt.getStatus())}`}
                      >
                        {format(apt.getDateTime(), "HH:mm")}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-xs text-muted-foreground text-center">
                        +{dayAppointments.length - 2} mais
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-medium">
            {selectedDate
              ? format(selectedDate, "dd 'de' MMMM", { locale: ptBR })
              : "Selecione uma data"}
          </CardTitle>
          {selectedDate && (
            <Button size="sm" asChild>
              <Link
                href={`/dashboard/agendamentos/novo?date=${format(selectedDate, "yyyy-MM-dd")}`}
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {selectedDateAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum agendamento para esta data
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDateAppointments
                .sort((a, b) => a.getDateTime().getTime() - b.getDateTime().getTime())
                .map((appointment) => (
                  <button
                    key={appointment.getId()}
                    onClick={() => onSelectAppointment?.(appointment)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">
                          {format(appointment.getDateTime(), "HH:mm")}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={getStatusColor(appointment.getStatus())}
                      >
                        {getStatusLabel(appointment.getStatus())}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{getPatientName(appointment.getPatientId())}</span>
                      </div>
                      <p className="text-muted-foreground">
                        {getDoctorName(appointment.getDoctorId())}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {appointment.getType()} - {appointment.getDuration()} min
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
