"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { DoctorService } from "@/lib/services/DoctorService";
import { DoctorJSON, DAYS_OF_WEEK } from "@/lib/models/Doctor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  UserCog,
  Power,
} from "lucide-react";

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<DoctorJSON[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorJSON[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      const doctorService = DoctorService.getInstance();
      const data = await doctorService.getAll();
      const doctorsData = data.map((d) => d.toJSON());
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
          d.crm.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredDoctors(filtered);
    } else {
      setFilteredDoctors(doctors);
    }
  }, [searchTerm, doctors]);

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      const doctorService = DoctorService.getInstance();
      await doctorService.delete(deleteId);
      toast.success("Médico excluído com sucesso");
      loadDoctors();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao excluir médico"
      );
    } finally {
      setDeleteId(null);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const doctorService = DoctorService.getInstance();
      await doctorService.toggleActive(id);
      toast.success("Status do médico atualizado");
      loadDoctors();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao atualizar status"
      );
    }
  };

  const getAvailableDays = (slots: DoctorJSON["availableSlots"]) => {
    const days = [...new Set(slots.map((s) => s.dayOfWeek))];
    return days
      .sort()
      .map((d) => DAYS_OF_WEEK[d].substring(0, 3))
      .join(", ");
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Médicos" />

      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, especialidade ou CRM..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => router.push("/dashboard/medicos/novo")}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Médico
          </Button>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {filteredDoctors.length === 0 && !isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UserCog className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-1">
                  Nenhum médico encontrado
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchTerm
                    ? "Tente uma busca diferente"
                    : "Comece cadastrando o primeiro médico"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => router.push("/dashboard/medicos/novo")}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Cadastrar Médico
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>CRM</TableHead>
                    <TableHead>Especialidade</TableHead>
                    <TableHead>Dias de Atendimento</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell className="font-medium">
                        {doctor.name}
                      </TableCell>
                      <TableCell>{doctor.crm}</TableCell>
                      <TableCell>{doctor.specialty}</TableCell>
                      <TableCell>
                        {doctor.availableSlots.length > 0 ? (
                          <span className="text-sm text-muted-foreground">
                            {getAvailableDays(doctor.availableSlots)}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Não definido
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={doctor.active ? "default" : "secondary"}
                          className={
                            doctor.active
                              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                              : ""
                          }
                        >
                          {doctor.active ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(`/dashboard/medicos/${doctor.id}`)
                              }
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/medicos/${doctor.id}?edit=true`
                                )
                              }
                            >
                              <Pencil className="w-4 h-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleToggleActive(doctor.id)}
                            >
                              <Power className="w-4 h-4 mr-2" />
                              {doctor.active ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(doctor.id)}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este médico? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
