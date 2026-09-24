"use client";

import { useEffect, useState, useCallback } from "react";
import { getStoredKey } from "@/hooks/use-admin-auth";
import { useAdminRedirect } from "@/hooks/use-admin-redirect";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";
import type { DepartamentoMember } from "@/lib/types";
import { DepartmentList } from "@/components/admin/department-list";
import { DepartmentForm } from "@/components/admin/department-form";
import { ConfirmDeleteDialog } from "@/components/admin/confirm-delete-dialog";
import { AdminModuleHeader } from "@/components/admin/admin-module-header";
import { LoadingScreen } from "@/components/admin/loading-screen";

export default function DepartamentosAdminPage() {
  const { shouldRender } = useAdminRedirect();
  const [miembros, setMiembros] = useState<DepartamentoMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingMember, setEditingMember] = useState<DepartamentoMember | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<DepartamentoMember | null>(null);

  const loadMiembros = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/departamentos");
      const data = await res.json();
      if (res.ok) {
        const conId = (data.data || []).map((m: DepartamentoMember, i: number) => ({
          ...m,
          id: m.id || `temp-${i}-${m.nombre.toLowerCase().replace(/\s+/g, "-").slice(0, 40)}`,
        }));
        setMiembros(conId);
      } else {
        setError(data.error || "Error al cargar miembros.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { if (shouldRender) loadMiembros(); }, [shouldRender, loadMiembros]);

  function handleAdd() { setFormMode("create"); setEditingMember(null); setFormOpen(true); }
  function handleEdit(m: DepartamentoMember) { setFormMode("edit"); setEditingMember(m); setFormOpen(true); }
  function handleDelete(m: DepartamentoMember) { setDeletingMember(m); setDeleteOpen(true); }

  async function handleDeleteConfirm() {
    if (!deletingMember) return { success: false, message: "No hay miembro seleccionado." };
    const accessKey = getStoredKey();
    if (!accessKey) return { success: false, message: "Sesión expirada." };
    try {
      const res = await fetch("/api/departamentos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessKey}` },
        body: JSON.stringify({ id: deletingMember.id }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setMiembros((prev) => prev.filter((m) => m.id !== deletingMember.id));
        return { success: true, message: data.message };
      }
      return { success: false, message: data.error || data.message };
    } catch (err) {
      return { success: false, message: err instanceof Error ? err.message : "Error" };
    }
  }

  function handleSaved(saved: DepartamentoMember) {
    setMiembros((prev) => {
      const idx = prev.findIndex((m) => m.id === saved.id);
      if (idx === -1) return [...prev, saved];
      const newList = [...prev]; newList[idx] = saved; return newList;
    });
    setFormOpen(false);
    setEditingMember(null);
  }

  const accessKey = getStoredKey();

  if (!shouldRender) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminModuleHeader title="Departamentos" onReload={loadMiembros} isLoading={isLoading} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex justify-end">
          <Button onClick={handleAdd} className="bg-amber-500 text-neutral-950 hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-2" />
            Añadir miembro
          </Button>
        </div>

        {isLoading && (
          <Card><CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-4 h-4 text-amber-500 animate-spin mr-2" />
            <span className="aefn-mono text-xs text-amber-600 uppercase tracking-wider">Cargando miembros...</span>
          </CardContent></Card>
        )}

        {error && !isLoading && (
          <Card><CardContent className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadMiembros} variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Reintentar</Button>
          </CardContent></Card>
        )}

        {!isLoading && !error && (
          <DepartmentList miembros={miembros} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </main>

      <DepartmentForm
        open={formOpen}
        mode={formMode}
        member={editingMember}
        accessKey={accessKey || ""}
        onSaved={handleSaved}
        onOpenChange={setFormOpen}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar miembro"
        description={`¿Estás seguro de eliminar a "${deletingMember?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}
