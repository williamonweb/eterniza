import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { getCurrentUser } from "../../../../lib/auth";
import { hasPermission } from "../../../../lib/pets/team-permissions";

export const dynamic = "force-dynamic";

function parseRange(searchParams){
  const now=new Date();
  const end=searchParams.get("end")?new Date(`${searchParams.get("end")}T23:59:59.999`):now;
  const start=searchParams.get("start")?new Date(`${searchParams.get("start")}T00:00:00.000`):new Date(now.getFullYear(),now.getMonth(),1);
  if(Number.isNaN(start.getTime())||Number.isNaN(end.getTime())) throw new Error("Período inválido.");
  return {start,end};
}
function dayKey(value){const d=new Date(value);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}

export async function GET(request){
  try{
    const current=await getCurrentUser();
    if(!current) return NextResponse.json({ok:false,message:"Não autenticado."},{status:401});
    const user=await prisma.user.findUnique({where:{id:current.id},include:{clinic:true}});
    if(!user?.clinicId || !["CLINIC_MANAGER","CLINIC_STAFF"].includes(String(user.role)) || user.clinic?.status!=="APPROVED") return NextResponse.json({ok:false,message:"Acesso negado."},{status:403});
    if(user.role!=="CLINIC_MANAGER" && !hasPermission(user,"reports.view")) return NextResponse.json({ok:false,message:"Sem permissão para relatórios."},{status:403});
    const {searchParams}=new URL(request.url); const {start,end}=parseRange(searchParams); const whereDate={gte:start,lte:end};
    const [experiences,invoices,team]=await Promise.all([
      prisma.petExperience.findMany({where:{clinicId:user.clinicId,deletedAt:null,createdAt:whereDate},orderBy:{createdAt:"desc"},select:{id:true,slug:true,petName:true,tutorName:true,type:true,status:true,views:true,createdAt:true,publishedAt:true,createdBy:{select:{id:true,name:true,email:true}}}}),
      prisma.clinicInvoice.findMany({where:{clinicId:user.clinicId,createdAt:whereDate},orderBy:{createdAt:"desc"},select:{id:true,competency:true,description:true,amountCents:true,dueDate:true,status:true,paidAt:true,paymentMethod:true,createdAt:true}}),
      prisma.user.findMany({where:{clinicId:user.clinicId,isActive:true},select:{id:true,name:true,email:true,role:true}}),
    ]);
    const byType={}; const byStatus={}; const byMember={};
    experiences.forEach(e=>{byType[e.type]=(byType[e.type]||0)+1;byStatus[e.status]=(byStatus[e.status]||0)+1;const key=e.createdBy?.name||"Não informado";byMember[key]=(byMember[key]||0)+1;});
    const views=experiences.reduce((s,e)=>s+Number(e.views||0),0);
    const paidInvoices=invoices.filter(i=>i.status==="PAID");
    const seriesMap=new Map();
    for(let cursor=new Date(start);cursor<=end;cursor.setDate(cursor.getDate()+1)){const key=dayKey(cursor);seriesMap.set(key,{date:key,experiences:0,views:0});}
    experiences.forEach(e=>{const row=seriesMap.get(dayKey(e.createdAt));if(row){row.experiences+=1;row.views+=Number(e.views||0);}});
    return NextResponse.json({ok:true,range:{start:start.toISOString(),end:end.toISOString()},clinic:{id:user.clinic.id,tradeName:user.clinic.tradeName,code:user.clinic.code,monthlyTributeLimit:user.clinic.monthlyTributeLimit,monthlyPackageName:user.clinic.monthlyPackageName},metrics:{total:experiences.length,published:byStatus.PUBLISHED||0,drafts:byStatus.DRAFT||0,archived:byStatus.ARCHIVED||0,views,teamMembers:team.length,paidCents:paidInvoices.reduce((s,i)=>s+Number(i.amountCents||0),0),pendingInvoices:invoices.filter(i=>["PENDING","OVERDUE"].includes(i.status)).length},types:Object.entries(byType).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value),members:Object.entries(byMember).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value),series:[...seriesMap.values()],experiences:experiences.slice(0,200),invoices:invoices.slice(0,100)}, {headers:{"Cache-Control":"no-store"}});
  }catch(error){console.error("[pets/reports]",error);return NextResponse.json({ok:false,message:error.message||"Não foi possível gerar o relatório."},{status:500});}
}
