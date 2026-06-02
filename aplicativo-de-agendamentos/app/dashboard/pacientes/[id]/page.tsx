"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PatientForm } from "@/components/forms/PatientForm";
import { PatientService } from "@/lib/services/PatientService";
import { PatientData, PatientJSON } from "@/lib/models/Patient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Mail, Phone, MapPin, Calendar, CreditCard, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit") === "true";

  const [patient, setPatient] = useState<PatientJSON | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPatient = async () => {
      try {
        const patientService = PatientService.getInstance();
        const data = await patientService.getById(id);
        if (data) {
          setPatient(data.toJSON());
        } else {
          toast.error("Paciente não encontrado");
          router.push("/dashboard/pacientes");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadPatient();
  }, [id, router]);

  const handleUpdate = async (data: PatientData) => {
    try {
      const patientService = PatientService.getInstance();
      await patientService.update(id, data);
      toast.success("Paciente atualizado com sucesso!");
      router.push(`/dashboard/pacientes/${id}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar paciente"
      );
    }
  };

  if (isLoading || !patient) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Carregando..." />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">
            Carregando dados do paciente...
          </div>
        </div>
      </div>
    );
  }

  if (isEdit) {
    return (
      <div className="flex flex-col h-full">
        <Header title="Editar Paciente" />

        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => router.push(`/dashboard/pacientes/${id}`)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

            <PatientForm
              initialData={{
                name: patient.name,
                email: patient.email,
                phone: patient.phone,
                cpf: patient.cpf,
                birthDate: patient.birthDate.split("T")[0],
                address: patient.address,
                healthInsurance: patient.healthInsurance,
                notes: patient.notes,
              }}
              onSubmit={handleUpdate}
              onCancel={() => router.push(`/dashboard/pacientes/${id}`)}
              isEdit
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <Header title="Detalhes do Paciente" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <Button
              onClick={() =>
                router.push(`/dashboard/pacientes/${id}?edit=true`)
              }
            >
              <Pencil className="w-4 h-4 mr-2" />
              Editar
            </Button>
          </div>

          {/* Info Principal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{patient.name}</CardTitle>
              <p className="text-muted-foreground">
                Cadastrado em{" "}
                {format(new Date(patient.createdAt), "dd/MM/yyyy", {
                  locale: ptBR,
                })}
              </p>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{patient.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Telefone</p>
                    <p className="font-medium">{patient.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">CPF</p>
                    <p className="font-medium">{patient.cpf}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Data de Nascimento
                    </p>
                    <p className="font-medium">
                      {format(new Date(patient.birthDate), "dd/MM/yyyy")} (
                      {patient.age} anos)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Convênio</p>
                    <p className="font-medium">
                      {patient.healthInsurance || "Particular"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Endereço */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Endereço
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">
                {patient.address.street}, {patient.address.number}
                {patient.address.complement &&
                  ` - ${patient.address.complement}`}
              </p>
              <p className="text-muted-foreground">
                {patient.address.neighborhood} - {patient.address.city}/
                {patient.address.state}
              </p>
              <p className="text-muted-foreground">
                CEP: {patient.address.zipCode}
              </p>
            </CardContent>
          </Card>

          {/* Observações */}
          {patient.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {patient.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
