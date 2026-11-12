import { NextResponse } from "next/server";
import { getPerfil } from "@/lib/portal/auth";
import { respuestaPdf } from "@/lib/portal/presupuesto-pdf";
import { isUuid } from "@/lib/portal/validate";

/** PDF del presupuesto para el cliente. RLS oculta borradores y presupuestos de otra empresa. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const perfil = await getPerfil();
  if (!perfil || perfil.role !== "cliente" || !perfil.empresa_id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return respuestaPdf(id);
}
