import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../../../lib/auth";
export async function POST(request,{params}){
  const user=await getCurrentUser();
  if(!user||user.role!=="ADMIN") return NextResponse.json({ok:false,message:"Acesso negado."},{status:403});
  const ticket=await prisma.supportTicket.findUnique({where:{id:params.id}});
  if(!ticket) return NextResponse.json({ok:false,message:"Chamado não encontrado."},{status:404});
  if(ticket.status==="CLOSED") return NextResponse.json({ok:false,message:"Reabra o chamado antes de responder."},{status:409});
  const {text:raw}=await request.json(); const text=String(raw||"").trim();
  if(!text) return NextResponse.json({ok:false,message:"Digite uma mensagem."},{status:400});
  const message=await prisma.supportMessage.create({data:{ticketId:ticket.id,senderType:"ADMIN",senderName:user.name,text}});
  await prisma.supportTicket.update({where:{id:ticket.id},data:{lastMessage:text,lastMessageAt:new Date(),clientUnread:{increment:1},adminUnread:0,status:ticket.status==="NEW"?"IN_PROGRESS":ticket.status}});
  return NextResponse.json({ok:true,message});
}
