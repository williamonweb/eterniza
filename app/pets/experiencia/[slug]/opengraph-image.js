import { ImageResponse } from "next/og";
import { prisma } from "../../../../lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

function firstPhoto(photos) {
  if (!Array.isArray(photos) || !photos.length) return null;

  for (const item of photos) {
    if (typeof item === "string" && item.trim()) return item.trim();

    if (item && typeof item === "object") {
      // As fotos enviadas pelo painel são salvas como { dataUrl, name, ... }.
      // Mantemos também compatibilidade com fotos antigas salvas como url/src.
      const value = item.dataUrl || item.dataURL || item.url || item.src;
      if (typeof value === "string" && value.trim()) return value.trim();
    }
  }

  return null;
}

export default async function Image({ params }) {
  const slug = String(params?.slug || "").trim();
  const experience = await prisma.petExperience.findFirst({
    where: { slug, status: "PUBLISHED", deletedAt: null },
    select: { petName: true, photos: true, themeColor: true, clinic: { select: { tradeName: true, logoUrl: true, primaryColor: true } } },
  }).catch(() => null);

  const petName = String(experience?.petName || "Seu melhor amigo");
  const clinic = experience?.clinic || {};
  const accent = experience?.themeColor || clinic.primaryColor || "#4fa7e8";
  const photo = firstPhoto(experience?.photos);

  return new ImageResponse(
    <div style={{width:"100%",height:"100%",display:"flex",background:"#06111a",color:"white",fontFamily:"Arial, sans-serif",position:"relative",overflow:"hidden"}}>
      <div style={{position:"absolute",inset:0,background:`radial-gradient(circle at 75% 20%, ${accent}55, transparent 42%), linear-gradient(135deg,#06111a 0%,#0a1b28 100%)`}} />
      <div style={{display:"flex",width:"100%",height:"100%",padding:"58px",position:"relative",gap:"46px",alignItems:"center"}}>
        <div style={{display:"flex",flexDirection:"column",width:"56%",height:"100%",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:"16px"}}>
            {clinic.logoUrl ? <img src={clinic.logoUrl} width="70" height="70" style={{objectFit:"contain",borderRadius:"14px",background:"white",padding:"7px"}} /> : <div style={{fontSize:"52px"}}>🐾</div>}
            <div style={{display:"flex",flexDirection:"column"}}>
              <span style={{fontSize:"24px",fontWeight:800}}>{clinic.tradeName || "Eterniza Pets"}</span>
              <span style={{fontSize:"17px",color:"#a9bcc8"}}>Uma homenagem preparada com carinho</span>
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column"}}>
            <span style={{fontSize:"31px",color:"#a9c9dd",marginBottom:"12px"}}>🐾 Uma homenagem para</span>
            <span style={{fontSize:"78px",fontWeight:900,lineHeight:1.02,letterSpacing:"-3px"}}>{petName}</span>
            <div style={{width:"150px",height:"7px",borderRadius:"99px",background:accent,marginTop:"24px"}} />
          </div>
          <div style={{display:"flex",alignItems:"center",gap:"11px",fontSize:"22px",fontWeight:800,color:"#d9e8f0"}}><span>ETERNIZA</span><span style={{color:accent}}>PETS</span></div>
        </div>
        <div style={{width:"44%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
          <div style={{width:"430px",height:"470px",borderRadius:"38px",overflow:"hidden",border:`8px solid ${accent}`,boxShadow:"0 30px 80px rgba(0,0,0,.45)",background:"#102533",display:"flex",alignItems:"center",justifyContent:"center"}}>
            {photo ? <img src={photo} width="430" height="470" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <span style={{fontSize:"130px"}}>🐾</span>}
          </div>
        </div>
      </div>
    </div>,
    size
  );
}
