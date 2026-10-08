'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Shell from './Shell';

const money = cents => (Number(cents || 0) / 100).toLocaleString('pt-BR', { style:'currency', currency:'BRL' });

export default function Plans() {
  const router = useRouter();
  const id = useSearchParams().get('id');
  const [plans, setPlans] = useState([]);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState('');
  const [adjustPlan, setAdjustPlan] = useState(null);
  const [kept, setKept] = useState([]);
  const photos = Array.isArray(draft?.content?.photos) ? draft.content.photos : [];

  useEffect(() => {
    fetch('/api/plans').then(r => r.json()).then(result => {
      if (result.ok) setPlans(result.plans);
      else setError(result.message);
    }).catch(() => setError('Não foi possível carregar os planos.'));
    if (id) fetch(`/api/tributes/draft?id=${encodeURIComponent(id)}`).then(r => r.json()).then(result => {
      if (result.ok) setDraft(result.tribute);
      else setError(result.message);
    }).catch(() => setError('Não foi possível carregar a página.'));
  }, [id]);

  async function savePlan(plan, selectedPhotos = photos) {
    if (!id) { router.push('/criar'); return; }
    if (!draft || loading) return;
    setError('');
    setLoading(plan.slug);
    try {
      const response = await fetch('/api/tributes/draft', {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ tributeId:id, content:{ ...draft.content, photos:selectedPhotos, plan:{ slug:plan.slug } } }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.message || 'Não foi possível escolher o plano.');
      setDraft(result.tribute);
      router.push(`/pagamento?id=${encodeURIComponent(id)}`);
    } catch (caught) {
      setError(caught.message || 'Erro ao selecionar o plano.');
      setLoading('');
    }
  }

  function choose(plan) {
    if (photos.length > Number(plan.photos)) {
      setKept(photos.map((_, index) => index));
      setAdjustPlan(plan);
      setError('');
      return;
    }
    savePlan(plan);
  }

  function togglePhoto(index) {
    setKept(current => current.includes(index) ? current.filter(item => item !== index) : [...current, index]);
  }

  const overLimit = adjustPlan ? Math.max(0, kept.length - Number(adjustPlan.photos)) : 0;
  return <Shell>
    <span className="normal-kicker">Últimos passos</span>
    <h1 className="normal-heading">Escolha seu plano</h1>
    <p className="normal-subtitle">Sua história será publicada após a confirmação do pagamento. Escolha o plano que combina com o número de fotos da sua página.</p>
    {draft && <p className="normal-hint">Página: <strong>{draft.title}</strong> · {photos.length} fotos selecionadas</p>}
    {error && <p role="alert" className="normal-alert">{error}</p>}
    <div className="normal-plan-grid">{plans.map(plan => {
      const extra = Math.max(0, photos.length - Number(plan.photos));
      return <article className="normal-card normal-plan" key={plan.slug}>
        <span className="normal-pill">{plan.slug === 'premium' ? 'Mais escolhido' : 'Eterniza'}</span>
        <strong>{plan.name}</strong>
        <span className="price">{money(plan.priceCents ?? plan.cents ?? Math.round(Number(plan.price || 0) * 100))}</span>
        <p>{plan.description || 'Para guardar uma história especial.'}</p>
        <p>✓ Até {plan.photos} fotos<br/>✓ Música do YouTube<br/>✓ Página para compartilhar<br/>✓ {plan.duration || 'Confira a duração do plano'}</p>
        {draft && extra > 0 && <p className="normal-plan-extra">Você selecionou {photos.length} fotos. Escolha {plan.photos} para manter neste plano.</p>}
        <button className="normal-button" type="button" disabled={!!loading || (!!id && !draft)} onClick={() => choose(plan)}>{loading === plan.slug ? 'Aguarde…' : extra > 0 ? `Ajustar fotos e escolher ${plan.name}` : `Escolher ${plan.name}`} →</button>
      </article>;
    })}</div>
    {adjustPlan && <div className="normal-photo-adjust-backdrop" role="presentation" onClick={() => !loading && setAdjustPlan(null)}>
      <section className="normal-photo-adjust normal-card" role="dialog" aria-modal="true" aria-labelledby="normal-adjust-title" onClick={event => event.stopPropagation()}>
        <h2 id="normal-adjust-title">Escolha as fotos do plano {adjustPlan.name}</h2>
        <p>Este plano inclui até {adjustPlan.photos} fotos. Toque nas fotos que deseja retirar. As fotos retiradas serão excluídas da página quando você confirmar.</p>
        <p className="normal-adjust-count" role="status">{kept.length} de {adjustPlan.photos} fotos selecionadas{overLimit > 0 ? ` · retire mais ${overLimit}` : ' · pronto para continuar'}</p>
        <div className="normal-adjust-grid">{photos.map((photo, index) => <button key={index} type="button" className={kept.includes(index) ? 'is-kept' : ''} aria-pressed={kept.includes(index)} aria-label={`Foto ${index + 1}: ${kept.includes(index) ? 'manter' : 'retirar'}`} onClick={() => togglePhoto(index)}><img src={photo} alt=""/><span>{kept.includes(index) ? '✓ Manter' : 'Retirar'}</span></button>)}</div>
        <div className="normal-adjust-actions"><button type="button" className="normal-button secondary" disabled={!!loading} onClick={() => setAdjustPlan(null)}>Cancelar</button><button type="button" className="normal-button" disabled={!!loading || overLimit > 0} onClick={() => savePlan(adjustPlan, photos.filter((_, index) => kept.includes(index)))}>{loading ? 'Salvando…' : `Confirmar ${kept.length} fotos e escolher plano`}</button></div>
      </section>
    </div>}
    <p className="normal-hint">Pague com PIX ou cartão de crédito pelo Asaas.</p>
  </Shell>;
}
