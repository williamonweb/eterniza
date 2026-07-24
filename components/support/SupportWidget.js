"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
const KEY="eterniza_support_token";
const labels={NEW:"Novo",IN_PROGRESS:"Em atendimento",WAITING_CLIENT:"Aguardando você",CLOSED:"Encerrado"};
function formatMessageDate(value){
 const parsed=new Date(value||0);
 if(Number.isNaN(parsed.getTime()))return "";
 return parsed.toLocaleString("pt-BR",{dateStyle:"short",timeStyle:"short"});
}
export default function SupportWidget(){
 const pathname=usePathname(); const [open,setOpen]=useState(false); const [token,setToken]=useState(""); const [ticket,setTicket]=useState(null); const [form,setForm]=useState({name:"",email:"",phone:"",subject:"",message:""}); const [text,setText]=useState(""); const [busy,setBusy]=useState(false); const end=useRef(null);
 useEffect(()=>{const saved=localStorage.getItem(KEY)||"";setToken(saved)},[]);
 async function load(t=token){if(!t)return;const r=await fetch(`/api/support/tickets/${t}`,{cache:"no-store"});const j=await r.json();if(j.ok)setTicket(j.ticket);else if(r.status===404){localStorage.removeItem(KEY);setToken("")}}
 useEffect(()=>{
  if(!token)return;
  if(open)load(token);
  const source=new EventSource(`/api/support/tickets/${token}/stream`);
  const onUpdate=(event)=>{
   try{
    const payload=JSON.parse(event.data||"{}");
    if(payload.ticket)setTicket(payload.ticket);
   }catch(error){console.error("support realtime",error)}
  };
  source.addEventListener("update",onUpdate);
  source.onerror=()=>{};
  return()=>{source.removeEventListener("update",onUpdate);source.close()};
 },[token,open]);
 useEffect(()=>{
  const node=end.current;
  if(node && typeof node.scrollIntoView==="function"){
    try{node.scrollIntoView({behavior:"smooth",block:"end"})}catch{node.scrollIntoView()}
  }
 },[ticket?.messages?.length,open]);
 if(pathname?.startsWith("/admin"))return null;
 async function create(e){e.preventDefault();setBusy(true);const r=await fetch("/api/support/tickets",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,sourceUrl:location.href})});const j=await r.json();setBusy(false);if(j.ok){localStorage.setItem(KEY,j.accessToken);setToken(j.accessToken);setTicket(j.ticket)}else alert(j.message)}
 async function send(e){e.preventDefault();if(!text.trim())return;setBusy(true);const r=await fetch(`/api/support/tickets/${token}/messages`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text})});const j=await r.json();setBusy(false);if(j.ok){setText("");load()}else alert(j.message)}
 function newTicket(){localStorage.removeItem(KEY);setToken("");setTicket(null);setForm({name:"",email:"",phone:"",subject:"",message:""})}
 return <><style>{css}</style><button className="support-launcher" onClick={()=>setOpen(v=>!v)}>{open?"×":"💬"}<span>Precisa de ajuda?</span></button>{open&&<section className="support-box"><header><div><small>Central de Atendimento · <i>ao vivo</i></small><strong>{ticket?ticket.code:"Eterniza"}</strong></div><button onClick={()=>setOpen(false)}>×</button></header>{!ticket?<form className="support-form" onSubmit={create}><p>Conte para nós como podemos ajudar.</p><input required placeholder="Seu nome" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input placeholder="Telefone" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/><input type="email" placeholder="E-mail" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><input required placeholder="Assunto" value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/><textarea required placeholder="Escreva sua mensagem" value={form.message} onChange={e=>setForm({...form,message:e.target.value})}/><button disabled={busy}>{busy?"Abrindo...":"Iniciar atendimento"}</button></form>:<div className="support-chat"><div className={`support-status ${ticket.status}`}>{labels[ticket.status]}</div><div className="support-messages">{ticket.messages?.map(m=><div key={m.id} className={`support-message ${String(m?.senderType || "SYSTEM").toLowerCase()}`}><small>{m?.senderName || "Eterniza"}</small><p>{m?.text || ""}</p><time>{formatMessageDate(m?.createdAt)}</time></div>)}<div ref={end}/></div>{ticket.status!=="CLOSED"?<form className="support-send" onSubmit={send}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Digite sua mensagem..."/><button disabled={busy}>Enviar</button></form>:<div className="support-closed"><b>✓ {ticket.code} encerrado</b><button onClick={newTicket}>Abrir novo chamado</button></div>}</div>}</section>}</>
}
const css=`.support-launcher{position:fixed;right:22px;bottom:22px;z-index:1000;height:58px;border:0;border-radius:30px;padding:0 20px;background:linear-gradient(135deg,#d8ae62,#f2d795);color:#071018;font-weight:900;box-shadow:0 18px 55px #0008;display:flex;gap:9px;align-items:center}.support-box{position:fixed;right:22px;bottom:92px;z-index:1000;width:min(390px,calc(100vw - 24px));height:min(650px,calc(100vh - 120px));background:#07111a;color:#fff;border:1px solid #ffffff20;border-radius:24px;overflow:hidden;box-shadow:0 30px 100px #000b;font-family:Inter,Arial,sans-serif}.support-box header{height:78px;padding:0 20px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(135deg,#10293c,#091722);border-bottom:1px solid #ffffff12}.support-box header small,.support-box header strong{display:block}.support-box header small{color:#9db3c2}.support-box header small i{color:#79dca0;font-style:normal;font-weight:900}.support-box header button{border:0;background:transparent;color:#fff;font-size:28px}.support-form{padding:20px;display:grid;gap:11px;overflow:auto;height:calc(100% - 78px)}.support-form p{color:#aebfca}.support-form input,.support-form textarea,.support-send textarea{border:1px solid #ffffff18;background:#ffffff09;color:#fff;border-radius:13px;padding:13px;outline:none}.support-form textarea{min-height:100px;resize:vertical}.support-form button,.support-send button,.support-closed button{border:0;border-radius:13px;background:#d8ae62;color:#081018;font-weight:900;min-height:48px}.support-chat{height:calc(100% - 78px);display:flex;flex-direction:column}.support-status{margin:10px auto 0;padding:5px 11px;border-radius:20px;background:#ffffff12;font-size:11px}.support-status.NEW{color:#8de1af}.support-status.CLOSED{color:#aeb9c1}.support-messages{flex:1;overflow:auto;padding:14px}.support-message{max-width:84%;margin:8px 0;padding:10px 12px;border-radius:15px;background:#142737}.support-message.client{margin-left:auto;background:#315f80}.support-message.system{max-width:95%;margin:10px auto;text-align:center;background:#ffffff09;color:#b9c7cf}.support-message small,.support-message time{display:block;font-size:10px;color:#9db1be}.support-message p{margin:5px 0;white-space:pre-wrap}.support-send{display:grid;grid-template-columns:1fr 76px;gap:8px;padding:12px;border-top:1px solid #ffffff12}.support-send textarea{min-height:54px;max-height:100px;resize:none}.support-closed{padding:18px;display:grid;gap:12px;text-align:center;border-top:1px solid #ffffff12}@media(max-width:520px){.support-launcher span{display:none}.support-launcher{width:58px;padding:0;justify-content:center}.support-box{right:12px;bottom:88px}}`;
