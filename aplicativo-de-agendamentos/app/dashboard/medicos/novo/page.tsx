"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DoctorForm } from "@/components/forms/DoctorForm";
import { DoctorService } from "@/lib/services/DoctorService";
import { DoctorData } from "@/lib/models/Doctor";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NewDoctorPage() {
  const router = useRouter();

  const handleSubmit = async (data: DoctorData) => {
    try {
      const doctorService = DoctorService.getInstance();
      await doctorService.create(data);
      toast.success("Médico cadastrado com sucesso!");
      router.push("/dashboard/medicos");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao cadastrar médico"
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Novo Médico" />

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

          <DoctorForm
            onSubmit={handleSubmit}
            onCancel={() => router.push("/dashboard/medicos")}
          />
        </div>
      </div>
    </div>
  );
}
