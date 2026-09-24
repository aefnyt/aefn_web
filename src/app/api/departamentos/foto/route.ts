import { NextRequest, NextResponse } from "next/server";
import { readJsonFile, writeJsonFile, writeBinaryFile, deleteFile, slugify } from "@/lib/github";
import { hasPermission, extractKeyFromRequest } from "@/lib/auth";
import { MODULES } from "@/lib/config";
import { processProfessorPhoto, validateImage } from "@/lib/image";
import type { DepartamentoMember } from "@/lib/types";

const MODULE_KEY = "departamentos" as const;
const JSON_PATH = MODULES[MODULE_KEY].jsonPath;
const IMAGES_PATH = MODULES[MODULE_KEY].imagesPath!;

/** POST /api/departamentos/foto — subir o reemplazar foto */
export async function POST(request: NextRequest) {
  try {
    const key = extractKeyFromRequest(request);
    if (!key || !hasPermission(key, MODULE_KEY)) {
      return NextResponse.json({ error: "No tienes permiso." }, { status: 403 });
    }
    const formData = await request.formData();
    const id = formData.get("id") as string | null;
    const file = formData.get("file") as File | null;
    if (!id || !file) {
      return NextResponse.json({ error: "Faltan: id, file." }, { status: 400 });
    }
    const validation = validateImage(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { data: miembros, sha } = await readJsonFile<DepartamentoMember[]>(JSON_PATH);
    const lista = miembros ?? [];
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
    const member = lista[index];
    const processed = await processProfessorPhoto(file);
    const filename = `${slugify(member.nombre)}.webp`;
    const fullPath = `${IMAGES_PATH}/${filename}`;
    const uploadResult = await writeBinaryFile(fullPath, processed.buffer, sha);
    if (!uploadResult.success) {
      return NextResponse.json({ error: uploadResult.message }, { status: 500 });
    }
    const fotoRelativa = `${IMAGES_PATH.replace("public/", "")}/${filename}`;
    const oldFoto = member.foto;
    member.foto = fotoRelativa;
    const writeResult = await writeJsonFile(JSON_PATH, lista, sha, `Update foto: ${member.nombre}`);
    if (!writeResult.success) {
      return NextResponse.json({ error: writeResult.message }, { status: 500 });
    }
    if (oldFoto && oldFoto !== fotoRelativa) {
      try { await deleteFile(`public/${oldFoto}`); } catch {}
    }
    return NextResponse.json({ success: true, foto: fotoRelativa, commitSha: writeResult.commitSha });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: "Error al subir foto", detail: message }, { status: 500 });
  }
}

/** DELETE /api/departamentos/foto — eliminar foto */
export async function DELETE(request: NextRequest) {
  try {
    const key = extractKeyFromRequest(request);
    if (!key || !hasPermission(key, MODULE_KEY)) {
      return NextResponse.json({ error: "No tienes permiso." }, { status: 403 });
    }
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Falta: id." }, { status: 400 });
    }
    const { data: miembros, sha } = await readJsonFile<DepartamentoMember[]>(JSON_PATH);
    const lista = miembros ?? [];
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
    const member = lista[index];
    if (member.foto) {
      try { await deleteFile(`public/${member.foto}`); } catch {}
    }
    member.foto = "";
    const writeResult = await writeJsonFile(JSON_PATH, lista, sha, `Delete foto: ${member.nombre}`);
    if (!writeResult.success) {
      return NextResponse.json({ error: writeResult.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, commitSha: writeResult.commitSha });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error desconocido";
    return NextResponse.json({ error: "Error al eliminar foto", detail: message }, { status: 500 });
  }
}
