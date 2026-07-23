import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { nextSupportCode, publicTicket } from "../../../../lib/support";

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    if (!name || !subject || !message) {
      return NextResponse.json({ ok:false, message:"Preencha nome, assunto e mensagem." }, { status:400 });
    }
    const code = await nextSupportCode();
    const ticket = await prisma.supportTicket.create({
      data: {
        code,
        name,
        email: String(body.email || "").trim() || null,
        phone: String(body.phone || "").trim() || null,
        subject,
        sourceUrl: String(body.sourceUrl || "").slice(0, 1000) || null,
        tributeCode: String(body.tributeCode || "").slice(0, 100) || null,
        lastMessage: message,
        messages: { create: [
          { senderType:"CLIENT", senderName:name, text:message },
          { senderType:"SYSTEM", senderName:"Eterniza", text:`Chamado ${code} aberto com sucesso. Recebemos sua mensagem e responderemos em breve.` }
        ] }
      },
      include: { messages: { orderBy:{ createdAt:"asc" } } }
    });
    return NextResponse.json({ ok:true, accessToken:ticket.accessToken, ticket:publicTicket(ticket) }, { status:201 });
  } catch (error) {
    console.error("POST support ticket", error);
    return NextResponse.json({ ok:false, message:"Não foi possível abrir o chamado." }, { status:500 });
  }
}
