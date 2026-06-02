import { User } from "./models/User";
import { Patient } from "./models/Patient";
import { Doctor, Specialty, TimeSlot } from "./models/Doctor";
import { Appointment, AppointmentStatus, AppointmentType } from "./models/Appointment";
import { Notification } from "./models/Notification";
import { addDays, setHours, setMinutes, subDays } from "date-fns";

/**
 * Dados de demonstração para popular o sistema
 * Segue o padrão Factory para criar objetos de teste
 */

// Usuários de demonstração
export const demoUsers = [
  new User({
    name: "Administrador",
    email: "admin@clinica.com",
    password: "123456",
    role: "admin",
  }),
  new User({
    name: "Maria Recepcionista",
    email: "maria@clinica.com",
    password: "123456",
    role: "receptionist",
  }),
  new User({
    name: "Dr. João Silva",
    email: "joao@clinica.com",
    password: "123456",
    role: "doctor",
  }),
];

// Médicos de demonstração
const createTimeSlots = (
  days: number[],
  morningStart: string,
  morningEnd: string,
  afternoonStart?: string,
  afternoonEnd?: string
): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  days.forEach((day) => {
    slots.push({ dayOfWeek: day, startTime: morningStart, endTime: morningEnd });
    if (afternoonStart && afternoonEnd) {
      slots.push({
        dayOfWeek: day,
        startTime: afternoonStart,
        endTime: afternoonEnd,
      });
    }
  });
  return slots;
};

export const demoDoctors = [
  new Doctor({
    name: "Dr. Carlos Mendes",
    email: "carlos.mendes@clinica.com",
    phone: "11999001122",
    cpf: "12345678901",
    crm: "CRM/SP 123456",
    specialty: "Cardiologia" as Specialty,
    availableSlots: createTimeSlots([1, 2, 3, 4, 5], "08:00", "12:00", "14:00", "18:00"),
    active: true,
  }),
  new Doctor({
    name: "Dra. Ana Beatriz",
    email: "ana.beatriz@clinica.com",
    phone: "11999002233",
    cpf: "23456789012",
    crm: "CRM/SP 234567",
    specialty: "Dermatologia" as Specialty,
    availableSlots: createTimeSlots([1, 3, 5], "09:00", "13:00", "14:00", "17:00"),
    active: true,
  }),
  new Doctor({
    name: "Dr. Roberto Lima",
    email: "roberto.lima@clinica.com",
    phone: "11999003344",
    cpf: "34567890123",
    crm: "CRM/SP 345678",
    specialty: "Clínico Geral" as Specialty,
    availableSlots: createTimeSlots([1, 2, 3, 4, 5], "07:00", "12:00"),
    active: true,
  }),
];

// Pacientes de demonstração
export const demoPatients = [
  new Patient({
    name: "José da Silva",
    email: "jose.silva@email.com",
    phone: "11988881111",
    cpf: "11122233344",
    birthDate: "1985-03-15",
    address: {
      street: "Rua das Flores",
      number: "123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
    },
    healthInsurance: "Unimed",
  }),
  new Patient({
    name: "Maria Oliveira",
    email: "maria.oliveira@email.com",
    phone: "11988882222",
    cpf: "22233344455",
    birthDate: "1990-07-22",
    address: {
      street: "Av. Paulista",
      number: "1000",
      complement: "Apto 501",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-200",
    },
    healthInsurance: "Bradesco Saúde",
  }),
  new Patient({
    name: "Pedro Santos",
    email: "pedro.santos@email.com",
    phone: "11988883333",
    cpf: "33344455566",
    birthDate: "1978-11-08",
    address: {
      street: "Rua Augusta",
      number: "500",
      neighborhood: "Consolação",
      city: "São Paulo",
      state: "SP",
      zipCode: "01305-000",
    },
  }),
  new Patient({
    name: "Ana Costa",
    email: "ana.costa@email.com",
    phone: "11988884444",
    cpf: "44455566677",
    birthDate: "1995-01-30",
    address: {
      street: "Rua Oscar Freire",
      number: "200",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      zipCode: "01426-000",
    },
    healthInsurance: "SulAmérica",
  }),
  new Patient({
    name: "Lucas Ferreira",
    email: "lucas.ferreira@email.com",
    phone: "11988885555",
    cpf: "55566677788",
    birthDate: "2010-05-12",
    address: {
      street: "Alameda Santos",
      number: "800",
      neighborhood: "Cerqueira César",
      city: "São Paulo",
      state: "SP",
      zipCode: "01418-100",
    },
    healthInsurance: "Amil",
    notes: "Paciente pediátrico - acompanhado pela mãe",
  }),
];

