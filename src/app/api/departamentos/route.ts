import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile, slugify, readJsonForWrite } from "@/lib/github";
import { hasPermission, extractKeyFromRequest } from "@/lib/auth";
import { MODULES } from "@/lib/config";
import type { DepartamentoMember } from "@/lib/types";

const MODULE_KEY = "departamentos" as const;
const JSON_PATH = MODULES[MODULE_KEY].jsonPath;

/** GET /api/departamentos — listar todos (público) */
export async function GET() {
  try {
    const { data, sha } = await readJsonFile<DepartamentoMember[]>(JSON_PATH);
    return NextResponse.json({ data: data ?? [], sha });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: "Error al leer departamentos", detail: message }, { status: 500 });
  }
}

/** POST /api/departamentos — crear miembro nuevo */
export async function POST(request: NextRequest) {
  try {
    const key = extractKeyFromRequest(request);
    if (!key || !hasPermission(key, MODULE_KEY)) {
      return NextResponse.json({ error: "No tienes permiso para editar departamentos." }, { status: 403 });
    }
    const body = await request.json();
    const nuevo: DepartamentoMember = body.member;
    if (!nuevo || !nuevo.nombre || !nuevo.departamento) {
      return NextResponse.json({ error: "Faltan campos obligatorios: nombre, departamento." }, { status: 400 });
    }
    const { data: miembros, sha } = await readJsonForWrite<DepartamentoMember[]>(JSON_PATH, "id");
    const lista = miembros ?? [];
    if (miembros === null) {
      return NextResponse.json({ error: "No se pudieron leer los datos existentes." }, { status: 500 });
    }
    const baseId = slugify(nuevo.nombre);
    let id = baseId;
    let suffix = 2;
    while (lista.some((m) => m.id === id)) { id = `${baseId}-${suffix}`; suffix++; }
    nuevo.id = id;
    if (typeof nuevo.foto !== "string") nuevo.foto = "";
    if (typeof nuevo.cargo !== "string") nuevo.cargo = "";
    lista.push(nuevo);
    const result = await writeJsonFile(JSON_PATH, lista, sha, `Add departamento member: ${nuevo.nombre}`);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });
    return NextResponse.json({ success: true, member: nuevo, commitSha: result.commitSha, message: `Miembro "${nuevo.nombre}" creado correctamente.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: "Error al crear miembro", detail: message }, { status: 500 });
  }
}

/** PUT /api/departamentos — actualizar miembro existente */
export async function PUT(request: NextRequest) {
  try {
    const key = extractKeyFromRequest(request);
    if (!key || !hasPermission(key, MODULE_KEY)) {
      return NextResponse.json({ error: "No tienes permiso para editar departamentos." }, { status: 403 });
    }
    const body = await request.json();
    const { id, member } = body as { id: string; member: DepartamentoMember };
    if (!id || !member) {
      return NextResponse.json({ error: "Faltan campos: id, member." }, { status: 400 });
    }
    const { data: miembros, sha } = await readJsonForWrite<DepartamentoMember[]>(JSON_PATH, "id");
    const lista = miembros ?? [];
    if (miembros === null) {
      return NextResponse.json({ error: "No se pudieron leer los datos existentes." }, { status: 500 });
    }
    let index = lista.findIndex((m) => m.id === id);
    if (index === -1) {
      const tempMatch = id.match(/^temp-(\d+)-(.+)$/);
      if (tempMatch) {
        const tempIndex = parseInt(tempMatch[1], 10);
        if (!isNaN(tempIndex) && tempIndex < lista.length) index = tempIndex;
      }
    }
    if (index === -1) {
      return NextResponse.json({ error: `No se encontró miembro con id "${id}".` }, { status: 404 });
    }
    member.id = id.startsWith("temp-") ? slugify(member.nombre) : id;
    if (!member.foto) member.foto = lista[index].foto;
    lista[index] = member;
    const result = await writeJsonFile(JSON_PATH, lista, sha, `Update departamento member: ${member.nombre}`);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });
    return NextResponse.json({ success: true, member, commitSha: result.commitSha, message: `Miembro "${member.nombre}" actualizado correctamente.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: "Error al actualizar miembro", detail: message }, { status: 500 });
  }
}

/** DELETE /api/departamentos — eliminar miembro */
export async function DELETE(request: NextRequest) {
  try {
    const key = extractKeyFromRequest(request);
    if (!key || !hasPermission(key, MODULE_KEY)) {
      return NextResponse.json({ error: "No tienes permiso para eliminar miembros." }, { status: 403 });
    }
    const body = await request.json();
    const { id } = body as { id: string };
    if (!id) {
      return NextResponse.json({ error: "Falta el campo: id." }, { status: 400 });
    }
    const { data: miembros, sha } = await readJsonForWrite<DepartamentoMember[]>(JSON_PATH, "id");
    const lista = miembros ?? [];
    if (miembros === null) {
      return NextResponse.json({ error: "No se pudieron leer los datos existentes." }, { status: 500 });
    }
    let index = lista.findIndex((m) => m.id === id);
    if (index === -1) {
      const tempMatch = id.match(/^temp-(\d+)-(.+)$/);
      if (tempMatch) {
        const tempIndex = parseInt(tempMatch[1], 10);
        if (!isNaN(tempIndex) && tempIndex < lista.length) index = tempIndex;
      }
    }
    if (index === -1) {
      return NextResponse.json({ error: `No se encontró miembro con id "${id}".` }, { status: 404 });
    }
    const deleted = lista[index];
    lista.splice(index, 1);
    const result = await writeJsonFile(JSON_PATH, lista, sha, `Delete departamento member: ${deleted.nombre}`);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 500 });
    return NextResponse.json({ success: true, message: `Miembro "${deleted.nombre}" eliminado correctamente.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: "Error al eliminar miembro", detail: message }, { status: 500 });
  }
}
