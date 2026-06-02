"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Appointment, AppointmentStatus } from "@/lib/models/Appointment";
import { Doctor } from "@/lib/models/Doctor";
import { Patient } from "@/lib/models/Patient";
import { AppointmentService } from "@/lib/services/AppointmentService";
import { DoctorService } from "@/lib/services/DoctorService";
import { PatientService } from "@/lib/services/PatientService";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FileText,
  CheckCircle,
  XCircle,
  Play,
} from "lucide-react";
import Link from "next/link";

export default function AgendamentoDetalhesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    const appointmentService = AppointmentService.getInstance();
    const doctorService = DoctorService.getInstance();
    const patientService = PatientService.getInstance();

    const foundAppointment = appointmentService.getById(id);
    if (foundAppointment) {
      setAppointment(foundAppointment);
      setDoctor(doctorService.getById(foundAppointment.getDoctorId()) || null);
      setPatient(patientService.getById(foundAppointment.getPatientId()) || null);
    }
  }, [id]);

  const getStatusColor = (status: AppointmentStatus) => {
    const colors: Record<AppointmentStatus, string> = {
      [AppointmentStatus.SCHEDULED]: "bg-blue-100 text-blue-800",
      [AppointmentStatus.CONFIRMED]: "bg-green-100 text-green-800",
      [AppointmentStatus.IN_PROGRESS]: "bg-yellow-100 text-yellow-800",
      [AppointmentStatus.COMPLETED]: "bg-gray-100 text-gray-800",
      [AppointmentStatus.CANCELLED]: "bg-red-100 text-red-800",
      [AppointmentStatus.NO_SHOW]: "bg-orange-100 text-orange-800",
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

  const handleDelete = () => {
    if (appointment) {
      const appointmentService = AppointmentService.getInstance();
      appointmentService.delete(appointment.getId());
      toast.success("Agendamento excluído com sucesso!");
      router.push("/dashboard/agendamentos");
    }
  };

  const handleStatusChange = (newStatus: AppointmentStatus) => {
    if (appointment) {
      const appointmentService = AppointmentService.getInstance();

      switch (newStatus) {
        case AppointmentStatus.CONFIRMED:
          appointment.confirm();
          break;
        case AppointmentStatus.IN_PROGRESS:
          appointment.startService();
          break;
        case AppointmentStatus.COMPLETED:
          appointment.complete();
          break;
        case AppointmentStatus.CANCELLED:
          appointment.cancel("Cancelado pelo usuário");
          break;
        case AppointmentStatus.NO_SHOW:
          appointment.markNoShow();
          break;
      }

      appointmentService.update(appointment);
      setAppointment({ ...appointment } as unknown as Appointment);
      toast.success("Status atualizado com sucesso!");
    }
  };

  if (!appointment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Agendamento não encontrado</p>
      </div>
    );
  }

  const status = appointment.getStatus();
  const canConfirm = status === AppointmentStatus.SCHEDULED;
  const canStart = status === AppointmentStatus.CONFIRMED;
  const canComplete = status === AppointmentStatus.IN_PROGRESS;
  const canCancel = [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/agendamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">
              Detalhes do Agendamento
            </h1>
            <p className="text-muted-foreground">
              {format(appointment.getDateTime(), "EEEE, dd 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/agendamentos/${id}/editar`}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Informações do Agendamento</CardTitle>
                <Badge variant="outline" className={getStatusColor(status)}>
                  {getStatusLabel(status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data</p>
                    <p className="font-medium">
                      {format(appointment.getDateTime(), "dd/MM/yyyy")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Horário</p>
                    <p className="font-medium">
                      {format(appointment.getDateTime(), "HH:mm")} -{" "}
                      {appointment.getDuration()} minutos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize">{appointment.getType()}</p>
                  </div>
                </div>

                {doctor && (
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Valor</p>
                      <p className="font-medium">
                        R$ {doctor.getConsultationFee().toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {appointment.getNotes() && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Observações</p>
                  <p className="text-sm">{appointment.getNotes()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {patient && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{patient.getFullName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{patient.getCpf()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{patient.getPhone()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{patient.getEmail()}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/pacientes/${patient.getId()}`}>
                      Ver perfil completo
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {doctor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Médico
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">Dr(a). {doctor.getFullName()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">CRM</p>
                    <p className="font-medium">{doctor.getCrm()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Especialidade</p>
                    <p className="font-medium">{doctor.getSpecialty()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{doctor.getPhone()}</p>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link href={`/dashboard/medicos/${doctor.getId()}`}>
                      Ver perfil completo
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canConfirm && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange(AppointmentStatus.CONFIRMED)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirmar Agendamento
                </Button>
              )}
              {canStart && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange(AppointmentStatus.IN_PROGRESS)}
                >
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar Atendimento
                </Button>
              )}
              {canComplete && (
                <Button
                  className="w-full"
                  onClick={() => handleStatusChange(AppointmentStatus.COMPLETED)}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Finalizar Atendimento
                </Button>
              )}
              {canCancel && (
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleStatusChange(AppointmentStatus.CANCELLED)}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancelar Agendamento
                </Button>
              )}
              {(status === AppointmentStatus.COMPLETED ||
                status === AppointmentStatus.CANCELLED ||
                status === AppointmentStatus.NO_SHOW) && (
                <p className="text-sm text-muted-foreground text-center">
                  Este agendamento já foi finalizado
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criado em</span>
                  <span>{format(appointment.getCreatedAt(), "dd/MM/yyyy HH:mm")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atualizado em</span>
                  <span>{format(appointment.getUpdatedAt(), "dd/MM/yyyy HH:mm")}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
