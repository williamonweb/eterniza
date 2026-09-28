'use client';
import { useState } from 'react';

export default function HomePopupUpload({ imageUrl, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setError('');
    if (!['image/jpeg','image/png','image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Escolha uma imagem JPG, PNG ou WebP de até 2 MB.'); return;
    }
    setBusy(true);
    try {
      const body = new FormData(); body.append('image', file);
      const response = await fetch('/api/home/popup-image', { method:'POST', body });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'Falha no upload.');
      onChange(result.url);
    } catch (err) { setError(err.message || 'Falha no upload.'); }
    finally { setBusy(false); }
  }
  return <div style={{display:'grid',gap:12}}>
    <label style={{display:'grid',gap:8}}>Enviar imagem do computador
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={busy} />
    </label>
    {busy && <small>Enviando imagem…</small>}
    {error && <small role="alert" style={{color:'#a83131'}}>{error}</small>}
    {imageUrl && <div style={{display:'grid',gap:9}}><img src={imageUrl} alt="Prévia do aviso" style={{maxWidth:300,maxHeight:240,objectFit:'contain',borderRadius:12}} /><button type="button" onClick={()=>onChange('')} style={{justifySelf:'start'}}>Remover imagem do aviso</button></div>}
    <small>Após enviar ou remover, clique em “Salvar configurações” para atualizar o aviso na Home.</small>
  </div>;
}
