import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import PublicPage from '../../../components/normal/PublicPage';
export const dynamic='force-dynamic';
export async function generateMetadata({params}){const tribute=await prisma.tribute.findUnique({where:{slug:params.slug},select:{title:true,status:true,content:true}});if(!tribute||tribute.status!=='PUBLISHED'||tribute.content?.builderVersion!=='2.0')return {title:'Página não encontrada'};return {title:tribute.title,description:tribute.content?.subtitle||'Uma história especial no Eterniza',openGraph:{title:tribute.title,images:tribute.content?.photos?.[0]?.startsWith('https://')?[tribute.content.photos[0]]:[]}};}
export default async function Page({params}){const tribute=await prisma.tribute.findUnique({where:{slug:params.slug},select:{slug:true,status:true,content:true}});if(!tribute||tribute.status!=='PUBLISHED'||tribute.content?.builderVersion!=='2.0')notFound();return <PublicPage content={tribute.content} slug={tribute.slug}/>;}
