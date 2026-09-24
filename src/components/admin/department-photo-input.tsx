"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

interface DepartmentPhotoInputProps {
  memberId: string;
  memberName: string;
  currentFoto: string;
  accessKey: string;
  onFotoChange: (newFoto: string) => void;
}

export function DepartmentPhotoInput({
  memberId, memberName, currentFoto, accessKey, onFotoChange,
}: DepartmentPhotoInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("id", memberId);
      formData.append("file", file);
      const res = await fetch("/api/departamentos/foto", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessKey}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        onFotoChange(data.foto);
        toast.success("Foto actualizada");
      } else {
        toast.error(data.error || "Error al subir foto");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!currentFoto) return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/departamentos/foto", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessKey}` },
        body: JSON.stringify({ id: memberId }),
      });
      const data = await res.json();
      if (data.success) {
        onFotoChange("");
        toast.success("Foto eliminada");
      } else {
        toast.error(data.error || "Error al eliminar foto");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="w-20 h-20">
        {currentFoto ? <AvatarImage src={currentFoto} alt={memberName} /> : null}
        <AvatarFallback className="bg-amber-100 text-amber-700 text-lg font-light">
          {getInitials(memberName)}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-2">
        <input ref={inputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()} disabled={isUploading}>
          {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
          {currentFoto ? "Cambiar foto" : "Subir foto"}
        </Button>
        {currentFoto && (
          <Button type="button" variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Eliminar
          </Button>
        )}
      </div>
    </div>
  );
}
