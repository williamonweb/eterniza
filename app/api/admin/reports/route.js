import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { hasAnyAdminPermission } from "../../../../lib/adminPermissions";

export const dynamic = "force-dynamic";

function parseRange(searchParams) {
  const now = new Date();
  const end = searchParams.get("end") ? new Date(`${searchParams.get("end")}T23:59:59.999`) : now;
  const start = searchParams.get("start") ? new Date(`${searchParams.get("start")}T00:00:00.000`) : new Date(now.getFullYear(), now.getMonth(), 1);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) throw new Error("Período inválido.");
  return { start, end };
}

function dayKey(value) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasAnyAdminPermission(user, ["analytics", "dashboard", "payments"])) {
      return NextResponse.json({ ok:false, message:"Acesso negado." }, { status:user ? 403 : 401 });
    }
    const { searchParams } = new URL(request.url);
    const { start, end } = parseRange(searchParams);
    const whereDate = { gte:start, lte:end };

    const [payments, tributes, clients, tickets, clinics, petExperiences] = await Promise.all([
      prisma.payment.findMany({
        where:{ createdAt:whereDate }, orderBy:{ createdAt:"desc" },
        select:{ id:true,status:true,amount:true,createdAt:true,tribute:{select:{receiverName:true,planName:true,planId:true,user:{select:{name:true,email:true}}}} }
      }),
      prisma.tribute.findMany({
        where:{ createdAt:whereDate }, orderBy:{ createdAt:"desc" },
        select:{ id:true,receiverName:true,senderName:true,status:true,planName:true,planId:true,createdAt:true,publishedAt:true,slug:true,user:{select:{name:true,email:true}},_count:{select:{views:true,photos:true}} }
      }),
      prisma.user.findMany({ where:{ role:"CLIENT",createdAt:whereDate }, orderBy:{createdAt:"desc"}, select:{id:true,name:true,email:true,createdAt:true,_count:{select:{tributes:true}}} }),
      prisma.supportTicket.findMany({ where:{ createdAt:whereDate }, orderBy:{createdAt:"desc"}, select:{id:true,code:true,name:true,subject:true,status:true,createdAt:true,closedAt:true} }),
      prisma.clinic.count({ where:{ createdAt:whereDate } }),
      prisma.petExperience.count({ where:{ createdAt:whereDate, deletedAt:null } }),
    ]);

    const paidStatuses = new Set(["APPROVED","RECEIVED","CONFIRMED","PAID"]);
    const approved = payments.filter(p=>paidStatuses.has(String(p.status||"").toUpperCase()));
    const revenue = approved.reduce((sum,p)=>sum+Number(p.amount||0),0);
    const pending = payments.filter(p=>String(p.status||"").toUpperCase()==="PENDING").length;
    const published = tributes.filter(t=>t.status==="PUBLISHED").length;
    const views = tributes.reduce((sum,t)=>sum+Number(t._count?.views||0),0);
    const openTickets = tickets.filter(t=>t.status!=="CLOSED").length;

    const seriesMap = new Map();
    for (let cursor=new Date(start); cursor<=end; cursor.setDate(cursor.getDate()+1)) {
      const key=dayKey(cursor); seriesMap.set(key,{date:key,revenue:0,tributes:0,clients:0});
    }
    approved.forEach(p=>{ const row=seriesMap.get(dayKey(p.createdAt)); if(row) row.revenue+=Number(p.amount||0); });
    tributes.forEach(t=>{ const row=seriesMap.get(dayKey(t.createdAt)); if(row) row.tributes+=1; });
    clients.forEach(c=>{ const row=seriesMap.get(dayKey(c.createdAt)); if(row) row.clients+=1; });

    const planMap={};
    approved.forEach(p=>{ const name=p.tribute?.planName||p.tribute?.planId||"Não informado"; planMap[name]=(planMap[name]||0)+1; });

    return NextResponse.json({
      ok:true, range:{start:start.toISOString(),end:end.toISOString()},
      metrics:{ revenue, approvedPayments:approved.length, pendingPayments:pending, clients:clients.length, tributes:tributes.length, published, views, openTickets, tickets:tickets.length, clinics, petExperiences, averageTicket:approved.length?revenue/approved.length:0 },
      series:[...seriesMap.values()],
      plans:Object.entries(planMap).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value),
      payments:payments.slice(0,100), tributes:tributes.slice(0,100), clients:clients.slice(0,100), tickets:tickets.slice(0,100),
    }, { headers:{"Cache-Control":"no-store"} });
  } catch(error) {
    console.error("[admin/reports]",error);
    return NextResponse.json({ok:false,message:error.message||"Não foi possível gerar os relatórios."},{status:500});
  }
}
