"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DEPARTAMENTOS, type DepartamentoMember } from "@/lib/types";
import { DepartmentPhotoInput } from "./department-photo-input";

interface DepartmentFormProps {
  open: boolean;
  mode: "create" | "edit";
  member?: DepartamentoMember | null;
  accessKey: string;
  onSaved: (member: DepartamentoMember) => void;
  onOpenChange: (open: boolean) => void;
}

function getEmpty(): DepartamentoMember {
  return { id: "", nombre: "", departamento: "Logística", cargo: "", foto: "" };
}

export function DepartmentForm({ open, mode, member, accessKey, onSaved, onOpenChange }: DepartmentFormProps) {
  const [formData, setFormData] = useState<DepartamentoMember>(getEmpty());
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setFormData(mode === "edit" && member ? { ...member } : getEmpty());
    }
  }, [open, mode, member]);

  function handleSave() {
    if (!formData.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }
    setIsSaving(true);
    const url = mode === "create" ? "/api/departamentos" : "/api/departamentos";
    const method = mode === "create" ? "POST" : "PUT";
    const body = mode === "create"
      ? JSON.stringify({ member: formData })
      : JSON.stringify({ id: member?.id || formData.id, member: formData });

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessKey}` },
      body,
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          toast.success(data.message || "Guardado correctamente");
          onSaved(data.member);
        } else {
          toast.error(data.error || "Error al guardar");
        }
      })
      .catch(() => toast.error("Error de conexión"))
      .finally(() => setIsSaving(false));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Nuevo miembro" : "Editar miembro"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Añade un nuevo miembro a un departamento." : "Edita la información del miembro."}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 p-1">
            {/* Foto (solo en modo edit) */}
            {mode === "edit" && formData.id && (
              <div>
                <Label className="text-xs text-amber-700 uppercase tracking-wider font-light mb-2 block">Foto</Label>
                <DepartmentPhotoInput
                  memberId={formData.id}
                  memberName={formData.nombre}
                  currentFoto={formData.foto}
                  accessKey={accessKey}
                  onFotoChange={(newFoto) => setFormData((prev) => ({ ...prev, foto: newFoto }))}
                />
              </div>
            )}

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label>Departamento *</Label>
              <Select
                value={formData.departamento}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, departamento: val as DepartamentoMember["departamento"] }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEPARTAMENTOS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cargo */}
            <div className="space-y-2">
              <Label htmlFor="cargo">Cargo</Label>
              <Input
                id="cargo"
                value={formData.cargo}
                onChange={(e) => setFormData((prev) => ({ ...prev, cargo: e.target.value }))}
                placeholder="Ej: Coordinador, Miembro"
              />
            </div>

            {mode === "create" && (
              <p className="text-xs text-neutral-500 font-light">
                Podrás subir la foto después de crear el miembro.
              </p>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isSaving} className="bg-amber-500 text-neutral-950 hover:bg-amber-600">
            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            {mode === "create" ? "Crear" : "Guardar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
