"use client";
import { useEffect, useState } from "react";
export default function CriarClassico(){
  const [allowed,setAllowed]=useState(false);
  useEffect(()=>{fetch('/api/auth/me').then(r=>r.json()).then(data=>{if(!data?.ok) window.location.replace('/login'); else setAllowed(true);}).catch(()=>window.location.replace('/login'));},[]);
  if(!allowed) return <main style={{minHeight:'100vh',background:'#030606'}}/>;
  return <iframe src="/eterniza/index.html?start=recipient&v=73" style={{border:0,width:'100vw',height:'100vh',display:'block'}}/>;
}
