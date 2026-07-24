import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../../lib/auth";
import { hasAdminPermission } from "../../../../../../lib/adminPermissions";

async function admin(){ const user=await getCurrentUser(); return hasAdminPermission(user, "support")?user:null; }
export async function GET(_request,{params}){
  if(!await admin()) return NextResponse.json({ok:false,message:"Acesso negado."},{status:403});
  const ticket=await prisma.supportTicket.findUnique({where:{id:params.id},include:{messages:{orderBy:{createdAt:"asc"}}}});
  if(!ticket) return NextResponse.json({ok:false,message:"Chamado não encontrado."},{status:404});
  if(ticket.adminUnread) await prisma.supportTicket.update({where:{id:ticket.id},data:{adminUnread:0}});
  return NextResponse.json({ok:true,ticket});
}
export async function PATCH(request,{params}){
  const user=await admin();
  if(!user) return NextResponse.json({ok:false,message:"Acesso negado."},{status:403});
  const body=await request.json();
  const allowed=["NEW","IN_PROGRESS","WAITING_CLIENT","CLOSED"];
  if(!allowed.includes(body.status)) return NextResponse.json({ok:false,message:"Status inválido."},{status:400});
  const current=await prisma.supportTicket.findUnique({where:{id:params.id}});
  if(!current) return NextResponse.json({ok:false,message:"Chamado não encontrado."},{status:404});
  const closing=body.status==="CLOSED" && current.status!=="CLOSED";
  const ticket=await prisma.$transaction(async tx=>{
    const updated=await tx.supportTicket.update({where:{id:params.id},data:{status:body.status,closedAt:closing?new Date():body.status!=="CLOSED"?null:current.closedAt,closedById:closing?user.id:body.status!=="CLOSED"?null:current.closedById,clientUnread:closing?{increment:1}:undefined}});
    if(closing) await tx.supportMessage.create({data:{ticketId:params.id,senderType:"SYSTEM",senderName:"Eterniza",text:`Chamado ${current.code} encerrado por ${user.name}. Caso precise de ajuda novamente, abra um novo atendimento.`}});
    return updated;
  });
  return NextResponse.json({ok:true,ticket});
}
