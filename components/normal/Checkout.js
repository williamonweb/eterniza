'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Shell from './Shell';

export default function Checkout(){
  const id=useSearchParams().get('id');
  const [draft,setDraft]=useState(null),[cpf,setCpf]=useState(''),[name,setName]=useState(''),[email,setEmail]=useState(''),[coupon,setCoupon]=useState('');
  const [billingType,setBillingType]=useState('PIX'),[payment,setPayment]=useState(null),[hadPayment,setHadPayment]=useState(false);
  const [status,setStatus]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(false),[copied,setCopied]=useState(false);
  useEffect(()=>{
    if(!id)return;
    fetch(`/api/tributes/draft?id=${encodeURIComponent(id)}`).then(r=>r.json()).then(d=>{if(d.ok)setDraft(d.tribute);else setError(d.message)}).catch(()=>setError('Não foi possível abrir sua página.'));
    fetch(`/api/payments/pending?tributeId=${encodeURIComponent(id)}`).then(r=>r.json()).then(d=>{
      if(d.published&&d.slug){window.location.replace(`/p/${encodeURIComponent(d.slug)}`);}
      else if(d.ok&&d.payment){setPayment(d.payment);setHadPayment(true);setBillingType(d.payment.billingType==='CREDIT_CARD'?'CREDIT_CARD':'PIX');setStatus('PENDING');}
    }).catch(()=>{});
  },[id]);
  useEffect(()=>{
    if(!payment?.asaasId||status==='APPROVED')return;
    let active=true;
    async function check(){try{
      const r=await fetch(`/api/payments/status?asaasId=${encodeURIComponent(payment.asaasId)}&tributeId=${encodeURIComponent(id)}`,{cache:'no-store'});
      const d=await r.json();
      if(active&&d.ok){setStatus(d.paymentStatus);if(d.published){setStatus('APPROVED');if(localStorage.getItem('eterniza:normal:draft:guest')===id){localStorage.removeItem('eterniza:normal:draft:guest');localStorage.removeItem('eterniza:normal:content:guest');}window.location.replace(`/p/${encodeURIComponent(d.tribute.slug)}`);}}
    }catch{}}
    check();const timer=setInterval(check,8000);return()=>{active=false;clearInterval(timer)};
  },[payment?.asaasId,id,status]);
  async function pay(e){
    e.preventDefault();setError('');setLoading(true);
    try{
      const r=await fetch('/api/payments/create',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tributeId:id,name,email,cpfCnpj:cpf,couponCode:hadPayment?undefined:coupon.trim()||undefined,billingType})});
      const d=await r.json();if(!r.ok||!d.ok)throw new Error(d.message||'Não foi possível gerar o pagamento.');
      setPayment(d.payment);setHadPayment(true);setStatus('PENDING');
    }catch(err){setError(err.message);}finally{setLoading(false)}
  }
  const card=payment?.billingType==='CREDIT_CARD';
  return <Shell compact><span className="normal-kicker">Pagamento seguro</span><h1 className="normal-heading">Falta pouco para publicar</h1><p className="normal-subtitle">{draft?.title||'Sua página'} · {draft?.plan_name||'Escolha o plano antes de continuar'}</p>
    {error&&<p role="alert" className="normal-alert">{error}</p>}
    {!id?<p className="normal-alert">Comece por <a href="/criar">Criar página</a>.</p>:!draft?<p>Carregando…</p>:!draft.plan_id?<a className="normal-button" href={`/planos?id=${encodeURIComponent(id)}`}>Escolher plano</a>:payment?<div className="normal-card normal-center">
      {card?<><h2>Pague com cartão no Asaas</h2><p>Abra a página segura do Asaas para informar os dados do cartão. Depois, volte aqui: a confirmação será verificada automaticamente.</p>{payment.invoiceUrl?<a className="normal-button" href={payment.invoiceUrl} target="_blank" rel="noopener noreferrer">Abrir pagamento com cartão ↗</a>:<p className="normal-alert">Não foi possível abrir a cobrança. Tente selecionar a forma de pagamento novamente.</p>}</>:<><h2>Seu PIX está pronto</h2><p>Abra o aplicativo do seu banco e escaneie o código ou copie o PIX.</p>{payment.qrCodeBase64&&<img className="normal-qr" src={`data:image/png;base64,${payment.qrCodeBase64}`} alt="QR Code do PIX"/>}{payment.qrCode&&<><div className="normal-copypix">{payment.qrCode}</div><button className="normal-button" type="button" style={{marginTop:14}} onClick={async()=>{await navigator.clipboard.writeText(payment.qrCode);setCopied(true);}}>{copied?'PIX copiado ✓':'Copiar código PIX'}</button></>}</>}
      <p className="normal-hint" aria-live="polite">{status==='APPROVED'?'Pagamento confirmado. Abrindo sua página…':'Após a confirmação, você receberá o link e o QR da página para compartilhar e imprimir.'}</p>
      <button type="button" className="normal-button secondary" onClick={()=>{setBillingType(card?'PIX':'CREDIT_CARD');setPayment(null);setError('')}}>Prefiro pagar com {card?'PIX':'cartão'}</button>
    </div>:<form className="normal-card" onSubmit={pay}><h2 style={{fontFamily:'Georgia,serif',fontWeight:400}}>Escolha como pagar</h2><div className="normal-payment-methods" role="group" aria-label="Forma de pagamento"><button type="button" className={billingType==='PIX'?'selected':''} aria-pressed={billingType==='PIX'} onClick={()=>setBillingType('PIX')}>◇ PIX</button><button type="button" className={billingType==='CREDIT_CARD'?'selected':''} aria-pressed={billingType==='CREDIT_CARD'} onClick={()=>setBillingType('CREDIT_CARD')}>▣ Cartão de crédito</button></div><p className="normal-hint">Sem cadastro. Informe apenas os dados da cobrança. Os dados do cartão serão preenchidos no Asaas.</p>
      <label className="normal-field">Seu nome<input required maxLength={120} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder="Nome completo"/></label><label className="normal-field">Seu e-mail<input required type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@email.com"/></label><label className="normal-field">CPF do titular<input required inputMode="numeric" placeholder="000.000.000-00" value={cpf} onChange={e=>setCpf(e.target.value)} /><small>Usado pelo processador de pagamento para gerar a cobrança.</small></label>
      {!hadPayment&&<label className="normal-field">Cupom de desconto (opcional)<input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Seu cupom"/></label>}
      <button className="normal-button" disabled={loading}>{loading?'Preparando pagamento…':billingType==='PIX'?'Gerar PIX para pagar':'Continuar para o cartão'} →</button><p className="normal-hint">A página será publicada quando o pagamento for confirmado.</p>
    </form>}
  </Shell>;
}
