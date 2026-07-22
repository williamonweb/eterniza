"use client";

import { useMemo, useRef, useState } from "react";

const initial = {
  legalName:"", tradeName:"", cnpj:"", stateRegistration:"", email:"", phone:"", whatsapp:"",
  website:"", instagram:"", zipCode:"", street:"", number:"", complement:"", district:"",
  city:"", state:"", responsibleName:"", responsibleRole:"", responsiblePhone:"",
  responsibleEmail:"", password:"", confirmPassword:"", unitsCount:1, estimatedMonthlyUses:"",
  referralSource:"", accepted:false
};

const digits = (value, max) => String(value || "").replace(/\D/g,"").slice(0,max);
const maskCnpj = value => digits(value,14).replace(/^(\d{2})(\d)/,"$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/,"$1.$2.$3").replace(/\.(\d{3})(\d)/,".$1/$2").replace(/(\d{4})(\d)/,"$1-$2");
const maskPhone = value => {
  const d=digits(value,11);
  return d.length>10?d.replace(/^(\d{2})(\d{5})(\d{0,4}).*/,"($1) $2-$3"):d.replace(/^(\d{2})(\d{4})(\d{0,4}).*/,"($1) $2-$3");
};
const maskCep = value => digits(value,8).replace(/^(\d{5})(\d)/,"$1-$2");

export default function ClinicRegisterPage(){
  const [step,setStep]=useState(1);
  const [form,setForm]=useState(initial);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  const [success,setSuccess]=useState(null);
  const [cepLoading,setCepLoading]=useState(false);
  const [cepMessage,setCepMessage]=useState("");
  const [cnpjLoading,setCnpjLoading]=useState(false);
  const [cnpjMessage,setCnpjMessage]=useState("");
  const numberRef=useRef(null);
  const lastCepRef=useRef("");
  const lastCnpjRef=useRef("");
  const total=4;
  const update=(key,value)=>setForm(current=>({...current,[key]:value}));

  const canContinue=useMemo(()=>{
    if(step===1) return form.legalName&&form.tradeName&&digits(form.cnpj,14).length===14&&form.email.includes("@")&&digits(form.phone,11).length>=10;
    if(step===2) return form.zipCode&&form.street&&form.number&&form.city&&form.state.length===2;
    if(step===3) return form.responsibleName&&form.responsibleEmail.includes("@")&&digits(form.responsiblePhone,11).length>=10&&form.password.length>=6&&form.password===form.confirmPassword;
    return form.accepted;
  },[step,form]);


  async function lookupCnpj(value){
    const cnpj=digits(value,14);

    if(cnpj.length!==14){
      setCnpjMessage("");
      return;
    }

    if(lastCnpjRef.current===cnpj) return;

    setCnpjLoading(true);
    setCnpjMessage("");
    setError("");

    try{
      const response=await fetch(`/api/pets/lookup/cnpj/${cnpj}`,{
        cache:"no-store"
      });
      const data=await response.json().catch(()=>({}));

      if(!response.ok||!data.ok){
        throw new Error(data.message||"CNPJ não encontrado.");
      }

      lastCnpjRef.current=cnpj;

      setForm(current=>({
        ...current,
        cnpj:maskCnpj(cnpj),
        legalName:data.company.legalName||current.legalName,
        tradeName:data.company.tradeName||current.tradeName,
        email:data.company.email||current.email,
        phone:data.company.phone?maskPhone(data.company.phone):current.phone,
        zipCode:data.company.zipCode?maskCep(data.company.zipCode):current.zipCode,
        street:data.company.street||current.street,
        number:data.company.number||current.number,
        complement:data.company.complement||current.complement,
        district:data.company.district||current.district,
        city:data.company.city||current.city,
        state:String(data.company.state||current.state||"").toUpperCase().slice(0,2),
      }));

      setCnpjMessage("Dados da empresa encontrados e preenchidos automaticamente.");
    }catch(err){
      lastCnpjRef.current="";
      setCnpjMessage(err.message||"Não foi possível consultar o CNPJ.");
    }finally{
      setCnpjLoading(false);
    }
  }

  function handleCnpjChange(value){
    const formatted=maskCnpj(value);
    update("cnpj",formatted);

    const cnpj=digits(formatted,14);
    if(cnpj.length<14){
      lastCnpjRef.current="";
      setCnpjMessage("");
      return;
    }

    lookupCnpj(formatted);
  }

  async function lookupCep(value){
    const cep=digits(value,8);

    if(cep.length!==8){
      setCepMessage("");
      return;
    }

    if(lastCepRef.current===cep) return;

    setCepLoading(true);
    setCepMessage("");
    setError("");

    try{
      const response=await fetch(`/api/pets/lookup/cep/${cep}`,{
        cache:"no-store"
      });
      const data=await response.json().catch(()=>({}));

      if(!response.ok||!data.ok){
        throw new Error(data.message||"CEP não encontrado.");
      }

      lastCepRef.current=cep;

      setForm(current=>({
        ...current,
        zipCode:maskCep(cep),
        street:data.address.street||current.street,
        complement:data.address.complement||current.complement,
        district:data.address.district||current.district,
        city:data.address.city||current.city,
        state:String(data.address.state||current.state||"").toUpperCase().slice(0,2),
      }));

      setCepMessage("Endereço encontrado. Informe o número da clínica.");

      setTimeout(()=>{
        numberRef.current?.focus();
      },80);
    }catch(err){
      lastCepRef.current="";
      setCepMessage(err.message||"Não foi possível consultar o CEP.");
    }finally{
      setCepLoading(false);
    }
  }

  function handleCepChange(value){
    const formatted=maskCep(value);
    update("zipCode",formatted);

    const cep=digits(formatted,8);
    if(cep.length<8){
      lastCepRef.current="";
      setCepMessage("");
      return;
    }

    lookupCep(formatted);
  }

  async function submit(){
    setBusy(true);setError("");
    try{
      const response=await fetch("/api/pets/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.ok) throw new Error(data.message||"Não foi possível enviar o cadastro.");
      setSuccess(data);
    }catch(err){setError(err.message||"Erro ao enviar cadastro.");}
    finally{setBusy(false);}
  }

  if(success){
    return <main className="register-page"><Style/><section className="success-card"><img src="/eterniza/assets/pets/eterniza-pets-institucional.png" alt="Eterniza Pets"/><span>Solicitação {success.code}</span><h1>Cadastro enviado!</h1><p>A clínica <b>{form.tradeName}</b> foi encaminhada para análise. O acesso será liberado após aprovação da equipe Eterniza.</p><a href="/pets/login">Ir para o login</a><a className="ghost" href="/pets">Voltar à apresentação</a></section></main>;
  }

  return <main className="register-page"><Style/><div className="register-shell">
    <aside><img src="/eterniza/assets/pets/eterniza-pets-institucional.png" alt="Eterniza Pets"/><small>Cadastro empresarial</small><h1>Leve o Eterniza Pets para sua clínica.</h1><p>Preencha os dados. A solicitação será analisada antes da liberação do acesso.</p><div className="progress"><i style={{width:`${step/total*100}%`}}/></div><b>Etapa {step} de {total}</b></aside>
    <section className="form-card">
      {step===1&&<><Header eyebrow="Empresa" title="Dados da clínica"/><Grid>
        <Field label="Razão social"><input value={form.legalName} onChange={e=>update("legalName",e.target.value)}/></Field>
        <Field label="Nome fantasia"><input value={form.tradeName} onChange={e=>update("tradeName",e.target.value)}/></Field>
        <Field label="CNPJ">
          <div className="lookup-field">
            <input
              value={form.cnpj}
              onChange={e=>handleCnpjChange(e.target.value)}
              onBlur={e=>lookupCnpj(e.target.value)}
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
            />
            {cnpjLoading&&<span className="lookup-loader" aria-hidden="true"></span>}
          </div>
          {(cnpjLoading||cnpjMessage)&&(
            <small className={`lookup-status ${cnpjLoading?"loading":cnpjMessage.startsWith("Dados")?"success":"warning"}`}>
              {cnpjLoading?"Buscando CNPJ...":cnpjMessage}
            </small>
          )}
        </Field>
        <Field label="Inscrição estadual (opcional)"><input value={form.stateRegistration} onChange={e=>update("stateRegistration",e.target.value)}/></Field>
        <Field label="E-mail da clínica"><input type="email" value={form.email} onChange={e=>update("email",e.target.value)}/></Field>
        <Field label="Telefone"><input value={form.phone} onChange={e=>update("phone",maskPhone(e.target.value))} inputMode="tel"/></Field>
        <Field label="WhatsApp (opcional)"><input value={form.whatsapp} onChange={e=>update("whatsapp",maskPhone(e.target.value))} inputMode="tel"/></Field>
        <Field label="Site (opcional)"><input value={form.website} onChange={e=>update("website",e.target.value)}/></Field>
      </Grid></>}
      {step===2&&<><Header eyebrow="Localização" title="Endereço da clínica"/><Grid>
        <Field label="CEP">
          <div className="lookup-field">
            <input
              value={form.zipCode}
              onChange={e=>handleCepChange(e.target.value)}
              onBlur={e=>lookupCep(e.target.value)}
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
            />
            {cepLoading&&<span className="lookup-loader" aria-hidden="true"></span>}
          </div>
          {(cepLoading||cepMessage)&&(
            <small className={`lookup-status ${cepLoading?"loading":cepMessage.startsWith("Endereço")?"success":"warning"}`}>
              {cepLoading?"Buscando CEP...":cepMessage}
            </small>
          )}
        </Field>
        <Field label="Rua"><input value={form.street} onChange={e=>update("street",e.target.value)}/></Field>
        <Field label="Número"><input ref={numberRef} value={form.number} onChange={e=>update("number",e.target.value)}/></Field>
        <Field label="Complemento"><input value={form.complement} onChange={e=>update("complement",e.target.value)}/></Field>
        <Field label="Bairro"><input value={form.district} onChange={e=>update("district",e.target.value)}/></Field>
        <Field label="Cidade"><input value={form.city} onChange={e=>update("city",e.target.value)}/></Field>
        <Field label="Estado"><input value={form.state} onChange={e=>update("state",e.target.value.toUpperCase().slice(0,2))}/></Field>
      </Grid></>}
      {step===3&&<><Header eyebrow="Responsável" title="Acesso administrativo"/><Grid>
        <Field label="Nome completo"><input value={form.responsibleName} onChange={e=>update("responsibleName",e.target.value)}/></Field>
        <Field label="Cargo"><input value={form.responsibleRole} onChange={e=>update("responsibleRole",e.target.value)}/></Field>
        <Field label="Telefone"><input value={form.responsiblePhone} onChange={e=>update("responsiblePhone",maskPhone(e.target.value))}/></Field>
        <Field label="E-mail de acesso"><input type="email" value={form.responsibleEmail} onChange={e=>update("responsibleEmail",e.target.value)}/></Field>
        <Field label="Senha"><input type="password" value={form.password} onChange={e=>update("password",e.target.value)}/></Field>
        <Field label="Confirmar senha"><input type="password" value={form.confirmPassword} onChange={e=>update("confirmPassword",e.target.value)}/></Field>
      </Grid></>}
      {step===4&&<><Header eyebrow="Perfil" title="Últimos detalhes"/><Grid>
        <Field label="Quantidade de unidades"><input type="number" min="1" value={form.unitsCount} onChange={e=>update("unitsCount",e.target.value)}/></Field>
        <Field label="Estimativa de experiências por mês"><input type="number" min="0" value={form.estimatedMonthlyUses} onChange={e=>update("estimatedMonthlyUses",e.target.value)}/></Field>
        <Field label="Como conheceu o Eterniza?"><select value={form.referralSource} onChange={e=>update("referralSource",e.target.value)}><option value="">Selecione</option><option>Indicação</option><option>Instagram</option><option>Google</option><option>Evento</option><option>Outro</option></select></Field>
      </Grid><label className="accept"><input type="checkbox" checked={form.accepted} onChange={e=>update("accepted",e.target.checked)}/><span>Confirmo que os dados são verdadeiros e aceito receber contato da equipe Eterniza.</span></label></>}
      {error&&<div className="error">{error}</div>}
      <div className="actions">{step>1&&<button className="ghost" onClick={()=>setStep(step-1)}>Voltar</button>}<button disabled={!canContinue||busy} onClick={()=>step<total?setStep(step+1):submit()}>{busy?"Enviando...":step<total?"Continuar":"Enviar cadastro para análise"}</button></div>
    </section>
  </div></main>
}
function Header({eyebrow,title}){return <div className="head"><span>{eyebrow}</span><h2>{title}</h2></div>}
function Grid({children}){return <div className="grid">{children}</div>}
function Field({label,children}){return <label className="field"><span>{label}</span>{children}</label>}
function Style(){return <style>{`
*{box-sizing:border-box}body{margin:0}.register-page{min-height:100vh;background:radial-gradient(circle at 20% 10%,rgba(210,166,78,.15),transparent 28%),linear-gradient(135deg,#030a10,#071923);color:#fff;font-family:Inter,Segoe UI,Arial,sans-serif;padding:24px}.register-shell{width:min(1180px,100%);margin:auto;display:grid;grid-template-columns:390px 1fr;border-radius:28px;overflow:hidden;border:1px solid rgba(220,183,108,.18);background:rgba(3,13,20,.9);box-shadow:0 40px 120px rgba(0,0,0,.48)}aside{padding:38px;background:rgba(0,0,0,.2)}aside img{width:100%;border-radius:18px;margin-bottom:24px}aside small,.head span{color:#deb96f;font-weight:1000;text-transform:uppercase;letter-spacing:.08em}aside h1{font:700 42px/1 Georgia,serif;margin:12px 0}aside p{color:#aebfca;line-height:1.55}.progress{height:8px;background:rgba(255,255,255,.08);border-radius:999px;overflow:hidden;margin:30px 0 10px}.progress i{display:block;height:100%;background:linear-gradient(90deg,#a8752d,#efd18a)}.form-card{padding:42px}.head h2{font:700 38px Georgia,serif;margin:8px 0 24px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:15px}.field{display:grid;gap:7px}.field span{font-size:13px;font-weight:900;color:#dbe7ed}.field input,.field select{width:100%;height:51px;border-radius:13px;border:1px solid rgba(255,255,255,.12);background:#07131d;color:#fff;padding:0 14px;font:inherit;outline:none}.field input:focus,.field select:focus{border-color:#d7ad5d;box-shadow:0 0 0 3px rgba(215,173,93,.11)}.lookup-field{position:relative}.lookup-field input{padding-right:46px}.lookup-loader{position:absolute;right:15px;top:50%;width:18px;height:18px;margin-top:-9px;border:2px solid rgba(255,255,255,.18);border-top-color:#efd18a;border-radius:50%;animation:lookupSpin .8s linear infinite}.lookup-status{display:block;margin-top:2px;font-size:12px;line-height:1.35}.lookup-status.loading{color:#d9c08c}.lookup-status.success{color:#8ce0ad}.lookup-status.warning{color:#ffc28c}@keyframes lookupSpin{to{transform:rotate(360deg)}}.accept{display:flex;gap:12px;align-items:flex-start;padding:18px;border-radius:14px;background:rgba(255,255,255,.04);margin-top:20px;color:#c4d1d8;line-height:1.45}.accept input{margin-top:4px}.actions{display:flex;justify-content:flex-end;gap:12px;margin-top:28px}.actions button,.success-card a{min-height:52px;padding:0 22px;border-radius:13px;border:0;background:linear-gradient(135deg,#ad7b31,#efd18a);color:#171008;font-weight:1000;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;text-decoration:none}.actions button:disabled{opacity:.45;cursor:not-allowed}.actions .ghost,.success-card .ghost{background:rgba(255,255,255,.06);color:#fff;border:1px solid rgba(255,255,255,.12)}.error{margin-top:18px;padding:13px;border-radius:12px;background:rgba(255,70,90,.1);border:1px solid rgba(255,70,90,.25);color:#ffbdc4}.success-card{width:min(650px,100%);margin:auto;text-align:center;padding:34px;border-radius:28px;background:#07151f;border:1px solid rgba(220,183,108,.2)}.success-card img{width:100%;border-radius:20px}.success-card span{display:block;color:#dbb86e;font-weight:1000;margin-top:22px}.success-card h1{font:700 48px Georgia,serif;margin:10px}.success-card p{color:#b8c7cf;line-height:1.55}.success-card a{margin:8px}
@media(max-width:850px){.register-shell{grid-template-columns:1fr}aside{display:none}.form-card{padding:28px}}@media(max-width:600px){.register-page{padding:12px}.grid{grid-template-columns:1fr}.actions{flex-direction:column}.actions button{width:100%}}
`}</style>}
