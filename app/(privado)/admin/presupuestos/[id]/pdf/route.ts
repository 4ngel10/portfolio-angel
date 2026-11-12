import { NextResponse } from "next/server";
import { comprobarAdmin } from "@/lib/portal/auth";
import { respuestaPdf } from "@/lib/portal/presupuesto-pdf";
import { isUuid } from "@/lib/portal/validate";

/** PDF del presupuesto para el admin. Sin sesión con segundo factor responde 401/403. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const acceso = await comprobarAdmin();
  if (!acceso.ok) {
    return NextResponse.json({ error: "No autorizado" }, { status: acceso.status });
  }
  const { id } = await params;
  if (!isUuid(id)) return NextResponse.json({ error: "No encontrado" }, { status: 404 });
  return respuestaPdf(id);
}
