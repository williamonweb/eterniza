import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(request, { params }) {
  try {
    const ticket = await prisma.supportTicket.findUnique({ where:{ accessToken:params.accessToken } });
    if (!ticket) return NextResponse.json({ ok:false, message:"Chamado não encontrado." }, { status:404 });
    if (ticket.status === "CLOSED") return NextResponse.json({ ok:false, message:`O chamado ${ticket.code} já foi encerrado.` }, { status:409 });
    const body = await request.json();
    const text = String(body.text || "").trim();
    if (!text) return NextResponse.json({ ok:false, message:"Digite uma mensagem." }, { status:400 });
    const message = await prisma.supportMessage.create({ data:{ ticketId:ticket.id, senderType:"CLIENT", senderName:ticket.name, text } });
    await prisma.supportTicket.update({ where:{id:ticket.id}, data:{ lastMessage:text, lastMessageAt:new Date(), adminUnread:{increment:1}, status: ticket.status === "WAITING_CLIENT" ? "IN_PROGRESS" : ticket.status } });
    return NextResponse.json({ ok:true, message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok:false, message:"Não foi possível enviar." }, { status:500 });
  }
}
