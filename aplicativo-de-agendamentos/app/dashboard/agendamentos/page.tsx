"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { AppointmentCalendar } from "@/components/calendar/AppointmentCalendar";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  List,
  Eye,
  Pencil,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function AgendamentosPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

  const loadData = () => {
    const appointmentService = AppointmentService.getInstance();
    const doctorService = DoctorService.getInstance();
    const patientService = PatientService.getInstance();

    setAppointments(appointmentService.getAll());
    setDoctors(doctorService.getAll());
    setPatients(patientService.getAll());
  };

  useEffect(() => {
    loadData();
  }, []);

  const getDoctorName = (doctorId: string) => {
    const doctor = doctors.find((d) => d.getId() === doctorId);
    return doctor ? `Dr(a). ${doctor.getFullName()}` : "-";
  };

  const getPatientName = (patientId: string) => {
    const patient = patients.find((p) => p.getId() === patientId);
    return patient ? patient.getFullName() : "-";
  };

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

  const filteredAppointments = appointments.filter((appointment) => {
    const patientName = getPatientName(appointment.getPatientId()).toLowerCase();
    const doctorName = getDoctorName(appointment.getDoctorId()).toLowerCase();
    const search = searchTerm.toLowerCase();

    return patientName.includes(search) || doctorName.includes(search);
  });

  const handleDelete = () => {
    if (deleteId) {
      const appointmentService = AppointmentService.getInstance();
      appointmentService.delete(deleteId);
      loadData();
      toast.success("Agendamento excluído com sucesso!");
      setDeleteId(null);
    }
  };

  const handleConfirm = (appointment: Appointment) => {
    const appointmentService = AppointmentService.getInstance();
    appointment.confirm();
    appointmentService.update(appointment);
    loadData();
    toast.success("Agendamento confirmado!");
  };

  const handleCancel = (appointment: Appointment) => {
    const appointmentService = AppointmentService.getInstance();
    appointment.cancel("Cancelado pelo usuário");
    appointmentService.update(appointment);
    loadData();
    toast.success("Agendamento cancelado!");
  };

  const handleSelectAppointment = (appointment: Appointment) => {
    router.push(`/dashboard/agendamentos/${appointment.getId()}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Agendamentos</h1>
          <p className="text-muted-foreground">
            Gerencie os agendamentos da clínica
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/agendamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por paciente ou médico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "calendar" | "list")}>
          <TabsList>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              Calendário
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Lista
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "calendar" ? (
        <AppointmentCalendar onSelectAppointment={handleSelectAppointment} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Médico</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum agendamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAppointments
                    .sort((a, b) => b.getDateTime().getTime() - a.getDateTime().getTime())
                    .map((appointment) => (
                      <TableRow key={appointment.getId()}>
                        <TableCell>
                          <div className="font-medium">
                            {format(appointment.getDateTime(), "dd/MM/yyyy")}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(appointment.getDateTime(), "HH:mm")} -{" "}
                            {appointment.getDuration()} min
                          </div>
                        </TableCell>
                        <TableCell>{getPatientName(appointment.getPatientId())}</TableCell>
                        <TableCell>{getDoctorName(appointment.getDoctorId())}</TableCell>
                        <TableCell className="capitalize">{appointment.getType()}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getStatusColor(appointment.getStatus())}
                          >
                            {getStatusLabel(appointment.getStatus())}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/agendamentos/${appointment.getId()}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  Visualizar
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/agendamentos/${appointment.getId()}/editar`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </Link>
                              </DropdownMenuItem>
                              {appointment.getStatus() === AppointmentStatus.SCHEDULED && (
                                <>
                                  <DropdownMenuItem onClick={() => handleConfirm(appointment)}>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Confirmar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleCancel(appointment)}>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancelar
                                  </DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(appointment.getId())}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este agendamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
