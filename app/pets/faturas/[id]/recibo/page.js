import { redirect, notFound } from "next/navigation";
import { prisma } from "../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../lib/auth";
import PrintButton from "./PrintButton";

function money(cents){ return (Number(cents||0)/100).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}); }
function date(v){ return v ? new Date(v).toLocaleDateString("pt-BR") : "—"; }
function method(v){ return ({PIX:"PIX",CARTAO_CREDITO:"Cartão de crédito",CARTAO_DEBITO:"Cartão de débito",DINHEIRO:"Dinheiro",TRANSFERENCIA:"Transferência",BOLETO:"Boleto",OUTRO:"Outro"})[v] || v || "—"; }

export default async function ClinicReceiptPage({ params }) {
  const current = await getCurrentUser();
  if (!current?.id) redirect("/pets/login");
  const user = await prisma.user.findUnique({ where:{id:current.id}, select:{clinicId:true,role:true,isActive:true} });
  if (!user?.isActive || !user.clinicId || !["CLINIC_MANAGER","CLINIC_STAFF"].includes(String(user.role))) redirect("/pets/login");
  const invoice = await prisma.clinicInvoice.findFirst({ where:{id:String(params.id),clinicId:user.clinicId,status:"PAID"}, include:{clinic:true} });
  if (!invoice) notFound();
  return <main style={{minHeight:"100vh",background:"#eef3f6",padding:"32px",fontFamily:"Arial,sans-serif",color:"#17242d"}}><section style={{maxWidth:760,margin:"auto",background:"white",borderRadius:24,padding:42,boxShadow:"0 20px 60px rgba(0,0,0,.1)"}}><div style={{display:"flex",justifyContent:"space-between",gap:20,borderBottom:"2px solid #edf1f3",paddingBottom:24}}><div><div style={{fontSize:14,fontWeight:900,color:"#277ed4",letterSpacing:2}}>ETERNIZA PETS</div><h1 style={{fontSize:34,margin:"8px 0"}}>Recibo de pagamento</h1><p style={{margin:0,color:"#687984"}}>Recibo nº {invoice.receiptNumber || invoice.id}</p></div>{invoice.clinic.logoUrl && <img src={invoice.clinic.logoUrl} alt="Logo da clínica" style={{width:90,height:90,objectFit:"contain"}} />}</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:18,marginTop:28}}><Info label="Clínica" value={invoice.clinic.tradeName}/><Info label="CNPJ" value={invoice.clinic.cnpj}/><Info label="Competência" value={invoice.competency}/><Info label="Descrição" value={invoice.description}/><Info label="Valor pago" value={money(invoice.amountCents)}/><Info label="Data do pagamento" value={date(invoice.paidAt)}/><Info label="Forma de pagamento" value={method(invoice.paymentMethod)}/><Info label="Vencimento original" value={date(invoice.dueDate)}/></div>{invoice.notes && <div style={{marginTop:22,padding:16,borderRadius:14,background:"#f5f8fa"}}><b>Observações</b><p>{invoice.notes}</p></div>}<p style={{marginTop:34,color:"#71828d",fontSize:13}}>Documento emitido eletronicamente pelo Eterniza Pets.</p><PrintButton /></section></main>;
}
function Info({label,value}){ return <div style={{padding:16,borderRadius:14,background:"#f7f9fa"}}><small style={{display:"block",color:"#72828c",fontWeight:800,marginBottom:6}}>{label}</small><strong>{value || "—"}</strong></div>; }
