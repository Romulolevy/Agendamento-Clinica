import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AppointmentJSON, APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from "@/lib/models/Appointment";
import { Clock, User, Stethoscope } from "lucide-react";

interface AppointmentCardProps {
  appointment: AppointmentJSON;
  onClick?: () => void;
  compact?: boolean;
}

export function AppointmentCard({ appointment, onClick, compact = false }: AppointmentCardProps) {
  const statusColors = {
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    completed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
  };

  const dateTime = new Date(appointment.dateTime);

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-center gap-3 p-3 rounded-lg border border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors",
          onClick && "cursor-pointer"
        )}
        onClick={onClick}
      >
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary">
          <span className="text-lg font-bold leading-none">
            {format(dateTime, "dd")}
          </span>
          <span className="text-xs uppercase">
            {format(dateTime, "MMM", { locale: ptBR })}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-foreground truncate">
            {appointment.patientName}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {appointment.doctorName} - {format(dateTime, "HH:mm")}
          </p>
        </div>

        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium shrink-0",
            statusColors[appointment.status]
          )}
        >
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border bg-card transition-shadow hover:shadow-md",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-semibold text-foreground">{appointment.patientName}</p>
          <p className="text-sm text-muted-foreground">
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </p>
        </div>
        <span
          className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium",
            statusColors[appointment.status]
          )}
        >
          {APPOINTMENT_STATUS_LABELS[appointment.status]}
        </span>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Stethoscope className="w-4 h-4" />
          <span>{appointment.doctorName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>
            {format(dateTime, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
        </div>
        {appointment.notes && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <User className="w-4 h-4 mt-0.5" />
            <span className="line-clamp-2">{appointment.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}
