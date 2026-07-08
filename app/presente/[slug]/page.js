export default function Presente({ params }) {
  const slug = encodeURIComponent(params.slug || '');
  return <iframe src={`/eterniza/index.html?route=presente&slug=${slug}`} style={{border:0,width:'100vw',height:'100vh',display:'block'}} />;
}
