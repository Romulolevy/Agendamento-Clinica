"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PatientData, Address } from "@/lib/models/Patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const patientSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  healthInsurance: z.string().optional(),
  notes: z.string().optional(),
  address: z.object({
    street: z.string().min(1, "Rua é obrigatória"),
    number: z.string().min(1, "Número é obrigatório"),
    complement: z.string().optional(),
    neighborhood: z.string().min(1, "Bairro é obrigatório"),
    city: z.string().min(1, "Cidade é obrigatória"),
    state: z.string().min(2, "Estado é obrigatório"),
    zipCode: z.string().min(8, "CEP inválido"),
  }),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: Partial<PatientData>;
  onSubmit: (data: PatientData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export function PatientForm({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
}: PatientFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      cpf: initialData?.cpf || "",
      birthDate: initialData?.birthDate || "",
      healthInsurance: initialData?.healthInsurance || "",
      notes: initialData?.notes || "",
      address: {
        street: initialData?.address?.street || "",
        number: initialData?.address?.number || "",
        complement: initialData?.address?.complement || "",
        neighborhood: initialData?.address?.neighborhood || "",
        city: initialData?.address?.city || "",
        state: initialData?.address?.state || "",
        zipCode: initialData?.address?.zipCode || "",
      },
    },
  });

  const handleFormSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    try {
      await onSubmit(data as PatientData);
    } finally {
      setIsLoading(false);
    }
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
              placeholder="Nome do paciente"
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
            <Label htmlFor="birthDate">Data de Nascimento *</Label>
            <Input
              id="birthDate"
              type="date"
              {...register("birthDate")}
              disabled={isLoading}
            />
            {errors.birthDate && (
              <p className="text-sm text-destructive">{errors.birthDate.message}</p>
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

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="healthInsurance">Convênio</Label>
            <Input
              id="healthInsurance"
              {...register("healthInsurance")}
              placeholder="Nome do convênio (opcional)"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Endereço */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Endereço</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-3 space-y-2">
            <Label htmlFor="street">Rua *</Label>
            <Input
              id="street"
              {...register("address.street")}
              placeholder="Nome da rua"
              disabled={isLoading}
            />
            {errors.address?.street && (
              <p className="text-sm text-destructive">
                {errors.address.street.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="number">Número *</Label>
            <Input
              id="number"
              {...register("address.number")}
              placeholder="123"
              disabled={isLoading}
            />
            {errors.address?.number && (
              <p className="text-sm text-destructive">
                {errors.address.number.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="complement">Complemento</Label>
            <Input
              id="complement"
              {...register("address.complement")}
              placeholder="Apto, Bloco, etc."
              disabled={isLoading}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="neighborhood">Bairro *</Label>
            <Input
              id="neighborhood"
              {...register("address.neighborhood")}
              placeholder="Nome do bairro"
              disabled={isLoading}
            />
            {errors.address?.neighborhood && (
              <p className="text-sm text-destructive">
                {errors.address.neighborhood.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="city">Cidade *</Label>
            <Input
              id="city"
              {...register("address.city")}
              placeholder="Nome da cidade"
              disabled={isLoading}
            />
            {errors.address?.city && (
              <p className="text-sm text-destructive">
                {errors.address.city.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">Estado *</Label>
            <Input
              id="state"
              {...register("address.state")}
              placeholder="SP"
              maxLength={2}
              disabled={isLoading}
            />
            {errors.address?.state && (
              <p className="text-sm text-destructive">
                {errors.address.state.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="zipCode">CEP *</Label>
            <Input
              id="zipCode"
              {...register("address.zipCode")}
              placeholder="00000-000"
              disabled={isLoading}
            />
            {errors.address?.zipCode && (
              <p className="text-sm text-destructive">
                {errors.address.zipCode.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Observações</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register("notes")}
            placeholder="Observações adicionais sobre o paciente..."
            rows={4}
            disabled={isLoading}
          />
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
            "Atualizar Paciente"
          ) : (
            "Cadastrar Paciente"
          )}
        </Button>
      </div>
    </form>
  );
}
