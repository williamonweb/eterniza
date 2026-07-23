import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

function statusOf(invoice) {
  if (invoice.status === "PENDING" && new Date(invoice.dueDate) < new Date()) return "OVERDUE";
  return invoice.status;
}

export async function GET() {
  try {
    const current = await getCurrentUser();
    if (!current?.id) return NextResponse.json({ ok:false, message:"Não autenticado." }, { status:401 });
    const user = await prisma.user.findUnique({ where:{ id:current.id }, select:{ id:true, role:true, isActive:true, clinicId:true, clinic:{ select:{ status:true } } } });
    if (!user || !user.isActive || !user.clinicId || !["CLINIC_MANAGER","CLINIC_STAFF"].includes(String(user.role)) || user.clinic?.status !== "APPROVED") return NextResponse.json({ ok:false, message:"Acesso não autorizado." }, { status:403 });
    const rows = await prisma.clinicInvoice.findMany({ where:{ clinicId:user.clinicId }, orderBy:[{ dueDate:"desc" },{ createdAt:"desc" }] });
    const invoices = rows.map(item => ({ ...item, status:statusOf(item), receiptUrl:item.status === "PAID" ? `/pets/faturas/${item.id}/recibo` : null }));
    const open = invoices.filter(i => ["PENDING","OVERDUE"].includes(i.status));
    const paid = invoices.filter(i => i.status === "PAID");
    return NextResponse.json({ ok:true, invoices, metrics:{ openCount:open.length, openCents:open.reduce((s,i)=>s+i.amountCents,0), paidCount:paid.length, paidCents:paid.reduce((s,i)=>s+i.amountCents,0), lastPaidAt:paid.map(i=>i.paidAt).filter(Boolean).sort().reverse()[0] || null, nextDueDate:open.map(i=>i.dueDate).sort()[0] || null } }, { headers:{ "Cache-Control":"no-store" } });
  } catch (error) { console.error("[pets/invoices]", error); return NextResponse.json({ ok:false, message:"Não foi possível carregar as faturas." }, { status:500 }); }
}
