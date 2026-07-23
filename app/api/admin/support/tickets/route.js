import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";

export async function GET(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ok:false,message:"Acesso negado."},{status:user?403:401});
  const status = new URL(request.url).searchParams.get("status");
  const tickets = await prisma.supportTicket.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    orderBy:{ lastMessageAt:"desc" },
    include:{ messages:{ orderBy:{createdAt:"desc"}, take:1 } },
    take:200
  });
  const counts = await prisma.supportTicket.groupBy({ by:["status"], _count:{_all:true} });
  return NextResponse.json({ok:true,tickets,counts:Object.fromEntries(counts.map(x=>[x.status,x._count._all]))});
}
