import { prisma } from '../../../lib/prisma';
import PublicPage from '../../../components/normal/PublicPage';
export const dynamic='force-dynamic';
export default async function Presente({params}) {
  const tribute=await prisma.tribute.findUnique({where:{slug:params.slug},select:{slug:true,status:true,content:true}});
  if(tribute?.status==='PUBLISHED'&&tribute.content?.builderVersion==='2.0')return <PublicPage content={tribute.content} slug={tribute.slug}/>;
  const slug=encodeURIComponent(params.slug||'');
  return <iframe title="Página Eterniza" src={`/eterniza/index.html?route=presente&slug=${slug}`} style={{border:0,width:'100vw',height:'100vh',display:'block'}}/>;
}
