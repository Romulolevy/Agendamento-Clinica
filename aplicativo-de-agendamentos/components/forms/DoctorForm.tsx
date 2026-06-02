"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DoctorData, SPECIALTIES, Specialty, TimeSlot, DAYS_OF_WEEK } from "@/lib/models/Doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Plus, Trash2 } from "lucide-react";

const timeSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().min(1, "Horário inicial obrigatório"),
  endTime: z.string().min(1, "Horário final obrigatório"),
});

const doctorSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  crm: z.string().min(4, "CRM inválido"),
  specialty: z.string().min(1, "Especialidade é obrigatória"),
  active: z.boolean(),
  availableSlots: z.array(timeSlotSchema),
});

type DoctorFormData = z.infer<typeof doctorSchema>;

interface DoctorFormProps {
  initialData?: Partial<DoctorData>;
  onSubmit: (data: DoctorData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function DoctorForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: DoctorFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm<DoctorFormData>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      cpf: initialData?.cpf || "",
      crm: initialData?.crm || "",
      specialty: initialData?.specialty || "",
      active: initialData?.active ?? true,
      availableSlots: initialData?.availableSlots || [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "availableSlots",
  });

  const watchActive = watch("active");
  const watchSpecialty = watch("specialty");

  const handleFormSubmit = async (data: DoctorFormData) => {
    setIsLoading(true);
    try {
      await onSubmit({
        ...data,
        specialty: data.specialty as Specialty,
      } as DoctorData);
    } finally {
      setIsLoading(false);
    }
  };

  const addTimeSlot = () => {
    append({
      dayOfWeek: 1,
      startTime: "08:00",
      endTime: "12:00",
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Dados Pessoais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados Pessoais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="name">Nome Completo *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Nome do médico"
              disabled={isLoading}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cpf">CPF *</Label>
            <Input
              id="cpf"
              {...register("cpf")}
              placeholder="000.000.000-00"
              disabled={isLoading || isEdit}
            />
            {errors.cpf && (
              <p className="text-sm text-destructive">{errors.cpf.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="crm">CRM *</Label>
            <Input
              id="crm"
              {...register("crm")}
              placeholder="CRM/SP 123456"
              disabled={isLoading}
            />
            {errors.crm && (
              <p className="text-sm text-destructive">{errors.crm.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              placeholder="email@exemplo.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone *</Label>
            <Input
              id="phone"
              {...register("phone")}
              placeholder="(11) 99999-9999"
              disabled={isLoading}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidade *</Label>
            <Select
              value={watchSpecialty}
              onValueChange={(value) => setValue("specialty", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma especialidade" />
              </SelectTrigger>
              <SelectContent>
                {SPECIALTIES.map((spec) => (
                  <SelectItem key={spec} value={spec}>
                    {spec}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.specialty && (
              <p className="text-sm text-destructive">
                {errors.specialty.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="active"
              checked={watchActive}
              onCheckedChange={(checked) => setValue("active", checked)}
              disabled={isLoading}
            />
            <Label htmlFor="active">Médico ativo</Label>
          </div>
        </CardContent>
      </Card>

      {/* Horários de Atendimento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Horários de Atendimento</CardTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addTimeSlot}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Horário
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum horário cadastrado. Clique em &quot;Adicionar Horário&quot; para
              definir os dias e horários de atendimento.
            </p>
          ) : (
            fields.map((field, index) => (
              <div
                key={field.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 space-y-2">
                  <Label>Dia da Semana</Label>
                  <Select
                    value={String(watch(`availableSlots.${index}.dayOfWeek`))}
                    onValueChange={(value) =>
                      setValue(`availableSlots.${index}.dayOfWeek`, Number(value))
                    }
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Início</Label>
                  <Input
                    type="time"
                    {...register(`availableSlots.${index}.startTime`)}
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fim</Label>
                  <Input
                    type="time"
                    {...register(`availableSlots.${index}.endTime`)}
                    disabled={isLoading}
                  />
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive mt-6"
                  onClick={() => remove(index)}
                  disabled={isLoading}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : isEdit ? (
            "Atualizar Médico"
          ) : (
            "Cadastrar Médico"
          )}
        </Button>
      </div>
    </form>
  );
}
