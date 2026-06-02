"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { PatientForm } from "@/components/forms/PatientForm";
import { PatientService } from "@/lib/services/PatientService";
import { PatientData } from "@/lib/models/Patient";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewPatientPage() {
  const router = useRouter();

  const handleSubmit = async (data: PatientData) => {
    try {
      const patientService = PatientService.getInstance();
      await patientService.create(data);
      toast.success("Paciente cadastrado com sucesso!");
      router.push("/dashboard/pacientes");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar paciente"
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Novo Paciente" />

      <div className="flex-1 p-6 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <PatientForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/pacientes")}
          />
        </div>
      </div>
    </div>
  );
}