// Função para criar agendamentos de demonstração
export const createDemoAppointments = (
  patients: Patient[],
  doctors: Doctor[]
): Appointment[] => {
  const now = new Date();
  const appointments: Appointment[] = [];

  // Consultas passadas (concluídas)
  appointments.push(
    new Appointment({
      patientId: patients[0].id,
      doctorId: doctors[0].id,
      dateTime: setMinutes(setHours(subDays(now, 7), 9), 0).toISOString(),
      duration: 30,
      status: "completed" as AppointmentStatus,
      type: "consultation" as AppointmentType,
      patientName: patients[0].name,
      doctorName: doctors[0].name,
      notes: "Consulta de rotina - pressão arterial normal",
    })
  );

  appointments.push(
    new Appointment({
      patientId: patients[1].id,
      doctorId: doctors[1].id,
      dateTime: setMinutes(setHours(subDays(now, 3), 10), 30).toISOString(),
      duration: 30,
      status: "completed" as AppointmentStatus,
      type: "consultation" as AppointmentType,
      patientName: patients[1].name,
      doctorName: doctors[1].name,
    })
  );

  // Consultas de hoje
  appointments.push(
    new Appointment({
      patientId: patients[2].id,
      doctorId: doctors[2].id,
      dateTime: setMinutes(setHours(now, 10), 0).toISOString(),
      duration: 30,
      status: "confirmed" as AppointmentStatus,
      type: "consultation" as AppointmentType,
      patientName: patients[2].name,
      doctorName: doctors[2].name,
    })
  );

  appointments.push(
    new Appointment({
      patientId: patients[3].id,
      doctorId: doctors[0].id,
      dateTime: setMinutes(setHours(now, 14), 30).toISOString(),
      duration: 30,
      status: "scheduled" as AppointmentStatus,
      type: "return" as AppointmentType,
      patientName: patients[3].name,
      doctorName: doctors[0].name,
    })
  );

  // Consultas futuras
  appointments.push(
    new Appointment({
      patientId: patients[4].id,
      doctorId: doctors[2].id,
      dateTime: setMinutes(setHours(addDays(now, 1), 9), 0).toISOString(),
      duration: 30,
      status: "scheduled" as AppointmentStatus,
      type: "consultation" as AppointmentType,
      patientName: patients[4].name,
      doctorName: doctors[2].name,
    })
  );

  appointments.push(
    new Appointment({
      patientId: patients[0].id,
      doctorId: doctors[1].id,
      dateTime: setMinutes(setHours(addDays(now, 2), 11), 0).toISOString(),
      duration: 30,
      status: "scheduled" as AppointmentStatus,
      type: "exam" as AppointmentType,
      patientName: patients[0].name,
      doctorName: doctors[1].name,
    })
  );

  appointments.push(
    new Appointment({
      patientId: patients[1].id,
      doctorId: doctors[0].id,
      dateTime: setMinutes(setHours(addDays(now, 3), 15), 0).toISOString(),
      duration: 30,
      status: "confirmed" as AppointmentStatus,
      type: "return" as AppointmentType,
      patientName: patients[1].name,
      doctorName: doctors[0].name,
    })
  );

  appointments.push(
    new Appointment({
      patientId: patients[2].id,
      doctorId: doctors[1].id,
      dateTime: setMinutes(setHours(addDays(now, 5), 10), 0).toISOString(),
      duration: 45,
      status: "scheduled" as AppointmentStatus,
      type: "procedure" as AppointmentType,
      patientName: patients[2].name,
      doctorName: doctors[1].name,
    })
  );

  return appointments;
};

// Notificações de demonstração
export const createDemoNotifications = (
  appointments: Appointment[]
): Notification[] => {
  const notifications: Notification[] = [];

  // Notificação de boas-vindas
  notifications.push(
    Notification.createSystemAlert(
      "Bem-vindo ao Sistema",
      "Sistema de agendamentos da clínica configurado com sucesso!"
    )
  );

  // Lembretes para consultas de hoje
  const todayAppointments = appointments.filter((a) => a.isToday());
  todayAppointments.forEach((a) => {
    notifications.push(
      Notification.createAppointmentReminder(
        a.id,
        a.patientName || "Paciente",
        a.doctorName || "Médico",
        a.dateTime
      )
    );
  });

  return notifications;
};

// Função para inicializar dados de demonstração
export const initializeDemoData = (): void => {
  if (typeof window === "undefined") return;

  // Verificar se já foi inicializado
  const initialized = localStorage.getItem("clinic_demo_initialized");
  if (initialized) return;

  // Salvar usuários
  localStorage.setItem(
    "clinic_users",
    JSON.stringify(demoUsers.map((u) => u.toJSON()))
  );

  // Salvar médicos
  localStorage.setItem(
    "clinic_doctors",
    JSON.stringify(demoDoctors.map((d) => d.toJSON()))
  );

  // Salvar pacientes
  localStorage.setItem(
    "clinic_patients",
    JSON.stringify(demoPatients.map((p) => p.toJSON()))
  );

  // Criar e salvar agendamentos
  const appointments = createDemoAppointments(demoPatients, demoDoctors);
  localStorage.setItem(
    "clinic_appointments",
    JSON.stringify(appointments.map((a) => a.toJSON()))
  );

  // Criar e salvar notificações
  const notifications = createDemoNotifications(appointments);
  localStorage.setItem(
    "clinic_notifications",
    JSON.stringify(notifications.map((n) => n.toJSON()))
  );

  // Marcar como inicializado
  localStorage.setItem("clinic_demo_initialized", "true");
};
