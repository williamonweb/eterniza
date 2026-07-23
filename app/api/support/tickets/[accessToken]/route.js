import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { publicTicket } from "../../../../../lib/support";

export async function GET(_request, { params }) {
  const ticket = await prisma.supportTicket.findUnique({
    where:{ accessToken:params.accessToken },
    include:{ messages:{ orderBy:{ createdAt:"asc" } } }
  });
  if (!ticket) return NextResponse.json({ ok:false, message:"Chamado não encontrado." }, { status:404 });
  if (ticket.clientUnread) await prisma.supportTicket.update({ where:{id:ticket.id}, data:{clientUnread:0} });
  return NextResponse.json({ ok:true, ticket:publicTicket(ticket) });
}
