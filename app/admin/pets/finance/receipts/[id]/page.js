import { notFound, redirect } from "next/navigation";
import { prisma } from "../../../../../../lib/prisma";
import { getCurrentUser } from "../../../../../../lib/auth";
import PrintButton from "./PrintButton";

function money(cents) {
  return (Number(cents || 0) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function date(value) {
  return value ? new Date(value).toLocaleDateString("pt-BR") : "—";
}

function competency(value) {
  const [year, month] = String(value || "").split("-");
  const names = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return month && year ? `${names[Number(month) - 1]}/${year}` : value;
}

function paymentMethod(value) {
  return ({
    PIX: "PIX",
    CARTAO_CREDITO: "Cartão de crédito",
    CARTAO_DEBITO: "Cartão de débito",
    DINHEIRO: "Dinheiro",
    TRANSFERENCIA: "Transferência bancária",
    BOLETO: "Boleto",
    OUTRO: "Outro",
  })[String(value || "PIX").toUpperCase()] || value || "PIX";
}

export default async function ReceiptPage({ params }) {
  const user = await getCurrentUser();
  if (!user || String(user.role).toUpperCase() !== "ADMIN") redirect("/login");

  const invoice = await prisma.clinicInvoice.findUnique({ where: { id: params.id }, include: { clinic: true } });
  if (!invoice || invoice.status !== "PAID") notFound();

  return (
    <main className="receipt-page">
      <style>{`
        *{box-sizing:border-box}body{margin:0;background:#edf1ef;color:#18201d;font-family:Arial,sans-serif}.receipt-page{min-height:100vh;padding:36px 18px}.sheet{width:min(820px,100%);margin:auto;background:#fff;border-radius:20px;padding:54px;box-shadow:0 20px 65px rgba(0,0,0,.12);position:relative;overflow:hidden}.sheet:before{content:"";position:absolute;inset:0 0 auto;height:9px;background:linear-gradient(90deg,#1e70bd,#73b9ef)}.head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;border-bottom:1px solid #dfe6e2;padding-bottom:24px}.brand{display:flex;align-items:center;gap:15px}.brand img{width:72px;height:72px;object-fit:contain}.brand h1{margin:0;font-size:28px;color:#1e70bd}.brand p{margin:5px 0 0;color:#63706b}.doc{text-align:right}.doc strong{display:block;font-size:18px}.doc span{display:block;color:#6d7974;margin-top:6px}.title{text-align:center;margin:38px 0 28px}.title h2{font-size:30px;margin:0}.title p{color:#64706b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.box{border:1px solid #dfe6e2;border-radius:12px;padding:15px}.box span{display:block;text-transform:uppercase;font-size:10px;letter-spacing:.08em;color:#75817c;font-weight:700}.box b{display:block;margin-top:6px;font-size:15px}.amount{margin:26px 0;border-radius:15px;padding:22px;background:#f3f8fc;border:1px solid #d6e9f8;display:flex;justify-content:space-between;align-items:center}.amount span{font-weight:700;color:#4e5d57}.amount strong{font-size:30px;color:#1e70bd}.statement{line-height:1.7;color:#46534e;margin:26px 0}.footer{border-top:1px solid #dfe6e2;padding-top:24px;margin-top:34px;display:flex;justify-content:space-between;gap:20px;color:#6d7974;font-size:12px}.actions{width:min(820px,100%);margin:18px auto 0;display:flex;justify-content:flex-end;gap:10px}.actions button,.actions a{border:0;border-radius:10px;padding:12px 16px;font-weight:700;cursor:pointer;text-decoration:none}.actions button{background:#1e70bd;color:white}.actions a{background:white;color:#25302c}@media print{body{background:white}.receipt-page{padding:0}.sheet{box-shadow:none;border-radius:0;width:100%;padding:42px}.actions{display:none}}@media(max-width:650px){.sheet{padding:30px 20px}.head,.footer{flex-direction:column}.doc{text-align:left}.grid{grid-template-columns:1fr}.amount{align-items:flex-start;flex-direction:column;gap:8px}}
      `}</style>
      <section className="sheet">
        <header className="head">
          <div className="brand">
            <img src="/eterniza/assets/pets/brands/logo-eterniza-transparente.png" alt="Eterniza Pets" />
            <div><h1>Eterniza Pets</h1><p>Onde Cada História Vive Para Sempre.</p></div>
          </div>
          <div className="doc"><strong>RECIBO DE PAGAMENTO</strong><span>Nº {invoice.receiptNumber}</span></div>
        </header>

        <div className="title"><h2>Pagamento recebido</h2><p>Comprovante da mensalidade da clínica parceira.</p></div>

        <div className="grid">
          <div className="box"><span>Clínica</span><b>{invoice.clinic.tradeName}</b></div>
          <div className="box"><span>Razão social</span><b>{invoice.clinic.legalName}</b></div>
          <div className="box"><span>CNPJ</span><b>{invoice.clinic.cnpj}</b></div>
          <div className="box"><span>Competência</span><b>{competency(invoice.competency)}</b></div>
          <div className="box"><span>Plano / serviço</span><b>{invoice.description}</b></div>
          <div className="box"><span>Forma de pagamento</span><b>{paymentMethod(invoice.paymentMethod)}</b></div>
          <div className="box"><span>Vencimento</span><b>{date(invoice.dueDate)}</b></div>
          <div className="box"><span>Pagamento</span><b>{date(invoice.paidAt)}</b></div>
        </div>

        <div className="amount"><span>VALOR TOTAL RECEBIDO</span><strong>{money(invoice.amountCents)}</strong></div>

        <p className="statement">Declaramos, para os devidos fins, que recebemos de <strong>{invoice.clinic.legalName}</strong>, inscrita no CNPJ <strong>{invoice.clinic.cnpj}</strong>, o valor acima referente à mensalidade do serviço Eterniza Pets na competência indicada.</p>

        <footer className="footer"><span>Documento emitido eletronicamente pelo Eterniza Pets.</span><span>Emissão: {date(new Date())}</span></footer>
      </section>
      <div className="actions"><a href="/admin">Voltar ao painel</a><PrintButton /></div>
    </main>
  );
}
