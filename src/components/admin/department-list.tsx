"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Pencil, Trash2 } from "lucide-react";
import type { DepartamentoMember, DepartamentoName } from "@/lib/types";

interface DepartmentListProps {
  miembros: DepartamentoMember[];
  onEdit: (m: DepartamentoMember) => void;
  onDelete: (m: DepartamentoMember) => void;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function DepartmentList({ miembros, onEdit, onDelete }: DepartmentListProps) {
  if (miembros.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-neutral-500 text-sm">No hay miembros registrados.</p>
        <p className="text-neutral-400 text-xs mt-1">Haz clic en "Añadir miembro" para crear el primero.</p>
      </div>
    );
  }

  // Agrupar por departamento
  const departamentos = [...new Set(miembros.map((m) => m.departamento))] as DepartamentoName[];

  return (
    <div className="space-y-6">
      {departamentos.map((depto) => {
        const miembrosDepto = miembros.filter((m) => m.departamento === depto);
        return (
          <div key={depto}>
            <h3 className="text-xs text-amber-700 uppercase tracking-wider font-semibold mb-3 pb-2 border-b border-amber-500/20">
              {depto} <span className="text-neutral-400 font-light">({miembrosDepto.length})</span>
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {miembrosDepto.map((m, i) => (
                <div key={m.id || i} className="flex items-center gap-3 p-4 rounded-lg border border-neutral-200 hover:border-amber-500/40 transition-colors group">
                  <Avatar className="w-12 h-12 flex-shrink-0">
                    {m.foto ? <AvatarImage src={m.foto} alt={m.nombre} /> : null}
                    <AvatarFallback className="bg-amber-100 text-amber-700 text-sm font-light">
                      {getInitials(m.nombre)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-grow min-w-0">
                    <p className="font-normal text-neutral-900 text-sm truncate">{m.nombre}</p>
                    {m.cargo && <p className="text-xs text-neutral-500 font-light truncate">{m.cargo}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(m)}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600" onClick={() => onDelete(m)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
