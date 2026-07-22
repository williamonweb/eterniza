const recipients = [
  {id:'amor', title:'Amor', emoji:'❤️', desc:'Namoro, casamento ou declaração.', theme:'Romântico Premium', className:'theme-amor'},
  {id:'mae', title:'Mãe', emoji:'🌷', desc:'Homenagem delicada e familiar.', theme:'Jardim Afetivo', className:'theme-mae'},
  {id:'pai', title:'Pai', emoji:'🛡️', desc:'Memórias fortes e elegantes.', theme:'Legado Clássico', className:'theme-pai'},
  {id:'irmao', title:'Irmão / Irmã', emoji:'✨', desc:'Carinho, parceria e família.', theme:'Laços de Família', className:'theme-outro'},
  {id:'amigo', title:'Amigo(a)', emoji:'🎉', desc:'Divertido, leve e moderno.', theme:'Memórias Pop', className:'theme-amigo'},
  {id:'filho', title:'Filho(a)', emoji:'🧸', desc:'Fofura, crescimento e amor.', theme:'Mundo Fofo', className:'theme-filho'},
  {id:'avo', title:'Avó / Avô', emoji:'📖', desc:'Álbum vintage de lembranças.', theme:'Álbum de Memórias', className:'theme-avo'},
  {id:'outro', title:'Outra pessoa', emoji:'💫', desc:'Tema versátil e elegante.', theme:'Minimal Chic', className:'theme-outro'}
];

const musicLibrary = [
  {id:'track-wedding-story', cat:'❤️ Romance', title:'Wedding Story', desc:'Trilha cinematográfica para histórias de amor com cara de filme.', src:'assets/audio/romance/wedding-story.mp3', types:['amor','outro']},
  {id:'track-romantic-piano', cat:'❤️ Romance', title:'Romantic Piano', desc:'Piano delicado para declarações íntimas e emocionantes.', src:'assets/audio/romance/romantic-piano.mp3', types:['amor','outro']},
  {id:'track-mothers-day', cat:'🌷 Mãe', title:"Mother's Day Music", desc:'Melodia carinhosa para gratidão, cuidado e homenagem à mãe.', src:'assets/audio/mae/mothers-day.mp3', types:['mae','avo','filho','irmao']},
  {id:'track-cinematic-emotional', cat:'💛 Gratidão', title:'Cinematic Emotional', desc:'Trilha profunda para família, avós, irmãos e homenagens emocionantes.', src:'assets/audio/gratidao/cinematic-emotional.mp3', types:['mae','pai','avo','irmao','filho','outro']},
  {id:'track-heroic', cat:'🛡️ Pai', title:'Heroic', desc:'Trilha inspiradora para pai, legado, força e orgulho.', src:'assets/audio/pai/heroic.mp3', types:['pai','outro']},
  {id:'youtube', cat:'YouTube', title:'Link do YouTube', desc:'Alternativa sem upload. Pode ser bloqueada por alguns navegadores.', src:'', types:['amor','mae','pai','amigo','filho','avo','irmao','outro']}
];
// Busca real no YouTube exige uma chave da YouTube Data API v3.
// Para testar localmente sem backend, a Eterniza usa um catálogo demonstrativo interno.
const YOUTUBE_API_KEY = 'AIzaSyBVAOAwPM_3Z2CRaWlVONFxBiY6YBTDXZk';
const youtubeDemoCatalog = [
  {id:'2Vv-BfVoq4g', title:'Perfect', channel:'Ed Sheeran', thumb:'https://img.youtube.com/vi/2Vv-BfVoq4g/hqdefault.jpg', keywords:'perfect ed sheeran romance amor casamento'},
  {id:'nSDgHBxUbVQ', title:'Photograph', channel:'Ed Sheeran', thumb:'https://img.youtube.com/vi/nSDgHBxUbVQ/hqdefault.jpg', keywords:'photograph ed sheeran foto lembrança romance'},
  {id:'rtOvBOTyX00', title:'A Thousand Years', channel:'Christina Perri', thumb:'https://img.youtube.com/vi/rtOvBOTyX00/hqdefault.jpg', keywords:'a thousand years christina perri casamento amor'},
  {id:'LjhCEhWiKXk', title:'Just The Way You Are', channel:'Bruno Mars', thumb:'https://img.youtube.com/vi/LjhCEhWiKXk/hqdefault.jpg', keywords:'bruno mars just the way you are amor'},
  {id:'450p7goxZqg', title:'All of Me', channel:'John Legend', thumb:'https://img.youtube.com/vi/450p7goxZqg/hqdefault.jpg', keywords:'all of me john legend romance casamento'},
  {id:'lp-EO5I60KA', title:'Thinking Out Loud', channel:'Ed Sheeran', thumb:'https://img.youtube.com/vi/lp-EO5I60KA/hqdefault.jpg', keywords:'thinking out loud ed sheeran romance'},
  {id:'0yW7w8F2TVA', title:'Those Eyes', channel:'New West', thumb:'https://img.youtube.com/vi/0yW7w8F2TVA/hqdefault.jpg', keywords:'those eyes new west home session amor'},
  {id:'kPa7bsKwL-c', title:'Until I Found You', channel:'Stephen Sanchez', thumb:'https://img.youtube.com/vi/kPa7bsKwL-c/hqdefault.jpg', keywords:'until i found you stephen sanchez romance'},
  {id:'YQHsXMglC9A', title:'Hello', channel:'Adele', thumb:'https://img.youtube.com/vi/YQHsXMglC9A/hqdefault.jpg', keywords:'adele hello emocional'},
  {id:'JGwWNGJdvx8', title:'Shape of You', channel:'Ed Sheeran', thumb:'https://img.youtube.com/vi/JGwWNGJdvx8/hqdefault.jpg', keywords:'shape of you ed sheeran alegre'},
  {id:'dQw4w9WgXcQ', title:'Never Gonna Give You Up', channel:'Rick Astley', thumb:'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg', keywords:'rick astley divertido amizade'}
];

function tracksForRecipient(type){
  const list = musicLibrary.filter(t=>t.id!=='youtube' && t.types.includes(type));
  return (list.length?list:musicLibrary.filter(t=>t.id!=='youtube')).concat(musicLibrary.find(t=>t.id==='youtube'));
}
function currentTrack(){return musicLibrary.find(t=>t.id===state.musicMode)}
function renderMusicOptions(){
  const select=$('musicMode'); if(!select) return;
  const type=state.recipient?.id||'outro';
  const tracks=tracksForRecipient(type);
  const selected = state.musicMode && tracks.some(t=>t.id===state.musicMode) ? state.musicMode : tracks[0].id;
  select.innerHTML = tracks.map(t=>`<option value="${t.id}">${t.cat} — ${t.title}</option>`).join('');
  select.value = selected; state.musicMode = selected;
  updateTrackInfo();
}
function updateTrackInfo(){
  const box=$('trackInfo'); if(!box) return;
  const t=currentTrack();
  box.innerHTML = t ? `<strong>${esc(t.title)}</strong><span>${esc(t.desc)}</span>${t.id!=='youtube'?'<button type="button" id="testTrackBtn" class="ghost-btn small">▶ Ouvir prévia</button>':''}` : '';
  const btn=$('testTrackBtn'); if(btn) btn.onclick=()=>previewSelectedTrack(btn);
}
let previewAudio=null, previewTrackId=null, previewPaused=false;
function resetPreviewButton(){
  const b=$('testTrackBtn');
  if(b){ b.textContent='▶ Ouvir prévia'; b.classList.remove('playing'); }
}
function previewSelectedTrack(btn){
  const t=currentTrack(); if(!t || !t.src) return;
  if(previewAudio && previewTrackId===t.id && !previewAudio.paused){
    previewAudio.pause();
    previewPaused=true;
    btn.textContent='▶ Continuar prévia';
    btn.classList.remove('playing');
    return;
  }
  if(previewAudio && previewTrackId===t.id && previewAudio.paused && previewPaused){
    previewAudio.play().then(()=>{btn.textContent='⏸ Pausar prévia'; btn.classList.add('playing');}).catch(()=>showModal('Áudio bloqueado','Clique novamente no botão de prévia para liberar o som.'));
    return;
  }
  if(previewAudio){ previewAudio.pause(); previewAudio.currentTime=0; }
  previewAudio = new Audio(t.src);
  previewTrackId=t.id;
  previewPaused=false;
  previewAudio.volume=.55;
  previewAudio.onended=()=>{ previewPaused=false; resetPreviewButton(); };
  previewAudio.play().then(()=>{btn.textContent='⏸ Pausar prévia'; btn.classList.add('playing');}).catch(()=>showModal('Áudio bloqueado','Clique novamente no botão de prévia para liberar o som.'));
}

let plans = [
  {id:'essencial', slug:'essencial', name:'Essencial', price:'R$ 19,90', cents:1990, photos:2, duration:'1 mês', features:['2 fotos','Música por YouTube','Carta personalizada'], desc:'Para uma homenagem simples e emocionante.'},
  {id:'premium', slug:'premium', name:'Premium', price:'R$ 39,90', cents:3990, photos:10, duration:'vitalício', features:['10 fotos','Música de fundo','Carta personalizada','Contador para casais','Data especial para casais'], desc:'O mais escolhido. História completa com QR Code.'},
  {id:'eterno', slug:'eterno', name:'Eterno', price:'R$ 69,90', cents:6990, photos:20, duration:'vitalício', features:['20 fotos','Música de fundo','Carta personalizada','QR Code','Página vitalícia'], desc:'Experiência completa para eternizar para sempre.'}
];

function formatPlanCurrencyFromCents(cents){
  return (Number(cents || 0) / 100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
}

function defaultPhotosForPlan(plan){
  const slug=String(plan?.slug || plan?.id || '').toLowerCase();
  if(slug==='essencial') return 2;
  if(slug==='eterno') return 20;
  return 10;
}

function planPhotoLimit(plan){
  const configured=Number(plan?.photos);
  return Number.isFinite(configured) && configured>0 ? configured : defaultPhotosForPlan(plan);
}

function normalizeRemotePlan(plan){
  return {
    id: plan.slug || plan.id,
    slug: plan.slug || plan.id,
    name: plan.name,
    price: formatPlanCurrencyFromCents(plan.priceCents || plan.cents),
    cents: Number(plan.priceCents || plan.cents || 0),
    photos: planPhotoLimit(plan),
    duration: plan.duration || 'vitalício',
    features: Array.isArray(plan.features) ? plan.features : [],
    desc: plan.description || plan.desc || '',
    promoActive: !!plan.promoActive,
    promoName: plan.promoName || '',
    regularPriceCents: plan.regularPriceCents || plan.priceCents || plan.cents
  };
}


async function loadDynamicSettings(){
  try{
    const response=await fetch('/api/settings',{cache:'no-store'});
    const data=await response.json().catch(()=>({}));
    if(!response.ok || !data.ok || !data.settings) return;

    const settings=data.settings;
    systemSettings={...systemSettings,...settings};
    const setText=(id,value)=>{
      const element=$(id);
      if(element && value!==undefined && value!==null) element.textContent=String(value);
    };

    setText('landingCompanyName',settings.companyName);
    setText('landingCompanySlogan',settings.slogan);
    setText('landingBadgeText',settings.landingBadge);
    setText('landingTitleBefore',settings.landingTitleBefore);
    setText('landingTitleHighlight',settings.landingTitleHighlight);
    setText('landingSubtitleText',settings.landingSubtitle);

    const promo=$('landingPromoBanner');
    if(promo){
      if(settings.promoBannerEnabled && settings.promoBannerText){
        promo.textContent=settings.promoBannerText;
        promo.classList.remove('hidden');
        promo.style.cssText='margin:0 0 16px;padding:12px 16px;border-radius:14px;border:1px solid rgba(239,189,82,.3);background:rgba(239,189,82,.09);color:#ffe5a2;font-weight:900;text-align:center;';
      }else{
        promo.classList.add('hidden');
      }
    }

    const examples=$('exemplos');
    const plansSection=$('planos');
    const proof=$('como-funciona');
    if(examples) examples.style.display=settings.landingShowExamples===false?'none':'';
    if(plansSection) plansSection.style.display=settings.landingShowPlans===false?'none':'';
    if(proof) proof.style.display=settings.landingShowProof===false?'none':'';

    const aiButton=$('aiTextBtn');
    const aiStyle=$('aiTextStyle');
    if(aiButton){
      aiButton.disabled=settings.aiEnabled===false;
      aiButton.title=settings.aiEnabled===false?'Sugestão de texto desativada pelo administrador':'';
    }
    if(aiStyle && settings.aiDefaultStyle) aiStyle.value=settings.aiDefaultStyle;

    const youtubeOption=$('musicMode')?.querySelector('option[value="youtube"]');
    if(youtubeOption) youtubeOption.disabled=settings.youtubeSearchEnabled===false;
  }catch(error){
    console.warn('Não foi possível carregar configurações públicas.',error);
  }
}

async function loadDynamicPlans(){
  try{
    const res = await fetch('/api/plans', { cache:'no-store' });
    const data = await res.json().catch(()=>({}));
    if(!res.ok || !data.ok || !Array.isArray(data.plans) || !data.plans.length) return;
    plans = data.plans.map(normalizeRemotePlan);
    if(state.plan){
      const updated = plans.find(p=>p.id === state.plan.id || p.slug === state.plan.slug);
      if(updated) state.plan = updated;
    }
    renderPlans();
    renderLandingPlans();
  }catch(error){
    console.warn('Não foi possível carregar planos dinâmicos.', error);
  }
}

const screens=['landingScreen','loginScreen','dashboardScreen','recipientScreen','planScreen','detailsScreen','previewScreen','adminScreen'];
const $=id=>document.getElementById(id);
let state=JSON.parse(localStorage.getItem('giftBuilderState')||'{}');
let orders=JSON.parse(localStorage.getItem('giftOrders')||'[]');
let timer=null, carouselTimer=null, activeFilter='todos', activeAudio=null;
let autosaveTimer=null;
let autosaveBusy=false;
let systemSettings={
  pixEnabled:true,
  pixExpirationMinutes:60,
  checkoutMessage:"Finalize o pagamento para publicar sua homenagem.",
  paymentApprovedMessage:"Pagamento confirmado! Sua homenagem já está disponível.",
  afterPaymentDestination:"dashboard",
  musicEnabled:true,
  musicAutoplay:false,
  musicShowPlayer:true,
  musicDefaultVolume:68,
  youtubeSearchEnabled:true,
  uploadEnabled:true,
  uploadMaxSizeMb:8,
  uploadMaxDimension:1600,
  uploadQualityPercent:82,
  uploadAcceptedFormats:"image/jpeg,image/png,image/webp",
  aiEnabled:true,
  aiDefaultStyle:"emocionante",
  aiMaxCharacters:3000,
  whatsappEnabled:true,
  whatsappTemplate:"Olá, {NOME}! Sua homenagem está pronta: {LINK}"
};
function autosaveToNeon(){
  try{
    const email=(state.userEmail||'').trim().toLowerCase();
    if(!email || state.isAdmin) return;
    if(autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer=setTimeout(async()=>{
      if(autosaveBusy) return;
      autosaveBusy=true;
      try{
        document.body.dataset.autosave='saving';
        const res=await fetch('/api/tributes/draft',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({userEmail:email,tributeId:state.tributeId,content:state})});
        const data=await res.json();
        if(data&&data.ok&&data.tribute){
          state.tributeId=data.tribute.id;
          state.slug=data.tribute.slug||state.slug;
          state.publicUrl=data.tribute.public_url||state.publicUrl;
          persistBuilderState();
          document.body.dataset.autosave='saved';
        }else{
          document.body.dataset.autosave='error';
        }
      }catch(e){document.body.dataset.autosave='error'}finally{autosaveBusy=false}
    },900);
  }catch(e){}
}
function persistBuilderState(){
  try{
    localStorage.setItem('giftBuilderState',JSON.stringify(state));
    return true;
  }catch(error){
    console.warn('Não foi possível salvar todo o rascunho no navegador.',error);
    try{
      const lightweight={...state,photos:[]};
      localStorage.setItem('giftBuilderState',JSON.stringify(lightweight));
    }catch(innerError){
      console.warn('Falha ao salvar estado reduzido.',innerError);
    }
    return false;
  }
}
function saveState(){persistBuilderState(); autosaveToNeon()}
function saveOrders(){localStorage.setItem('giftOrders',JSON.stringify(orders))}
function adminLogout(){
  stopAppMusic();
  state={};
  saveState();
  fetch('/api/auth/logout',{method:'POST'}).finally(()=>navigateTop('/login', true));
}
function showModal(t,m){$('modalTitle').textContent=t;$('modalText').textContent=m;$('modal').classList.remove('hidden')} $('modalOk').onclick=()=>$('modal').classList.add('hidden');

function normalizePhone(value){
  return String(value || '').replace(/\D/g,'').slice(0,11);
}

function formatPhone(value){
  const digits=normalizePhone(value);
  if(digits.length<=10){
    return digits
      .replace(/^(\d{2})(\d)/,'($1) $2')
      .replace(/(\d{4})(\d)/,'$1-$2');
  }
  return digits
    .replace(/^(\d{2})(\d)/,'($1) $2')
    .replace(/(\d{5})(\d)/,'$1-$2');
}

function isValidPhone(value){
  const digits=normalizePhone(value);
  return digits.length===10 || digits.length===11;
}

function normalizeCpf(value){
  return String(value || '').replace(/\D/g,'').slice(0,11);
}

function formatCpf(value){
  const digits=normalizeCpf(value);
  return digits
    .replace(/^(\d{3})(\d)/,'$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/,'$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2}).*$/,'$1.$2.$3-$4');
}

function isValidCpf(value){
  const cpf=normalizeCpf(value);
  if(cpf.length!==11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calculateDigit=(length)=>{
    let sum=0;
    for(let i=0;i<length;i++) sum+=Number(cpf[i])*(length+1-i);
    const rest=(sum*10)%11;
    return rest===10?0:rest;
  };
  return calculateDigit(9)===Number(cpf[9]) && calculateDigit(10)===Number(cpf[10]);
}

function setAuthMode(mode='login'){
  const create=mode==='create';
  $('loginForm')?.classList.toggle('active',!create);
  $('createForm')?.classList.toggle('active',create);
  $('showLoginBtn')?.classList.toggle('active',!create);
  $('showCreateBtn')?.classList.toggle('active',create);
  if($('screenTitle')) $('screenTitle').textContent=create?'Criar conta':'Entrar';
  if($('screenSubtitle')) $('screenSubtitle').textContent=create?'Cadastre seus dados para começar sua homenagem.':'Acesse ou crie sua conta para começar.';
}

async function createAccount(){
  const button=$('createAccountBtn');
  const name=String($('newName')?.value||'').trim();
  const phone=normalizePhone($('newWhatsapp')?.value||'');
  const email=String($('newEmail')?.value||'').trim().toLowerCase();
  const password=String($('newPassword')?.value||'');

  if(!name){
    $('newName')?.focus();
    return showModal('Nome obrigatório','Informe seu nome completo para continuar.');
  }
  if(!isValidPhone(phone)){
    $('newWhatsapp')?.focus();
    return showModal('WhatsApp inválido','Informe um telefone válido com DDD.');
  }
  if(!email || !email.includes('@')){
    $('newEmail')?.focus();
    return showModal('E-mail inválido','Informe um e-mail válido para criar sua conta.');
  }
  if(password.length<6){
    $('newPassword')?.focus();
    return showModal('Senha muito curta','Crie uma senha com pelo menos 6 caracteres.');
  }

  try{
    if(button){button.disabled=true;button.textContent='Criando conta...';}
    const response=await fetch('/api/auth/register',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({name,phone,email,password})
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok || !data.ok) throw new Error(data.message || 'Não foi possível criar sua conta.');

    state={
      ...state,
      userName:data.user?.name || name,
      userEmail:data.user?.email || email,
      userPhone:data.user?.phone || phone,
      isAdmin:false
    };
    saveState();
    showModal('Conta criada','Seu cadastro foi concluído. Agora vamos criar sua homenagem.');
    const modalOk=$('modalOk');
    if(modalOk){
      modalOk.onclick=()=>{
        $('modal').classList.add('hidden');
        navigateTop('/criar',true);
      };
    }
  }catch(error){
    showModal('Não foi possível criar a conta',error.message || 'Tente novamente em instantes.');
  }finally{
    if(button){button.disabled=false;button.textContent='Criar conta e começar';}
  }
}
function go(screen){
  const currentScreen=document.querySelector('.screen.active')?.id || '';
  if(currentScreen && currentScreen!==screen) stopAllMediaPlayback();
  screens.forEach(id=>$(id).classList.remove('active'));
  $(screen).classList.add('active');
  document.body.dataset.screen=screen;
  const m={landingScreen:['Eterniza','Onde Cada História Vive Para Sempre.',0],loginScreen:['Entrar','Acesse ou crie sua conta para começar.',10],dashboardScreen:['Meu painel','Gerencie suas homenagens Eterniza.',16],recipientScreen:['Para quem é?','O tema será escolhido automaticamente.',25],planScreen:['Escolha o plano','Defina fotos, validade e recursos.',42],detailsScreen:['Monte a página','Preencha textos, cores, fotos e música.',68],previewScreen:['Prévia profissional','Confira como o cliente verá.',88],adminScreen:['Painel Jeslie','Gestão de pedidos, clientes, status e links.',100]};
  $('screenTitle').textContent=m[screen][0];
  $('screenSubtitle').textContent=m[screen][1];
  $('progressBar').style.width=m[screen][2]+'%';
  if(screen==='dashboardScreen') renderClientDashboard();
  if(screen!=='previewScreen'&&timer) clearInterval(timer);
}
function renderRecipients(){
  $('recipientGrid').innerHTML = recipients.map(r=>`
    <button class="option-card ${r.className}" data-recipient="${r.id}">
      <span class="option-emoji">${r.emoji}</span>
      <strong>${r.title}</strong>
      <span>${r.desc}</span>
      <em>Tema: ${r.theme}</em>
    </button>
  `).join('');

  document.querySelectorAll('[data-recipient]').forEach(b=>b.onclick=()=>{
    state.recipient = recipients.find(r => r.id === b.dataset.recipient);
    state.plan = null;
    saveState();
    renderPlans();
    go('planScreen');
  });
}

function selectPlan(plan){
  if(!plan) return;
  const max=planPhotoLimit(plan);
  const currentPhotos=Array.isArray(state.photos) ? state.photos.filter(Boolean) : [];
  const removed=Math.max(0,currentPhotos.length-max);

  state.plan={...plan,photos:max};
  state.photos=currentPhotos.slice(0,max);
  saveState();
  prepareDetails();
  go('detailsScreen');

  if(removed>0){
    setTimeout(()=>showModal(
      'Fotos ajustadas ao plano',
      `O plano ${plan.name} permite até ${max} foto(s). ${removed} foto(s) excedente(s) foram removidas.`
    ),80);
  }
}

function renderPlans(){
  $('planGrid').innerHTML=plans.map(p=>{
    const photoLimit=planPhotoLimit(p);
    return `<button class="plan-card" data-plan="${p.id}"><strong>${p.name}</strong>${p.promoActive?`<em class="promo-badge">${esc(p.promoName||'Promoção')}</em>`:''}<div class="price">${p.price}</div>${p.promoActive&&p.regularPriceCents?`<small class="old-price">de ${formatPlanCurrencyFromCents(p.regularPriceCents)}</small>`:''}<p><b>${photoLimit} foto(s)</b> • Online: <b>${p.duration}</b></p><ul>${(p.features||[]).map(f=>`<li>${f}</li>`).join('')}</ul></button>`;
  }).join('');
  document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>selectPlan(plans.find(p=>p.id===b.dataset.plan)));
}
function renderLandingPlans(){
  const row=$('landingPlanRow');
  if(!row || !Array.isArray(plans) || !plans.length) return;
  row.innerHTML=plans.map((plan,index)=>`
    <article class="${plan.id==='premium'?'featured':''}">
      <strong>${esc(plan.name)}</strong>
      ${plan.promoActive?`<em class="promo-badge">${esc(plan.promoName||'Promoção')}</em>`:''}
      <b>${esc(plan.price)}</b>
      ${plan.promoActive&&plan.regularPriceCents?`<small class="old-price">de ${formatPlanCurrencyFromCents(plan.regularPriceCents)}</small>`:''}
      <p>${esc(plan.desc || `${plan.photos} fotos • ${plan.duration}`)}</p>
    </article>
  `).join('');
}
function prepareDetails(){
  const r=state.recipient||recipients[0], p=state.plan;
  if(!p){ renderPlans(); go('planScreen'); return; }
  $('selectedThemeBox').innerHTML=`<strong>${r.theme}</strong><br><span>Tema automático para ${r.title}. Você ainda pode escolher as cores da página.</span>`;
  $('selectedThemeBox').className=`selected-theme ${r.className}`;
  $('primaryColor').value=state.primaryColor||'#ff4f9a';
  $('secondaryColor').value=state.secondaryColor||'#8e5cff';
  renderMusicOptions();
  toggleYoutubeField();
  const dateWrap=$('specialDate')?.closest('div');
  if(dateWrap){dateWrap.style.display = 'block';}
  const dateLabel=$('specialDateLabel');
  if(dateLabel){dateLabel.textContent = dateLabelForRecipient(r.id);}
  const maxPhotos=planPhotoLimit(p);
  state.plan={...p,photos:maxPhotos};
  $('photoLimit').textContent=`Seu plano ${p.name} permite até ${maxPhotos} foto(s). Clique em cada caixa para adicionar uma foto. Não precisa preencher todas.`;
  state.photos = Array.isArray(state.photos) ? state.photos.filter(Boolean).slice(0,maxPhotos) : [];
  saveState();
  renderSlots(maxPhotos);
}
function renderSlots(total=planPhotoLimit(state.plan)){
  const photos=Array.isArray(state.photos)?state.photos:[];
  const slotDescriptions=['O início','O sorriso','O momento especial','A lembrança','O abraço','A viagem','A surpresa','A família','A promessa','O final feliz'];
  $('photoSlots').innerHTML=Array.from({length:total},(_,i)=>{
    const src=photos[i];
    const desc=slotDescriptions[i]||`Momento ${i+1}`;
    return `<div class="photo-slot-item"><button type="button" class="slot ${src?'filled':'empty'}" data-slot="${i}">${src?`<img src="${src}" alt="Foto ${i+1} - ${desc}"><span>Foto ${i+1}</span><b class="slot-remove" data-remove="${i}">×</b>`:`<span>+ Foto ${i+1}</span>`}</button><small class="photo-slot-caption">${desc}</small></div>`;
  }).join('');
  document.querySelectorAll('[data-slot]').forEach(slot=>{
    slot.onclick=(ev)=>{
      if(ev.target.dataset.remove!==undefined) return;
      $('photos').dataset.slot=slot.dataset.slot;
      $('photos').value='';
      $('photos').click();
    };
  });
  document.querySelectorAll('[data-remove]').forEach(btn=>{
    btn.onclick=(ev)=>{
      ev.stopPropagation();
      const idx=Number(btn.dataset.remove);
      state.photos[idx]=null;
      while(state.photos.length && !state.photos[state.photos.length-1]) state.photos.pop();
      saveState();
      renderSlots(total);
    };
  });
}
function compressImageFile(file,{
  maxDimension=Number(systemSettings.uploadMaxDimension||1600),
  quality=Math.min(1,Math.max(.4,Number(systemSettings.uploadQualityPercent||82)/100))
}={}){
  return new Promise((resolve,reject)=>{
    if(systemSettings.uploadEnabled===false){
      reject(new Error('O envio de fotos está temporariamente desativado.'));
      return;
    }
    const accepted=String(systemSettings.uploadAcceptedFormats||'image/jpeg,image/png,image/webp').split(',').map(v=>v.trim()).filter(Boolean);
    if(!file || !accepted.includes(String(file.type||''))){
      reject(new Error('Formato de imagem não permitido.'));
      return;
    }
    const maxBytes=Number(systemSettings.uploadMaxSizeMb||8)*1024*1024;
    if(Number(file.size||0)>maxBytes){
      reject(new Error(`A imagem ultrapassa ${systemSettings.uploadMaxSizeMb||8} MB.`));
      return;
    }

    const reader=new FileReader();
    reader.onerror=()=>reject(new Error('Não foi possível ler a imagem.'));
    reader.onload=()=>{
      const image=new Image();
      image.onerror=()=>reject(new Error('Não foi possível processar a imagem.'));
      image.onload=()=>{
        const originalWidth=image.naturalWidth||image.width;
        const originalHeight=image.naturalHeight||image.height;
        const scale=Math.min(1,maxDimension/Math.max(originalWidth,originalHeight));
        const width=Math.max(1,Math.round(originalWidth*scale));
        const height=Math.max(1,Math.round(originalHeight*scale));
        const canvas=document.createElement('canvas');
        canvas.width=width;
        canvas.height=height;
        const context=canvas.getContext('2d',{alpha:false});
        context.fillStyle='#ffffff';
        context.fillRect(0,0,width,height);
        context.drawImage(image,0,0,width,height);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      image.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function filesToDataUrls(files){
  const selected=[...files];
  const results=[];
  for(const file of selected){
    try{
      results.push(await compressImageFile(file));
    }catch(error){
      console.warn('Imagem ignorada durante a compressão.',error);
    }
  }
  return results;
}
$('photos').addEventListener('change',async()=>{
  const input=$('photos');
  const max=planPhotoLimit(state.plan);

  if(!state.plan || !max){
    return showModal('Plano não encontrado','Escolha um plano antes de adicionar as fotos.');
  }

  const requestedFiles=[...(input.files||[])];
  if(!requestedFiles.length) return;

  document.body.dataset.photoUpload='processing';

  try{
    const chosen=await filesToDataUrls(requestedFiles);
    if(!chosen.length){
      return showModal('Foto não adicionada','Não foi possível processar a imagem escolhida.');
    }

    state.photos=Array.isArray(state.photos)?state.photos:[];
    let slot=Math.max(0,Number(input.dataset.slot||0));
    let added=0;

    chosen.forEach(src=>{
      while(slot<max && state.photos[slot]) slot++;
      if(slot<max){
        state.photos[slot]=src;
        slot++;
        added++;
      }
    });

    state.photos=state.photos.slice(0,max);
    persistBuilderState();
    autosaveToNeon();
    renderSlots(max);

    const rejected=requestedFiles.length-added;
    if(rejected>0){
      showModal(
        'Limite do plano',
        `O plano ${state.plan?.name||''} aceita até ${max} foto(s). ${rejected} foto(s) não foram adicionadas.`
      );
    }
  }finally{
    document.body.dataset.photoUpload='ready';
    input.value='';
  }
});
function youtubeId(value){
  if(!value) return '';
  const raw=String(value).trim();
  if(/^[a-zA-Z0-9_-]{11}$/.test(raw)) return raw;
  try{
    const normalized=/^https?:\/\//i.test(raw)?raw:`https://${raw}`;
    const url=new URL(normalized);
    const host=url.hostname.replace(/^www\./,'').toLowerCase();
    let id='';
    if(host==='youtu.be') id=url.pathname.split('/').filter(Boolean)[0]||'';
    if(['youtube.com','m.youtube.com','music.youtube.com','youtube-nocookie.com'].includes(host)){
      id=url.searchParams.get('v')||'';
      if(!id){
        const parts=url.pathname.split('/').filter(Boolean);
        if(['shorts','embed','live'].includes(parts[0])) id=parts[1]||'';
      }
    }
    return /^[a-zA-Z0-9_-]{11}$/.test(id)?id:'';
  }catch(error){
    return '';
  }
}
function diff(dateValue){if(!dateValue)return null;const start=new Date(dateValue+'T00:00:00'), now=new Date(), ms=Math.max(0,now-start);return{days:Math.floor(ms/864e5),hours:Math.floor(ms/36e5),minutes:Math.floor(ms/6e4),seconds:Math.floor(ms/1e3)%60}}
function yearsMonthsDays(dateValue){
  if(!dateValue) return {years:0,months:0,days:0};
  const start=new Date(dateValue+'T00:00:00'), now=new Date();
  let years=now.getFullYear()-start.getFullYear();
  let months=now.getMonth()-start.getMonth();
  let days=now.getDate()-start.getDate();
  if(days<0){ months--; days+=new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
  if(months<0){ years--; months+=12; }
  return {years:Math.max(0,years),months:Math.max(0,months),days:Math.max(0,days)};
}
function bodasInfo(dateValue){
  if(!dateValue) return null;
  const ymd=yearsMonthsDays(dateValue), totalMonths=ymd.years*12+ymd.months;
  const monthNames=['Beijinhos','Sorvete','Algodão-doce','Pipoca','Chocolate','Pluminha','Purpurina','Pompom','Maternidade','Pintinhos','Chiclete'];
  const yearNames={1:'Papel',2:'Algodão',3:'Trigo',4:'Flores e Frutas',5:'Madeira',6:'Açúcar',7:'Latão',8:'Barro',9:'Cerâmica',10:'Estanho',11:'Aço',12:'Seda',13:'Renda',14:'Marfim',15:'Cristal',20:'Porcelana',25:'Prata',30:'Pérola',35:'Coral',40:'Rubi',45:'Safira',50:'Ouro'};
  if(ymd.years>=1) return {title:`Bodas de ${yearNames[ymd.years]||'Amor'}`,detail:`${ymd.years} ano${ymd.years>1?'s':''}, ${ymd.months} mês${ymd.months!==1?'es':''} e ${ymd.days} dia${ymd.days!==1?'s':''} juntos`};
  return {title:`Bodas de ${monthNames[Math.max(0,totalMonths-1)]||'Carinho'}`,detail:`${totalMonths} mês${totalMonths!==1?'es':''} e ${ymd.days} dia${ymd.days!==1?'s':''} juntos`};
}
function emotionalStats(type,dateValue){
  const d=diff(dateValue); if(!d) return null;
  const days=d.days, weekends=Math.floor(days/7), moons=Math.floor(days/29.53), years=Math.floor(days/365.2425);
  const valentines=countAnnual(dateValue, 5, 12); // junho = 5
  const christmas=countAnnual(dateValue, 11, 25);
  const newYears=countAnnual(dateValue, 0, 1);
  return {days,hours:d.hours,minutes:d.minutes,seconds:d.seconds,weekends,moons,years,valentines,christmas,newYears,bodas:bodasInfo(dateValue)};
}
function countAnnual(dateValue,month,day){
  if(!dateValue) return 0;
  const start=new Date(dateValue+'T00:00:00'), now=new Date();
  let count=0;
  for(let y=start.getFullYear(); y<=now.getFullYear(); y++){
    const dt=new Date(y,month,day);
    if(dt>=start && dt<=now) count++;
  }
  return count;
}

function readPhotos(files,limit){return Promise.all([...files].slice(0,limit).map(f=>new Promise(res=>{const r=new FileReader();r.onload=e=>res(e.target.result);r.readAsDataURL(f)})))}
function aiSuggestion(){
  if(systemSettings.aiEnabled===false){
    return showModal('Recurso indisponível','A sugestão de texto está temporariamente desativada.');
  }
  const r=state.recipient?.id||'outro';
  const recv=($('receiverName')?.value||'você').trim()||'você';
  const send=($('senderName')?.value||'alguém que te ama').trim()||'alguém que te ama';
  const style=($('aiTextStyle')?.value||systemSettings.aiDefaultStyle||'emocionante');
  const base={
    emocionante:`${recv},\n\nExistem pessoas que entram na nossa vida e, sem perceber, passam a fazer parte dos nossos melhores capítulos. Você é uma dessas pessoas. Sua presença transformou momentos simples em lembranças especiais, e cada detalhe vivido ao seu lado merece ser guardado com carinho.\n\nEsta homenagem é uma forma de eternizar tudo aquilo que talvez as palavras do dia a dia não consigam dizer. É sobre gratidão, afeto, saudade boa, cuidado e sobre a importância que você tem na minha história.\n\nQue cada foto, cada música e cada palavra aqui sirva como lembrança de que você é especial, amado(a) e faz diferença de um jeito que o tempo nunca apaga.\n\nCom todo carinho,\n${send}`,
    romantico:`${recv},\n\nDesde que você chegou, muita coisa ganhou outro sentido. Os dias ficaram mais leves, as lembranças ficaram mais bonitas e até os silêncios passaram a ter um jeito especial quando são compartilhados com você.\n\nNossa história é feita de pequenos instantes que, juntos, viraram algo enorme dentro de mim. Um olhar, uma conversa, uma risada, um abraço no momento certo... tudo isso foi construindo um lugar onde eu sempre quero voltar.\n\nEu criei esta homenagem para que você pudesse sentir, mesmo que por alguns minutos, o tamanho do carinho que existe aqui. Que ela te lembre que você é meu cuidado, minha escolha e uma das partes mais bonitas da minha vida.\n\nCom amor,\n${send}`,
    gratidao:`${recv},\n\nHoje eu queria transformar em palavras um pouco da gratidão que sinto por você. Nem sempre a gente consegue dizer tudo no momento certo, mas existem sentimentos que merecem um lugar especial para serem guardados.\n\nVocê representa cuidado, presença, força e amor. Em muitos momentos, mesmo sem perceber, sua existência foi abrigo, inspiração e motivo para seguir em frente. Há pessoas que ensinam, acolhem e marcam a vida da gente para sempre — e você é uma delas.\n\nEsta homenagem é simples perto de tudo que você significa, mas foi feita com sinceridade. Que ela te lembre do quanto sua história importa e do quanto você é amado(a).\n\nCom carinho e gratidão,\n${send}`,
    amizade:`${recv},\n\nAmizade verdadeira é uma daquelas coisas raras que a vida entrega sem fazer alarde. Ela aparece em risadas inesperadas, conversas que salvam o dia, lembranças que viram história e momentos que a gente quer repetir para sempre.\n\nVocê é parte dessas memórias boas. Daquelas pessoas que deixam tudo mais leve, que tornam os dias mais divertidos e que fazem a caminhada valer mais a pena.\n\nEsta homenagem é para lembrar que nossa amizade tem valor, tem história e merece ser celebrada. Que venham ainda muitas risadas, encontros, aventuras e capítulos para contar.\n\nCom carinho,\n${send}`,
    curto:`${recv},\n\nAlgumas pessoas tornam a vida mais bonita apenas por existirem nela. Você é uma dessas pessoas.\n\nEsta homenagem é um pequeno jeito de dizer que sua presença importa, que nossas lembranças têm valor e que você ocupa um lugar especial no meu coração.\n\nCom carinho,\n${send}`
  };
  const recipientSpecific={
    mae:base.gratidao.replace(`${recv},`, 'Mãe,'),
    pai:base.gratidao.replace(`${recv},`, 'Pai,'),
    filho:base.emocionante.replace('sua presença transformou momentos simples em lembranças especiais', 'ver você crescer transformou meus dias em lembranças especiais'),
    amigo:base.amizade,
    irmao:base.gratidao,
    avo:base.gratidao
  };
  const suggestion=recipientSpecific[r] || base[style] || base.emocionante;
  $('letterText').value=suggestion.slice(0,Number(systemSettings.aiMaxCharacters||3000));
  showModal('Texto criado','Criei uma sugestão mais completa. Você pode editar tudo antes de gerar a homenagem.');
}
async function buildPreview(){if(!state.recipient)return showModal('Falta informação','Escolha para quem é a homenagem.');if(!state.plan){renderPlans();go('planScreen');return showModal('Escolha o plano','Selecione um plano antes de continuar.');}state.receiverName=$('receiverName').value.trim();state.senderName=$('senderName').value.trim();state.specialDate=$('specialDate').value;state.musicMode=$('musicMode').value;state.selectedTrack=currentTrack();state.youtubeLink=$('youtubeLink').value.trim();state.letterText=$('letterText').value.trim();state.primaryColor=$('primaryColor').value;state.secondaryColor=$('secondaryColor').value;if(!state.receiverName||!state.senderName||!state.letterText)return showModal('Campos obrigatórios','Preencha quem recebe, quem envia e a carta.');const id=youtubeId(state.youtubeLink);if(state.musicMode==='youtube'&&state.youtubeLink&&!id)return showModal('Link inválido','Cole um link válido do YouTube.');state.youtubeId=state.musicMode==='youtube'?id:'';state.photos=(Array.isArray(state.photos)?state.photos:[]).slice(0,planPhotoLimit(state.plan));saveState();renderPreview();go('previewScreen')}
function esc(txt){return String(txt||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function renderPreview(){
  if(timer) clearInterval(timer);
  if(carouselTimer) clearInterval(carouselTimer);
  const r=state.recipient, p=state.plan, c=diff(state.specialDate), showMoments=!!(state.specialDate&&c);
  const dateLabel=state.specialDate?new Date(state.specialDate+'T00:00:00').toLocaleDateString('pt-BR'):'';
  const photoList=(state.photos||[]).filter(Boolean);
  const storyLines=getStoryLines(r.id,state.receiverName,state.senderName);
  const frames=photoList.map((src,i)=>`<div class="story-frame ${i===0?'active':''}" data-cine="${i}"><img src="${src}" alt="Foto ${i+1}"><span>${storyCaption(r.id,i)}</span></div>`).join('');
  $('giftPreview').className=`gift-preview storytelling ${r.className}`;
  $('giftPreview').style.setProperty('--p',state.primaryColor||'#ff4f9a');
  $('giftPreview').style.setProperty('--s',state.secondaryColor||'#8e5cff');
  $('giftPreview').innerHTML=`
    <section class="story-stage" id="storyStage">
      <div class="story-ambient"></div>
      <div class="story-particles" aria-hidden="true"></div>
      <div class="story-open" id="storyOpen">
        <img class="story-logo" src="assets/brand/logo-eterniza.png" alt="Eterniza" />
        <span class="badge">${esc(r.theme)}</span>
        <h2>${esc(state.receiverName)},<br>você recebeu uma homenagem especial.</h2>
        <p>Criada com carinho por <strong>${esc(state.senderName)}</strong>.</p>
        <button type="button" class="primary-btn story-start" id="startSurprise">❤️ Abrir surpresa</button>
        ${(state.musicMode!=='youtube'&&currentTrack())?`<small>Trilha Eterniza: ${esc(currentTrack().title)}.</small>`:(state.youtubeId?'<small>A música tenta iniciar pelo YouTube nesse clique.</small>':'<small>Sem música informada nesta prévia.</small>')}
      </div>
      <div class="story-content" id="storyContent">
        <div class="story-topbar">
          <span>${esc(r.theme)}</span>
          ${systemSettings.musicShowPlayer!==false&&((state.musicMode!=='youtube'&&currentTrack())||state.youtubeId)?`<button type="button" id="playMusic" class="music-pill">▶ Música</button>`:''}
        </div>
        <div class="eterniza-title-card">
          <div class="hourglass-mark">⌛</div>
          <h1>${esc(r.id==='amor' ? `${state.senderName} e ${state.receiverName}` : state.receiverName)}</h1>
          ${dateLabel?`<p>${dateLabel}</p>`:''}
        </div>
        <div class="story-prologue" id="storyPrologue">
          <small>Eterniza</small>
          <h3 id="storyLine">${esc(storyLines[0])}</h3>
          <div class="countdown" id="storyCountdown">3</div>
        </div>
        <div class="story-photos love-carousel" id="storyPhotos">
          ${frames || `<div class="story-frame active empty"><h3>Sem fotos ainda</h3><p>Adicione fotos para criar o filme da homenagem.</p></div>`}
        </div>
        <div class="story-caption" id="storyCaption">
          <small>${esc(r.title)}</small>
          <h3>${esc(state.receiverName)}</h3>
          <p>${esc(storySubtitle(r.id))}</p>
        </div>
        ${showMoments?momentsPanel(c):''}
        ${p.id==='premium'&&dateLabel?`<p class="story-date"><b>Data especial:</b> ${dateLabel}</p>`:''}
        <article class="story-letter" id="cineLetter"><h3>Uma carta para você</h3><p id="typedLetter"></p></article>
        <div class="story-final" id="cineFinal"><span>${r.emoji}</span><strong>Essa lembrança fica guardada aqui.</strong><em>Com carinho, ${esc(state.senderName)}</em></div>
        ${state.youtubeId?`<section class="story-youtube-player" aria-label="Música da homenagem">
          <div class="story-youtube-copy"><strong>🎵 Música da homenagem</strong><span>Toque no player para ouvir. Alguns celulares exigem esse toque por segurança.</span></div>
          <div class="music-frame-wrap" id="ytHolder"></div>
          <a class="ghost-btn small youtube-open-link" href="https://www.youtube.com/watch?v=${encodeURIComponent(state.youtubeId)}" target="_blank" rel="noopener noreferrer">Abrir no YouTube</a>
        </section>`:''}
      </div>
    </section>`;
  $('orderSummary').innerHTML=`<div class="order-line"><span>Cliente</span><strong>${esc(state.userEmail||'-')}</strong></div><div class="order-line"><span>Para</span><strong>${esc(r.title)}</strong></div><div class="order-line"><span>Tema</span><strong>${esc(r.theme)}</strong></div><div class="order-line"><span>Plano</span><strong>${esc(p.name)}</strong></div><div class="order-line"><span>Valor</span><strong>${esc(p.price)}</strong></div><div class="order-line"><span>Fotos</span><strong>${photoList.length}/${planPhotoLimit(p)}</strong></div><div class="order-line"><span>Validade</span><strong>${esc(p.duration)}</strong></div>`;
  if(showMoments){timer=setInterval(()=>{const nc=diff(state.specialDate);const el=$('liveCounter');if(el)el.innerHTML=liveCounterHtml(nc, r.id)},1000)}
  setTimeout(initStorytelling,100);
}

function dateLabelForRecipient(type){
  return ({
    amor:'Data do início da história',
    filho:'Data de nascimento',
    mae:'Data de nascimento ou data especial',
    pai:'Data de nascimento ou data especial',
    irmao:'Data de nascimento ou data especial',
    amigo:'Data em que se conheceram',
    avo:'Data de nascimento ou data especial',
    outro:'Data especial'
  })[type] || 'Data especial';
}
function fmt(n){return Number(n||0).toLocaleString('pt-BR')}
function liveCounterHtml(c,type){
  const labels = type==='filho' ? ['dias de vida','horas','minutos','segundos'] : type==='amor' ? ['dias','horas','minutos','segundos'] : ['dias de história','horas','minutos','segundos'];
  const icons = type==='filho' ? ['🎂','⏰','⌛','✨'] : type==='amor' ? ['📅','⏰','⌛','✨'] : ['❤️','⏰','⌛','✨'];
  return `<div><i>${icons[0]}</i><strong>${fmt(c.days)}</strong><span>${labels[0]}</span></div><div><i>${icons[1]}</i><strong>${fmt(c.hours)}</strong><span>${labels[1]}</span></div><div><i>${icons[2]}</i><strong>${fmt(c.minutes)}</strong><span>${labels[2]}</span></div><div><i>${icons[3]}</i><strong>${fmt(c.seconds)}</strong><span>${labels[3]}</span></div>`;
}
function countBirthday(dateValue){
  if(!dateValue) return 0;
  const start=new Date(dateValue+'T00:00:00'), now=new Date();
  let count=0;
  for(let y=start.getFullYear(); y<=now.getFullYear(); y++){
    const dt=new Date(y,start.getMonth(),start.getDate());
    if(dt>=start && dt<=now) count++;
  }
  return Math.max(0,count-1);
}
function secondSunday(year,month){
  let d=new Date(year,month,1), sundays=0;
  while(d.getMonth()===month){
    if(d.getDay()===0){sundays++; if(sundays===2) return new Date(d)}
    d.setDate(d.getDate()+1);
  }
  return null;
}
function countSecondSunday(dateValue,month){
  if(!dateValue) return 0;
  const start=new Date(dateValue+'T00:00:00'), now=new Date();
  let count=0;
  for(let y=start.getFullYear(); y<=now.getFullYear(); y++){
    const dt=secondSunday(y,month);
    if(dt && dt>=start && dt<=now) count++;
  }
  return count;
}
function ageText(dateValue){
  const a=yearsMonthsDays(dateValue);
  if(!a) return '';
  const parts=[];
  if(a.years) parts.push(`${a.years} ano${a.years>1?'s':''}`);
  if(a.months) parts.push(`${a.months} mês${a.months>1?'es':''}`);
  if(a.days||!parts.length) parts.push(`${a.days} dia${a.days!==1?'s':''}`);
  return parts.join(', ');
}
function momentStats(type,dateValue){
  const d=diff(dateValue); if(!d) return null;
  const days=d.days, weekends=Math.floor(days/7), moons=Math.floor(days/29.53);
  const christmas=countAnnual(dateValue, 11, 25);
  const newYears=countAnnual(dateValue, 0, 1);
  const birthdays=countBirthday(dateValue);
  const base={days,hours:d.hours,minutes:d.minutes,seconds:d.seconds,weekends,moons,christmas,newYears,birthdays,age:ageText(dateValue),bodas:bodasInfo(dateValue)};
  const map={
    amor:{headline:'Hoje vocês celebram', badge:'💍', title:base.bodas?.title||'Bodas de Amor', detail:base.bodas?.detail||'Uma história especial', facts:[
      ['🤗', days*6, 'abraços estimados'], ['🌙', weekends, 'finais de semana'], ['🌕', moons, 'luas cheias'], ['❤️', countAnnual(dateValue,5,12), 'Dias dos Namorados'], ['🎄', christmas, 'Natais'], ['🎆', newYears, 'Anos Novos'], ['🌅', days, 'amanheceres'], ['🌇', days, 'pores do sol']
    ]},
    filho:{headline:'Desde que chegou ao mundo', badge:'🧸', title:base.age||`${fmt(days)} dias`, detail:`${fmt(days)} dias de amor, cuidado e descobertas`, facts:[
      ['🤗', days*8, 'abraços estimados'], ['🌙', days, 'noites de carinho'], ['📅', weekends, 'finais de semana'], ['🎈', birthdays, 'aniversários'], ['🎄', christmas, 'Natais'], ['☀️', days, 'dias iluminando vidas'], ['👣', Math.max(1,Math.floor(days/30)), 'meses de história'], ['💛', days*3, 'sorrisos estimados']
    ]},
    mae:{headline:'Uma história de cuidado', badge:'🌷', title:`${fmt(days)} dias de amor`, detail:'Carinho, presença e gratidão guardados para sempre', facts:[
      ['🤗', days*4, 'abraços estimados'], ['🌷', countSecondSunday(dateValue,4), 'Dias das Mães'], ['📅', weekends, 'finais de semana'], ['🎂', birthdays, 'aniversários'], ['🎄', christmas, 'Natais'], ['☀️', days, 'amanheceres'], ['💌', Math.max(1,Math.floor(days/30)), 'meses de carinho'], ['❤️', days, 'dias de gratidão']
    ]},
    pai:{headline:'Uma história de presença', badge:'🛡️', title:`${fmt(days)} dias de história`, detail:'Força, exemplo e lembranças que permanecem', facts:[
      ['🤝', days*2, 'conselhos estimados'], ['👔', countSecondSunday(dateValue,7), 'Dias dos Pais'], ['📅', weekends, 'finais de semana'], ['🎂', birthdays, 'aniversários'], ['🎄', christmas, 'Natais'], ['🌅', days, 'amanheceres'], ['🛡️', Math.max(1,Math.floor(days/365)), 'anos de legado'], ['❤️', days, 'dias de admiração']
    ]},
    irmao:{headline:'Laços que o tempo guarda', badge:'✨', title:`${fmt(days)} dias de parceria`, detail:'Família, risadas e memórias lado a lado', facts:[
      ['😂', days*5, 'risadas estimadas'], ['🏠', days, 'dias de família'], ['📅', weekends, 'finais de semana'], ['🎂', birthdays, 'aniversários'], ['🎄', christmas, 'Natais'], ['📸', Math.max(1,Math.floor(days/14)), 'memórias estimadas'], ['🤗', days*3, 'abraços estimados'], ['✨', moons, 'luas cheias']
    ]},
    amigo:{headline:'Amizade também é história', badge:'🎉', title:`${fmt(days)} dias de amizade`, detail:'Risadas, parceria e momentos para lembrar', facts:[
      ['😂', days*6, 'risadas estimadas'], ['📸', Math.max(1,Math.floor(days/7)), 'memórias especiais'], ['📅', weekends, 'finais de semana'], ['🎂', birthdays, 'aniversários de amizade'], ['🎄', christmas, 'Natais'], ['⭐', moons, 'luas cheias'], ['🎉', Math.max(1,Math.floor(days/30)), 'meses de histórias'], ['🤝', days, 'dias de parceria']
    ]},
    avo:{headline:'Memórias que abraçam', badge:'📖', title:`${fmt(days)} dias de lembranças`, detail:'Afeto, histórias e carinho atravessando o tempo', facts:[
      ['🤗', days*4, 'abraços estimados'], ['📖', Math.max(1,Math.floor(days/10)), 'histórias contadas'], ['📅', weekends, 'finais de semana'], ['🎂', birthdays, 'aniversários'], ['🎄', christmas, 'Natais'], ['☕', Math.max(1,Math.floor(days/30)), 'meses de afeto'], ['❤️', days, 'dias de carinho'], ['🌙', moons, 'luas cheias']
    ]}
  };
  return map[type] || {headline:'Uma data especial', badge:'💫', title:`${fmt(days)} dias`, detail:'Uma história guardada com carinho', facts:[['🤗',days*3,'abraços estimados'],['📅',weekends,'finais de semana'],['🎂',birthdays,'aniversários'],['🎄',christmas,'Natais'],['🌙',moons,'luas cheias'],['❤️',days,'dias de carinho']]};
}
function momentsPanel(c){
  const st=momentStats(state.recipient?.id,state.specialDate);
  if(!st) return '';
  return `<section class="relationship-panel moments-panel">
    <div class="bodas-card"><i class="boda-icon">${st.badge}</i><small>${esc(st.headline)}</small><strong>${esc(st.title)}</strong><span>${esc(st.detail)}</span></div>
    <div class="counter story-counter" id="liveCounter">${liveCounterHtml(c,state.recipient?.id)}</div>
    <div class="love-facts">
      ${st.facts.map(f=>`<div><i>${f[0]}</i><b>${fmt(f[1])}</b><span>${esc(f[2])}</span></div>`).join('')}
    </div>
  </section>`;
}
function relationshipPanel(c){return momentsPanel(c)}
function getStoryLines(type,recv,send){
  const base={
    amor:[`Nem toda história cabe em palavras.`,`Mas algumas merecem virar lembrança.`,`Hoje, ${recv}, essa é a sua.`],
    mae:[`Existe amor que cuida sem pedir nada.`,`Existe presença que vira casa.`,`Mãe, essa homenagem é para você.`],
    pai:[`Algumas histórias são feitas de força.`,`De presença, caminho e memória.`,`Pai, essa lembrança é sua.`],
    amigo:[`Tem amizade que vira parte da vida.`,`Risadas, histórias e momentos.`,`${recv}, essa é para você.`],
    filho:[`O tempo passa depressa.`,`Mas algumas lembranças ficam para sempre.`,`${recv}, este carinho é seu.`],
    avo:[`A memória também é uma forma de abraço.`,`Cada detalhe guarda um pedaço da história.`,`Esta homenagem é para você.`]
  };
  return base[type]||[`Algumas pessoas tornam a vida mais bonita.`,`E merecem uma lembrança especial.`,`${recv}, essa homenagem é sua.`];
}
function storySubtitle(type){return ({amor:'Uma declaração em forma de filme, foto e música.',mae:'Gratidão, carinho e memórias em uma homenagem delicada.',pai:'Uma lembrança elegante para quem marcou a história.',amigo:'Momentos leves, risadas e amizade verdadeira.',filho:'Uma homenagem doce para guardar o tempo e o carinho.',avo:'Um álbum afetivo com alma de lembrança antiga.'})[type]||'Uma homenagem criada para emocionar.'}
function storyCaption(type,i){const sets={amor:['O começo','Nosso instante','O sorriso','A lembrança','Para sempre'],mae:['Cuidado','Abraço','Gratidão','Memória','Amor'],pai:['Força','Caminho','Presença','História','Legado'],amigo:['Risada','Parceria','Memória','Aventura','Amizade']};const arr=sets[type]||['Memória','Carinho','História','Momento','Lembrança'];return arr[i%arr.length]}
function scrollStoryToPhotos(){
  const target=$('storyPhotos');
  if(!target) return;
  target.scrollIntoView({behavior:'smooth', block:'start'});
  document.querySelectorAll('.story-caption,.relationship-panel,.story-letter,.story-final').forEach((el,i)=>{
    el.classList.add('scroll-reveal');
    setTimeout(()=>el.classList.add('visible'), 500 + i*220);
  });
}
function initStorytelling(){
  const open=$('storyOpen'), content=$('storyContent'), start=$('startSurprise');
  if(!start) return;
  let started=false;
  start.onclick=()=>{
    if(started) return; started=true;

    start.disabled=true;
    start.setAttribute('aria-busy','true');

    const prologue=$('storyPrologue');
    const scrollToPrologue=()=>{
      try{
        if(prologue){
          prologue.scrollIntoView({behavior:'smooth',block:'start'});
        }else if(content){
          content.scrollIntoView({behavior:'smooth',block:'start'});
        }
      }catch(error){
        if(prologue){
          window.scrollTo(0,prologue.getBoundingClientRect().top + window.scrollY);
        }
      }
    };

    startMusic(false);
    open.classList.add('hide');

    setTimeout(()=>{
      content.classList.add('show');

      requestAnimationFrame(()=>{
        scrollToPrologue();
        setTimeout(scrollToPrologue,220);
      });

      setTimeout(()=>{
        open.style.display='none';
        runPrologue();

        setTimeout(()=>{
          runCineSlides();
          scrollStoryToPhotos();
        },11200);

        setTimeout(typeLetter,13800);
      },520);
    },420);
  };
  initMusic();
  if(systemSettings.musicAutoplay===true){
    setTimeout(()=>startMusic(false),350);
  }
}
function runPrologue(){
  const lines=getStoryLines(state.recipient.id,state.receiverName,state.senderName);
  const lineEl=$('storyLine'), countEl=$('storyCountdown'), prologue=$('storyPrologue');
  let i=0;
  const swapLine=()=>{ if(lineEl){ lineEl.classList.remove('show'); setTimeout(()=>{lineEl.textContent=lines[i]||lines[lines.length-1]; lineEl.classList.add('show'); i++;},120);} };
  // Ritmo mais elegante: cada frase permanece tempo suficiente para leitura.
  swapLine();
  setTimeout(swapLine,3200);
  setTimeout(swapLine,6400);
  let n=3;
  if(countEl){
    countEl.textContent='';
    setTimeout(()=>{
      countEl.textContent=n;
      const cInt=setInterval(()=>{
        n--;
        countEl.textContent=n>0?n:'❤️';
        if(n<=0) clearInterval(cInt);
      },1000);
    },8300);
  }
  setTimeout(()=>{ if(prologue) prologue.classList.add('finish'); },10600);
}
function runCineSlides(){
  const slides=[...document.querySelectorAll('.story-frame')];
  if(!slides.length) return;
  let index=0;
  const show=()=>{
    const total=slides.length;
    slides.forEach((el,n)=>{
      el.classList.remove('active','prev','next','far');
      if(n===index) el.classList.add('active');
      else if(n===(index-1+total)%total) el.classList.add('prev');
      else if(n===(index+1)%total) el.classList.add('next');
      else el.classList.add('far');
    });
    index=(index+1)%total;
  };
  show();
  if(carouselTimer) clearInterval(carouselTimer);
  carouselTimer=setInterval(show,4300);
}
function typeLetter(){
  const el=$('typedLetter'); if(!el) return;
  const letter=$('cineLetter'); if(letter) letter.classList.add('show');
  const text=state.letterText||'';
  el.textContent='';
  let i=0;
  const speed=Math.max(10, Math.min(26, 1400/Math.max(30,text.length)));
  const write=()=>{ el.textContent=text.slice(0,i++); if(i<=text.length) setTimeout(write,speed); else {const final=$('cineFinal'); if(final) setTimeout(()=>final.classList.add('show'),600);} };
  write();
}


function toggleYoutubeField(){
  const mode=$('musicMode')?.value || 'track-wedding-story';
  const show=mode==='youtube';
  if($('youtubeLink')) $('youtubeLink').style.display=show?'block':'none';
  if($('youtubeLabel')) $('youtubeLabel').style.display=show?'block':'none';
  if($('youtubeSearchBox')) $('youtubeSearchBox').style.display=show?'block':'none';
  if(!show){
    stopYoutubePreview({removeFrame:true});
    setYoutubeSearchCollapsed(false);
  }
  state.musicMode=mode;
  updateTrackInfo();
  if(show) setTimeout(restoreYoutubeSelection,0);
}
function stopAppMusic(){
  if(activeAudio){
    try{activeAudio.pause(); activeAudio.currentTime=0;}catch(e){}
    activeAudio=null;
  }
}
function startAppMusic(){
  if(systemSettings.musicEnabled===false) return false;
  stopAppMusic();
  const t=currentTrack();
  if(!t || !t.src) return false;
  activeAudio = new Audio(t.src);
  activeAudio.loop = true;
  activeAudio.volume = 0;
  const fadeTarget = Math.min(1,Math.max(0,Number(systemSettings.musicDefaultVolume||68)/100));
  const fade = setInterval(()=>{
    if(!activeAudio){clearInterval(fade);return;}
    activeAudio.volume = Math.min(fadeTarget, activeAudio.volume + .035);
    if(activeAudio.volume>=fadeTarget) clearInterval(fade);
  },120);
  activeAudio.play().catch(()=>{
    const b=$('playMusic');
    if(b){b.textContent='▶ Tocar música'; b.classList.remove('playing');}
    showModal('Música bloqueada','O navegador bloqueou o áudio. Clique no botão “Música” ou em “Abrir surpresa” novamente.');
  });
  return true;
}
function youtubeEmbedSrc({autoplay=false}={}){
  if(!state.youtubeId) return '';
  const params=new URLSearchParams({
    autoplay:autoplay?'1':'0', mute:'0', controls:'1', rel:'0', modestbranding:'1', playsinline:'1', enablejsapi:'1', fs:'1', iv_load_policy:'3'
  });
  if(location.protocol.startsWith('http')) params.set('origin',location.origin);
  return `https://www.youtube.com/embed/${state.youtubeId}?${params.toString()}`;
}
function createYoutubeFrame({autoplay=false}={}){
  const holder=$('ytHolder');
  if(!holder||!state.youtubeId) return null;
  let frame=$('ytFrame');
  if(frame){
    if(autoplay && !frame.dataset.autoplayRequested){
      frame.dataset.autoplayRequested='1';
      frame.src=youtubeEmbedSrc({autoplay:true});
    }
    return frame;
  }
  frame=document.createElement('iframe');
  frame.id='ytFrame';
  frame.title='Música da homenagem no YouTube';
  frame.src=youtubeEmbedSrc({autoplay});
  frame.loading='eager';
  frame.dataset.autoplayRequested=autoplay?'1':'';
  frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture; fullscreen');
  frame.setAttribute('allowfullscreen','');
  frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  holder.innerHTML='';
  holder.appendChild(frame);
  return frame;
}
function commandYoutube(frame,func,args=''){
  try{frame.contentWindow.postMessage(JSON.stringify({event:'command',func,args}),'*')}catch(e){}
}
function startMusic(showMsg=true){
  const mode=state.musicMode||'app-romantica';
  const b=$('playMusic');
  if(mode !== 'youtube'){
    const ok=startAppMusic();
    if(b){b.textContent= ok ? '♫ Música ligada' : '▶ Tocar música'; b.classList.toggle('playing',!!ok)}
    if(showMsg&&!ok) showModal('Música de fundo','O navegador bloqueou o áudio. Toque novamente em “Tocar música”.');
    return;
  }
  if(!state.youtubeId) return;
  stopAppMusic();
  const frame=createYoutubeFrame({autoplay:true});
  if(!frame) return;
  if(b){b.textContent='♫ Música pronta'; b.classList.add('playing')}
  const tryPlay=()=>{commandYoutube(frame,'unMute');commandYoutube(frame,'setVolume',[100]);commandYoutube(frame,'playVideo')};
  tryPlay();
  setTimeout(tryPlay,250);
  setTimeout(tryPlay,900);
  const playerBox=document.querySelector('.story-youtube-player');
  if(playerBox) playerBox.classList.add('active');
  if(showMsg){
    showModal('Música pronta','A música foi carregada. Caso o celular não inicie sozinho, toque no botão ▶ dentro do player exibido na homenagem.');
  }
}
function initMusic(){
  const b=$('playMusic');
  if(!b) return;
  b.onclick=()=>startMusic(true);
}

let youtubePreviewFrame=null, youtubePreviewPlaying=false, youtubePreviewLoadedId='', selectedYoutubeResult=null;
function youtubePreviewSrc(id){
  const params=new URLSearchParams({autoplay:'0', mute:'0', controls:'0', rel:'0', modestbranding:'1', playsinline:'1', enablejsapi:'1', fs:'0', iv_load_policy:'3'});
  if(location.protocol.startsWith('http')) params.set('origin',location.origin);
  return `https://www.youtube.com/embed/${id}?${params.toString()}`;
}
function stopYoutubePreview({removeFrame=false}={}){
  if(youtubePreviewFrame){
    commandYoutube(youtubePreviewFrame,'pauseVideo');
    commandYoutube(youtubePreviewFrame,'stopVideo');
    if(removeFrame){
      try{youtubePreviewFrame.remove();}catch(e){}
      youtubePreviewFrame=null;
    }
  }
  youtubePreviewPlaying=false;
  const btn=$('youtubePlayPauseBtn');
  if(btn){btn.textContent='▶ Play prévia'; btn.disabled=!youtubePreviewLoadedId; btn.classList.remove('playing');}
}
function stopInternalTrackPreview(){
  if(previewAudio){
    try{previewAudio.pause(); previewAudio.currentTime=0;}catch(e){}
  }
  previewAudio=null;
  previewTrackId=null;
  previewPaused=false;
  resetPreviewButton();
}
function stopAllMediaPlayback(){
  stopInternalTrackPreview();
  stopYoutubePreview({removeFrame:true});
  stopAppMusic();
  const storyFrame=$('ytFrame');
  if(storyFrame){
    commandYoutube(storyFrame,'pauseVideo');
    commandYoutube(storyFrame,'stopVideo');
    try{storyFrame.remove();}catch(e){}
  }
}
function formatDuration(seconds){
  if(!seconds) return '';
  const h=Math.floor(seconds/3600), m=Math.floor((seconds%3600)/60), sec=seconds%60;
  return h ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
}
function parseYoutubeDuration(iso){
  if(!iso) return 0;
  const m=iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if(!m) return 0;
  return (Number(m[1]||0)*3600)+(Number(m[2]||0)*60)+Number(m[3]||0);
}
function renderYoutubeResults(items){
  const box=$('youtubeSearchResults');
  if(!box) return;
  if(!items.length){
    box.innerHTML='<div class="youtube-empty">Nenhum resultado compatível encontrado. Tente buscar por “piano”, “lyrics”, “acoustic” ou outro artista.</div>';
    return;
  }
  box.innerHTML = items.map(v=>`
    <button type="button" class="youtube-result-card ${v.compatible?'yt-compatible':'yt-maybe'}" data-ytid="${esc(v.id)}">
      <img src="${esc(v.thumb)}" alt="">
      <span>
        <strong>${esc(v.title)}</strong>
        <small>${esc(v.channel)}${v.duration?` • ${esc(v.duration)}`:''}</small>
        <b class="yt-badge">${v.compatible?'✓ Compatível com a Eterniza':'⚠ Pode bloquear'}</b>
      </span>
      <em>Escolher</em>
    </button>
  `).join('');
  document.querySelectorAll('[data-ytid]').forEach(btn=>btn.onclick=()=>{
    const item=items.find(x=>x.id===btn.dataset.ytid);
    if(item) selectYoutubeResult(item);
  });
}
function showMusicToast(message='Música selecionada com sucesso!'){
  let toast=document.getElementById('eternizaMusicToast');
  if(!toast){
    toast=document.createElement('div');
    toast.id='eternizaMusicToast';
    toast.className='eterniza-music-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML=`<span>✓</span><strong>${esc(message)}</strong>`;
  toast.classList.add('show');
  clearTimeout(showMusicToast.timer);
  showMusicToast.timer=setTimeout(()=>toast.classList.remove('show'),2200);
}
function setYoutubeSearchCollapsed(collapsed){
  const box=$('youtubeSearchBox');
  if(!box) return;
  box.classList.toggle('youtube-search-collapsed',!!collapsed);
  ['youtubeSearchResults','youtubePreviewHolder'].forEach(id=>{
    const el=$(id); if(el) el.style.display=collapsed?'none':'';
  });
  const row=box.querySelector('.youtube-search-row');
  const head=box.querySelector('.youtube-search-head');
  const actions=box.querySelector('.youtube-preview-actions');
  if(row) row.style.display=collapsed?'none':'';
  if(head) head.style.display=collapsed?'none':'';
  // Mantém o botão de prévia visível depois que a música é selecionada.
  if(actions) actions.style.display='';
}
function renderSelectedYoutubeCard(item){
  const selected=$('youtubeSelectedBox');
  if(!selected) return;
  selected.classList.remove('hidden');
  selected.innerHTML=`
    <img src="${esc(item.thumb||`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`)}" alt="Capa da música ${esc(item.title||'selecionada')}">
    <div class="youtube-selected-copy">
      <small>✓ Música selecionada</small>
      <strong>${esc(item.title||'Música do YouTube')}</strong>
      <span>${esc(item.channel||'YouTube')}</span>
    </div>
    <div class="youtube-selected-actions">
      <button type="button" class="ghost-btn small" id="changeYoutubeMusicBtn">Trocar música</button>
      <button type="button" class="ghost-btn small danger" id="removeYoutubeMusicBtn">Remover</button>
    </div>`;
  const change=$('changeYoutubeMusicBtn');
  if(change) change.onclick=()=>{
    stopYoutubePreview({removeFrame:true});
    setYoutubeSearchCollapsed(false);
    const search=$('youtubeSearch');
    if(search){search.value=''; setTimeout(()=>search.focus(),80);}
    const results=$('youtubeSearchResults');
    if(results) results.innerHTML='';
  };
  const remove=$('removeYoutubeMusicBtn');
  if(remove) remove.onclick=removeYoutubeSelection;
}
function removeYoutubeSelection(){
  stopYoutubePreview({removeFrame:true});
  selectedYoutubeResult=null;
  youtubePreviewLoadedId='';
  state.youtubeId='';
  state.youtubeLink='';
  state.youtubeSelection=null;
  if($('youtubeLink')) $('youtubeLink').value='';
  const selected=$('youtubeSelectedBox');
  if(selected){selected.classList.add('hidden'); selected.innerHTML='';}
  setYoutubeSearchCollapsed(false);
  saveState();
  showMusicToast('Música removida.');
  setTimeout(()=>$('youtubeSearch')?.focus(),80);
}
function restoreYoutubeSelection(){
  const item=state.youtubeSelection || (state.youtubeId ? {
    id:state.youtubeId,
    title:'Música selecionada',
    channel:'YouTube',
    thumb:`https://img.youtube.com/vi/${state.youtubeId}/hqdefault.jpg`
  } : null);
  if(!item) return;
  selectedYoutubeResult=item;
  renderSelectedYoutubeCard(item);
  setYoutubeSearchCollapsed(true);
  youtubePreviewLoadedId=item.id;
}
function selectYoutubeResult(item){
  if(!item?.id) return;
  stopAllMediaPlayback();
  selectedYoutubeResult=item;
  state.youtubeId=item.id;
  state.youtubeLink=`https://www.youtube.com/watch?v=${item.id}`;
  state.youtubeSelection={
    id:item.id,
    title:item.title||'Música do YouTube',
    channel:item.channel||'YouTube',
    thumb:item.thumb||`https://img.youtube.com/vi/${item.id}/hqdefault.jpg`
  };
  if($('youtubeLink')) $('youtubeLink').value=state.youtubeLink;
  renderSelectedYoutubeCard(state.youtubeSelection);
  youtubePreviewLoadedId=item.id;
  const previewButton=$('youtubePlayPauseBtn');
  if(previewButton){
    previewButton.disabled=false;
    previewButton.textContent='▶ Tocar prévia';
    previewButton.classList.remove('playing');
  }
  saveState();
  const chosen=document.querySelector(`[data-ytid="${CSS.escape(item.id)}"]`);
  if(chosen){chosen.classList.add('youtube-result-selected'); const label=chosen.querySelector('em'); if(label) label.textContent='✓ Selecionada';}
  setTimeout(()=>{
    setYoutubeSearchCollapsed(true);
    showMusicToast('Música selecionada com sucesso!');
  },220);
}
async function searchYoutube(){
  const q=($('youtubeSearch')?.value||'').trim();
  if(!q) return showModal('Buscar música','Digite o nome da música ou artista.');
  const box=$('youtubeSearchResults');
  if(box) box.innerHTML='<div class="youtube-empty">Buscando músicas...</div>';
  if(YOUTUBE_API_KEY){
    try{
      const params=new URLSearchParams({
        part:'snippet', type:'video', maxResults:'12', q,
        videoEmbeddable:'true', videoSyndicated:'true', safeSearch:'none', key:YOUTUBE_API_KEY
      });
      const url=`https://www.googleapis.com/youtube/v3/search?${params.toString()}`;
      const res=await fetch(url);
      if(!res.ok) throw new Error('youtube');
      const data=await res.json();
      let items=(data.items||[]).filter(it=>it.id?.videoId).map(it=>({
        id:it.id.videoId,
        title:it.snippet.title,
        channel:it.snippet.channelTitle,
        thumb:it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${it.id.videoId}/hqdefault.jpg`,
        duration:'', compatible:true
      }));
      const ids=items.map(i=>i.id).join(',');
      if(ids){
        try{
          const dres=await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id=${ids}&key=${YOUTUBE_API_KEY}`);
          if(dres.ok){
            const ddata=await dres.json();
            const meta={};
            (ddata.items||[]).forEach(v=>{meta[v.id]={duration:formatDuration(parseYoutubeDuration(v.contentDetails?.duration)), embeddable:v.status?.embeddable !== false};});
            items=items.map(i=>({...i,duration:meta[i.id]?.duration||'',compatible:meta[i.id]?.embeddable!==false})).filter(i=>i.compatible);
          }
        }catch(err){console.warn('Não foi possível verificar compatibilidade dos vídeos.', err);}
      }
      if(!items.length){
        const alt=`${q} piano instrumental OR lyrics OR acoustic`;
        const p2=new URLSearchParams({part:'snippet',type:'video',maxResults:'8',q:alt,videoEmbeddable:'true',videoSyndicated:'true',safeSearch:'none',key:YOUTUBE_API_KEY});
        const r2=await fetch(`https://www.googleapis.com/youtube/v3/search?${p2.toString()}`);
        if(r2.ok){
          const d2=await r2.json();
          items=(d2.items||[]).filter(it=>it.id?.videoId).map(it=>({id:it.id.videoId,title:it.snippet.title,channel:it.snippet.channelTitle,thumb:it.snippet.thumbnails?.medium?.url || it.snippet.thumbnails?.default?.url || `https://img.youtube.com/vi/${it.id.videoId}/hqdefault.jpg`,duration:'',compatible:true}));
        }
      }
      renderYoutubeResults(items);
      return;
    }catch(e){
      console.warn('Falha na busca real do YouTube, usando catálogo local.', e);
    }
  }
  const norm=q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
  let items=youtubeDemoCatalog
    .map(v=>{
      const hay=(v.title+' '+v.channel+' '+v.keywords).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
      const score=norm.split(/\s+/).filter(Boolean).reduce((n,w)=>n+(hay.includes(w)?1:0),0);
      return {...v,score};
    })
    .filter(v=>v.score>0)
    .sort((a,b)=>b.score-a.score)
    .slice(0,8);
  if(!items.length) items=youtubeDemoCatalog.slice(0,8);
  renderYoutubeResults(items);
}
function loadYoutubePreview(idOverride, { autoplay = false } = {}){
  const id=idOverride || state.youtubeId || youtubePreviewLoadedId || youtubeId(($('youtubeLink')?.value||'').trim());
  if(!id){
    showModal('YouTube','Escolha uma música na lista para carregar a prévia.');
    return null;
  }
  const holder=$('youtubePreviewHolder');
  if(!holder) return null;

  stopYoutubePreview({removeFrame:true});
  youtubePreviewLoadedId=id;
  youtubePreviewFrame=document.createElement('iframe');
  youtubePreviewFrame.title='Prévia de áudio do YouTube';
  youtubePreviewFrame.className='youtube-hidden-frame';
  youtubePreviewFrame.src=youtubePreviewSrc(id);
  youtubePreviewFrame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
  youtubePreviewFrame.setAttribute('allowfullscreen','');
  youtubePreviewFrame.dataset.ready='false';

  holder.innerHTML='';
  holder.appendChild(youtubePreviewFrame);

  const note=document.createElement('div');
  note.className='youtube-preview-note audio-only';
  note.innerHTML='Prévia em modo áudio. O vídeo fica oculto na Eterniza. Se uma versão bloquear a reprodução, escolha outra música.';
  holder.appendChild(note);

  const btn=$('youtubePlayPauseBtn');
  if(btn){
    btn.disabled=false;
    btn.textContent=autoplay?'Carregando prévia...':'▶ Tocar prévia';
    btn.classList.remove('playing');
  }

  youtubePreviewFrame.onload=()=>{
    if(!youtubePreviewFrame) return;
    youtubePreviewFrame.dataset.ready='true';
    if(autoplay) playYoutubePreview();
    else if(btn) btn.textContent='▶ Tocar prévia';
  };

  return youtubePreviewFrame;
}

function playYoutubePreview(){
  const frame=youtubePreviewFrame;
  const btn=$('youtubePlayPauseBtn');
  if(!frame) return;

  const sendPlayCommands=()=>{
    if(!youtubePreviewFrame || youtubePreviewFrame!==frame) return;
    commandYoutube(frame,'unMute');
    commandYoutube(frame,'setVolume',[100]);
    commandYoutube(frame,'playVideo');
  };

  sendPlayCommands();
  setTimeout(sendPlayCommands,250);
  setTimeout(sendPlayCommands,700);

  youtubePreviewPlaying=true;
  if(btn){
    btn.disabled=false;
    btn.textContent='⏸ Pausar prévia';
    btn.classList.add('playing');
  }
}

function toggleYoutubePreview(){
  const btn=$('youtubePlayPauseBtn');

  if(youtubePreviewPlaying && youtubePreviewFrame){
    commandYoutube(youtubePreviewFrame,'pauseVideo');
    youtubePreviewPlaying=false;
    if(btn){btn.textContent='▶ Tocar prévia'; btn.classList.remove('playing');}
    return;
  }

  if(!youtubePreviewFrame){
    loadYoutubePreview(null,{autoplay:true});
    return;
  }

  if(youtubePreviewFrame.dataset.ready==='true'){
    playYoutubePreview();
    return;
  }

  if(btn){
    btn.disabled=true;
    btn.textContent='Carregando prévia...';
  }
  youtubePreviewFrame.onload=()=>{
    if(!youtubePreviewFrame) return;
    youtubePreviewFrame.dataset.ready='true';
    playYoutubePreview();
  };
}
function setupAuthAndYoutubeHelpers(){
  ['email','newEmail'].forEach(id=>{
    const el=$(id);
    if(el) el.addEventListener('input',()=>{ const pos=el.selectionStart; el.value=el.value.toLowerCase(); try{el.setSelectionRange(pos,pos)}catch(e){}; });
  });
  const cpfInput=$('newCpf');
  if(cpfInput){
    const wrapper=cpfInput.closest('label, .field, .auth-field, .form-group, div');
    if(wrapper) wrapper.style.display='none';
    cpfInput.removeAttribute('required');
    cpfInput.value='';
  }

  const phoneInput=$('newWhatsapp');
  if(phoneInput){
    phoneInput.setAttribute('inputmode','tel');
    phoneInput.setAttribute('autocomplete','tel');
    phoneInput.setAttribute('maxlength','15');
    phoneInput.addEventListener('input',()=>{
      phoneInput.value=formatPhone(phoneInput.value);
    });
  }
  const pass=$('password');
  if(pass) pass.addEventListener('keydown',e=>{ if(e.key==='Enter') $('loginBtn')?.click(); });
  const newPass=$('newPassword');
  if(newPass) newPass.addEventListener('keydown',e=>{ if(e.key==='Enter') $('createAccountBtn')?.click(); });
  const ySearch=$('youtubeSearch');
  if(ySearch) ySearch.addEventListener('keydown',e=>{ if(e.key==='Enter') searchYoutube(); });
  if($('youtubeSearchBtn')) $('youtubeSearchBtn').onclick=searchYoutube;
  if($('youtubePlayPauseBtn')) $('youtubePlayPauseBtn').onclick=toggleYoutubePreview;
}

function makeSlug(name){return `${name}-${Date.now()}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function routeLink(slug){return location.origin + '/presente/' + slug}
function navigateTop(path, replace=false){
  try{
    if(replace && window.top.location.replace) window.top.location.replace(path);
    else window.top.location.href = path;
  }catch(e){
    if(replace && window.location.replace) window.location.replace(path);
    else window.location.href = path;
  }
}
function ensureDemoOrder(){
  let demo=orders.find(o=>o.slug==='demo-maria-e-jose');
  if(demo) return demo;
  demo={
    id:999, status:'Publicado', slug:'demo-maria-e-jose', publicUrl:routeLink('demo-maria-e-jose'),
    createdAt:new Date().toISOString(), userEmail:'demo@eterniza.com', userName:'Eterniza', userWhatsapp:'',
    recipient:recipients.find(r=>r.id==='amor'), plan:plans.find(p=>p.id==='premium'),
    receiverName:'Maria & José', senderName:'Eterniza', specialDate:'2021-12-24',
    primaryColor:'#d7a845', secondaryColor:'#f5d37a', musicMode:'track-wedding-story',
    selectedTrack:musicLibrary.find(t=>t.id==='track-wedding-story'), youtubeVideo:null,
    letterText:'Existem histórias que parecem feitas para durar para sempre. Cada sorriso, cada abraço e cada lembrança de vocês virou parte de uma caminhada linda, cheia de amor e significado. Que esta homenagem seja um pequeno lembrete de tudo que já viveram e de tudo que ainda está por vir.',
    photos:[]
  };
  orders.unshift(demo); saveOrders(); return demo;
}
function publishOrder(){const slug=makeSlug(state.receiverName);const order={id:Date.now(),...state,status:'Publicado',slug,publicUrl:routeLink(slug),createdAt:new Date().toISOString()};orders.unshift(order);saveOrders();showModal('Link gerado!',`Rota criada: ${order.publicUrl}`);renderOrders()}

function renderClientDashboard(){
  if($('clientHello')) $('clientHello').textContent = `Olá, ${state.userName || state.userEmail?.split('@')[0] || 'cliente'} 👋`;
  const mine = orders.filter(o => (o.userEmail || '').toLowerCase() === (state.userEmail || '').toLowerCase());
  if($('clientGiftCount')) $('clientGiftCount').textContent = `${mine.length} presente(s)`;
  if(!$('clientGiftsList')) return;
  if(!mine.length){
    $('clientGiftsList').innerHTML = `<div class="empty-client-box"><strong>Nenhuma homenagem criada ainda.</strong><p>Clique em <b>+ Nova homenagem</b> para começar sua primeira experiência Eterniza.</p></div>`;
    return;
  }
  $('clientGiftsList').innerHTML = mine.map(o=>{
    const link=o.publicUrl||routeLink(o.slug);
    return `<div class="client-gift-card">
      <div>
        <strong>${esc(o.receiverName)} — ${esc(o.plan?.name||'Plano')}</strong>
        <span>${esc(o.recipient?.title||'Homenagem')} • ${esc(o.status||'Publicado')} • /presente/${esc(o.slug)}</span>
      </div>
      <div class="client-gift-actions">
        <button class="ghost-btn small" data-client-open="${esc(o.slug)}">Abrir</button>
        <button class="ghost-btn small" data-client-copy="${esc(link)}">Copiar link</button>
      </div>
    </div>`;
  }).join('');
  document.querySelectorAll('[data-client-open]').forEach(b=>b.onclick=()=>{location.href='/presente/'+b.dataset.clientOpen;});
  document.querySelectorAll('[data-client-copy]').forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(b.dataset.clientCopy);showModal('Link copiado',b.dataset.clientCopy)});
}


let activeAdminSection='dashboard';
function adminMoney(value){return (value||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
function adminClients(){
  const map=new Map();
  orders.forEach(o=>{
    const email=(o.userEmail||'cliente@eterniza.com').toLowerCase();
    if(!map.has(email)) map.set(email,{email,name:o.userName||email.split('@')[0],whatsapp:o.userWhatsapp||'(51) 99999-0000',orders:0,total:0,last:o.createdAt,status:'Ativo',plan:o.plan?.name||'Premium'});
    const c=map.get(email); c.orders++; c.total+=(o.plan?.cents||0); c.last=o.createdAt||c.last; c.plan=o.plan?.name||c.plan;
  });
  if(!map.size){
    map.set('cliente@eterniza.com',{email:'cliente@eterniza.com',name:'Cliente exemplo',whatsapp:'(51) 99999-0000',orders:0,total:0,last:new Date().toISOString(),status:'Ativo',plan:'Premium'});
  }
  return [...map.values()];
}
function adminStatsHtml(){
  const total=orders.reduce((s,o)=>s+(o.plan?.cents||0),0)/100;
  const views=Math.max(orders.length*37,128);
  return `<div class="admin-dashboard">
    <div class="admin-stat"><strong>${orders.length}</strong><span>pedidos</span></div>
    <div class="admin-stat"><strong>${adminMoney(total)}</strong><span>faturamento simulado</span></div>
    <div class="admin-stat"><strong>${orders.filter(o=>o.status==='Publicado').length}</strong><span>publicados</span></div>
    <div class="admin-stat"><strong>${adminClients().length}</strong><span>clientes</span></div>
    <div class="admin-stat"><strong>${views}</strong><span>visualizações estimadas</span></div>
  </div>`;
}
function adminHeader(title,sub,action=''){
  return `<div class="admin-section-head-pro"><div><span>Painel Eterniza</span><h2>${title}</h2><p>${sub}</p></div>${action}</div>`;
}
function orderCard(o){
  const link=o.publicUrl||routeLink(o.slug);
  return `<div class="admin-card-rich">
    <div class="admin-card-cover">${esc((o.receiverName||'E')[0])}</div>
    <div class="admin-card-body">
      <div class="admin-card-top"><strong>${esc(o.receiverName||'Homenagem')}</strong><span class="status">${esc(o.status||'Publicado')}</span></div>
      <p>${esc(o.recipient?.title||'Experiência')} • ${esc(o.plan?.name||'Plano')} • /presente/${esc(o.slug||'demo')}</p>
      <small>${esc(o.userEmail||'cliente')} • ${new Date(o.createdAt||Date.now()).toLocaleDateString('pt-BR')}</small>
      <div class="admin-actions-row">
        <button class="ghost-btn small" data-copy="${esc(link)}">Copiar link</button>
        <button class="ghost-btn small" data-open="${esc(o.slug)}">Abrir</button>
        <button class="ghost-btn small" data-admin-modal="Editar homenagem|Em breve você poderá editar fotos, carta, música, plano e validade diretamente por aqui.">Editar</button>
        <button class="ghost-btn small" data-qr="${esc(link)}">QR Code</button>
      </div>
    </div>
  </div>`;
}

function adminPlanCard(plan){
  const features = (plan.features || []).join('\n');
  return `<div class="admin-panel-pro plan-editor-card" data-plan-card="${esc(plan.id||plan.slug)}">
    <div class="plan-editor-head">
      <div>
        <small>${esc(plan.slug || plan.id)}</small>
        <h3>${esc(plan.name)}</h3>
      </div>
      ${plan.promoActive?`<span class="status promo-status">${esc(plan.promoName||'Promoção ativa')}</span>`:'<span class="status">Preço padrão</span>'}
    </div>
    <div class="admin-grid-2 compact">
      <label>Nome<input class="admin-search" data-plan-field="name" value="${esc(plan.name)}"></label>
      <label>Preço padrão<input class="admin-search" data-plan-field="price" value="${(Number(plan.regularPriceCents||plan.cents||0)/100).toFixed(2).replace('.',',')}"></label>
      <label>Fotos<input class="admin-search" data-plan-field="photos" type="number" min="1" value="${Number(plan.photos||10)}"></label>
      <label>Duração<input class="admin-search" data-plan-field="duration" value="${esc(plan.duration||'vitalício')}"></label>
    </div>
    <label>Descrição<input class="admin-search" data-plan-field="description" value="${esc(plan.desc||plan.description||'')}"></label>
    <label>Recursos<textarea class="admin-search admin-textarea" data-plan-field="features">${esc(features)}</textarea></label>
    <div class="promo-editor">
      <label class="promo-toggle"><input type="checkbox" data-plan-field="promoActive" ${plan.promoActive?'checked':''}> Ativar promoção</label>
      <div class="admin-grid-2 compact">
        <label>Campanha<input class="admin-search" data-plan-field="promoName" placeholder="Black Friday" value="${esc(plan.promoName||'')}"></label>
        <label>Preço promocional<input class="admin-search" data-plan-field="promoPrice" placeholder="29,90" value="${plan.promoPriceCents?(Number(plan.promoPriceCents)/100).toFixed(2).replace('.',','):''}"></label>
        <label>Início<input class="admin-search" data-plan-field="promoStartsAt" type="date" value="${plan.promoStartsAt||''}"></label>
        <label>Fim<input class="admin-search" data-plan-field="promoEndsAt" type="date" value="${plan.promoEndsAt||''}"></label>
      </div>
    </div>
  </div>`;
}

async function loadAdminPlans(){
  const box=$('adminPlansBox');
  if(!box) return;
  box.innerHTML='<div class="admin-panel-pro"><p>Carregando planos...</p></div>';
  try{
    const res=await fetch('/api/admin/plans',{cache:'no-store'});
    const data=await res.json().catch(()=>({}));
    if(!res.ok || !data.ok) throw new Error(data.message || 'Erro ao carregar planos.');
    box.innerHTML=(data.plans||[]).map(adminPlanCard).join('');
    $('saveAdminPlansBtn')?.classList.remove('hidden');
  }catch(error){
    box.innerHTML=`<div class="admin-panel-pro"><h3>Erro ao carregar planos</h3><p>${esc(error.message||'Tente novamente.')}</p></div>`;
  }
}

function collectAdminPlans(){
  return [...document.querySelectorAll('[data-plan-card]')].map((card,index)=>{
    const get=(field)=>{
      const el=card.querySelector(`[data-plan-field="${field}"]`);
      if(!el) return '';
      if(el.type==='checkbox') return el.checked;
      return el.value;
    };
    return {
      slug: card.dataset.planCard,
      name: get('name'),
      price: get('price'),
      description: get('description'),
      photos: get('photos'),
      duration: get('duration'),
      features: get('features'),
      promoActive: get('promoActive'),
      promoName: get('promoName'),
      promoPrice: get('promoPrice'),
      promoStartsAt: get('promoStartsAt'),
      promoEndsAt: get('promoEndsAt'),
      sortOrder: index + 1,
      isActive: true
    };
  });
}

async function saveAdminPlans(){
  try{
    const btn=$('saveAdminPlansBtn');
    if(btn){btn.disabled=true;btn.textContent='Salvando...';}
    const res=await fetch('/api/admin/plans',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({plans:collectAdminPlans()})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok || !data.ok) throw new Error(data.message || 'Erro ao salvar planos.');
    showModal('Planos atualizados','Os valores e promoções foram salvos com sucesso.');
    await loadDynamicPlans();
loadDynamicSettings();
    await loadAdminPlans();
  }catch(error){
    showModal('Erro ao salvar planos', error.message || 'Não foi possível salvar as alterações.');
  }finally{
    const btn=$('saveAdminPlansBtn');
    if(btn){btn.disabled=false;btn.textContent='Salvar planos e promoções';}
  }
}

function renderAdminSection(section=activeAdminSection){
  activeAdminSection=section;
  document.querySelectorAll('[data-admin-section]').forEach(b=>b.classList.toggle('active',b.dataset.adminSection===section));
  const box=$('adminSectionContent'); if(!box) return;
  const published=orders.filter(o=>o.status==='Publicado');
  const clients=adminClients();
  const total=orders.reduce((s,o)=>s+(o.plan?.cents||0),0)/100;
  if(section==='dashboard'){
    box.innerHTML=adminHeader('Dashboard','Visão geral da operação, vendas simuladas e próximos passos.',`<button id="adminNewGiftBtn" class="primary-btn">Novo presente</button>`)+adminStatsHtml()+
    `<div class="admin-growth-grid clickable-modules">
      ${[
        ['clientes','👥 Clientes','Cadastros, WhatsApp e histórico'],['homenagens','🎁 Homenagens','Links, status e publicações'],['biblioteca','🎵 Biblioteca','Trilhas Eterniza e YouTube'],['escritor','🤖 Escritor Eterniza','Cartas por emoção e tamanho'],['cupons','🎟️ Cupons','Datas comemorativas e descontos'],['planos','💰 Planos e Promoções','Preços, campanhas e Black Friday'],['pagamentos','💳 Pagamentos','Pix, cartão e Asaas'],['analytics','📊 Analytics','Visualizações, QR e dispositivos'],['qrcode','▦ QR Code','PNG, PDF, etiqueta e cartão'],['whatsapp','📱 WhatsApp','Mensagens prontas para clientes'],['configuracoes','⚙️ Configurações','Logo, planos, domínio e APIs']
      ].map(x=>`<button class="admin-module admin-module-btn" type="button" data-admin-section="${x[0]}"><strong>${x[1]}</strong><span>${x[2]}</span></button>`).join('')}
    </div>
    <div class="admin-panel-pro"><h3>Últimas homenagens</h3><div class="orders-list">${orders.length?orders.slice(0,3).map(orderCard).join(''):'<p>Nenhum pedido encontrado.</p>'}</div></div>`;
    $('adminNewGiftBtn')?.addEventListener('click',()=>go('recipientScreen'));
  }
  if(section==='clientes'){
    box.innerHTML=adminHeader('Clientes','Pesquise, visualize histórico e acompanhe cada comprador.',`<button class="primary-btn" data-admin-modal="Novo cliente|Cadastro manual preparado para a próxima etapa com banco de dados.">Novo cliente</button>`)+
    `<div class="admin-tools"><input id="clientSearch" class="admin-search" placeholder="Buscar por nome, e-mail ou WhatsApp..."><button class="ghost-btn" data-admin-modal="Exportar clientes|Exportação CSV/Excel será ligada ao banco de dados.">Exportar</button></div>
    <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Cliente</th><th>WhatsApp</th><th>Plano</th><th>Pedidos</th><th>Total</th><th>Status</th><th>Ações</th></tr></thead><tbody id="clientRows">${clients.map(c=>`<tr><td><b>${esc(c.name)}</b><small>${esc(c.email)}</small></td><td>${esc(c.whatsapp)}</td><td>${esc(c.plan)}</td><td>${c.orders}</td><td>${adminMoney(c.total/100)}</td><td><span class="status">${c.status}</span></td><td><button class="ghost-btn small" data-admin-modal="Cliente ${esc(c.name)}|Histórico, edição e exclusão ficarão conectados ao Supabase.">Ver</button></td></tr>`).join('')}</tbody></table></div>`;
  }
  if(section==='homenagens'){
    box.innerHTML=adminHeader('Homenagens','Gerencie links públicos, status, QR Code, edição e compartilhamento.',`<button id="adminNewGiftBtn2" class="primary-btn">Nova homenagem</button>`)+
    `<div class="admin-toolbar"><button class="ghost-btn active-filter" data-filter="todos">Todos</button><button class="ghost-btn" data-filter="pendente">Pendentes</button><button class="ghost-btn" data-filter="publicado">Publicados</button></div>
    <div id="adminHomenagensList" class="orders-list">${orders.length?orders.map(orderCard).join(''):'<div class="form-card"><p>Nenhuma homenagem encontrada.</p></div>'}</div>`;
    $('adminNewGiftBtn2')?.addEventListener('click',()=>go('recipientScreen'));
  }
  if(section==='biblioteca'){
    box.innerHTML=adminHeader('Biblioteca musical','Trilhas oficiais da Eterniza, favoritas e busca do YouTube.',`<button class="primary-btn" data-admin-modal="Adicionar trilha|Depois vamos permitir cadastro de trilhas próprias e favoritas.">Adicionar trilha</button>`)+
    `<div class="admin-grid-2"><div class="admin-panel-pro"><h3>Trilhas Eterniza</h3>${musicLibrary.map(t=>`<div class="music-admin-row"><div><b>${esc(t.title)}</b><span>${esc(t.mood)} • ${esc(t.file||'YouTube')}</span></div><button class="ghost-btn small" data-admin-modal="Prévia|Esta trilha já está disponível no criador de homenagens.">Ouvir</button></div>`).join('')}</div>
    <div class="admin-panel-pro"><h3>Busca YouTube</h3><p>API configurada para pesquisar músicas dentro da Eterniza.</p><input class="admin-search" placeholder="Buscar música ou artista..."><button class="primary-btn full" data-admin-modal="Busca YouTube|A busca real já está no criador. Aqui ficará a biblioteca administrativa de favoritas.">Pesquisar</button></div></div>`;
  }
  if(section==='escritor'){
    box.innerHTML=adminHeader('Escritor Eterniza','Modelos de cartas longas por emoção, pessoa e ocasião.')+
    `<div class="admin-grid-3">${['Romântica emocionante','Para mãe','Para pai','Filho(a)','Avós','Amizade','Aniversário','Casamento','Gratidão','Despedida/Luto','Natal','Livre'].map(x=>`<div class="admin-template-card"><b>${x}</b><p>Texto longo, humano e personalizável.</p><button class="ghost-btn small" data-admin-modal="${x}|Modelo de texto premium pronto para conectar à IA.">Abrir modelo</button></div>`).join('')}</div>`;
  }
  if(section==='cupons'){
    box.innerHTML=adminHeader('Cupons','Crie promoções para Dia dos Namorados, Mães, Pais e aniversários.',`<button class="primary-btn" data-admin-modal="Novo cupom|Cupom criado localmente na próxima etapa com banco.">Criar cupom</button>`)+
    `<div class="admin-grid-3">${['AMOR10','MAE15','PREMIUM20'].map((c,i)=>`<div class="admin-template-card"><b>🎟️ ${c}</b><p>${[10,15,20][i]}% de desconto • Ativo</p><button class="ghost-btn small" data-admin-modal="Cupom ${c}|Editar validade, limite e planos participantes.">Editar</button></div>`).join('')}</div>`;
  }
  if(section==='planos'){
    box.innerHTML=adminHeader('Planos e Promoções','Altere valores, campanhas e ofertas sazonais como Black Friday, Dia dos Namorados e Natal.',`<button id="saveAdminPlansBtn" class="primary-btn hidden">Salvar planos e promoções</button>`)+
    `<div class="admin-panel-pro"><h3>Como funciona</h3><p>O preço salvo aqui passa a ser usado no checkout Pix do Asaas. Promoções ativas substituem temporariamente o preço padrão.</p></div>
    <div id="adminPlansBox" class="admin-grid-3"></div>`;
    $('saveAdminPlansBtn')?.addEventListener('click', saveAdminPlans);
    loadAdminPlans();
  }
  if(section==='pagamentos'){
    box.innerHTML=adminHeader('Pagamentos','Controle Pix, cartão, renovações e integração Asaas.',`<button class="primary-btn" data-admin-modal="Asaas|Configuração do token e webhooks ficará em Configurações.">Configurar Asaas</button>`)+
    `<div class="admin-dashboard"><div class="admin-stat"><strong>${adminMoney(total)}</strong><span>recebido</span></div><div class="admin-stat"><strong>${adminMoney(0)}</strong><span>pendente</span></div><div class="admin-stat"><strong>${published.length}</strong><span>links ativos</span></div></div>
    <div class="admin-table-wrap"><table class="admin-table"><thead><tr><th>Pedido</th><th>Cliente</th><th>Forma</th><th>Valor</th><th>Status</th></tr></thead><tbody>${orders.map(o=>`<tr><td>${esc(o.receiverName)}</td><td>${esc(o.userEmail||'cliente')}</td><td>Pix/Asaas</td><td>${adminMoney((o.plan?.cents||0)/100)}</td><td><span class="status">Simulado</span></td></tr>`).join('')||'<tr><td colspan="5">Nenhum pagamento ainda.</td></tr>'}</tbody></table></div>`;
  }
  if(section==='analytics'){
    box.innerHTML=adminHeader('Analytics','Visualizações, origem dos acessos, QR Codes e dispositivos.')+
    `<div class="admin-dashboard"><div class="admin-stat"><strong>${Math.max(orders.length*37,128)}</strong><span>visualizações</span></div><div class="admin-stat"><strong>${Math.max(orders.length*8,24)}</strong><span>QR scans</span></div><div class="admin-stat"><strong>68%</strong><span>celular</span></div><div class="admin-stat"><strong>32%</strong><span>desktop</span></div></div>
    <div class="admin-panel-pro"><h3>Últimos acessos</h3><div class="fake-chart"><span style="height:40%"></span><span style="height:70%"></span><span style="height:55%"></span><span style="height:88%"></span><span style="height:62%"></span><span style="height:95%"></span><span style="height:76%"></span></div></div>`;
  }
  if(section==='qrcode'){
    box.innerHTML=adminHeader('QR Code','Gere materiais para impressão, etiquetas, cartões e presentes físicos.',`<button class="primary-btn" data-admin-modal="Novo QR Code|Escolha uma homenagem publicada para gerar PNG, SVG ou PDF.">Gerar QR</button>`)+
    `<div class="admin-grid-3">${['PNG para WhatsApp','PDF A4','Etiqueta adesiva','Cartão presente','Plaquinha acrílica','Chaveiro'].map(x=>`<div class="admin-template-card"><b>▦ ${x}</b><p>Modelo pronto para venda física.</p><button class="ghost-btn small" data-admin-modal="${x}|Geração do arquivo será ligada à rota pública da homenagem.">Preparar</button></div>`).join('')}</div>`;
  }
  if(section==='whatsapp'){
    box.innerHTML=adminHeader('WhatsApp','Mensagens prontas para envio de link, cobrança e pós-venda.')+
    `<div class="admin-grid-2">${['Seu link ficou pronto','Pagamento pendente','Renovar homenagem','Agradecimento pós-compra'].map(x=>`<div class="admin-panel-pro"><h3>📱 ${x}</h3><p>Olá! Sua homenagem Eterniza está pronta. Acesse pelo link e compartilhe com carinho. ❤️</p><button class="ghost-btn small" data-admin-modal="Mensagem copiada|Modelo preparado para copiar e enviar pelo WhatsApp.">Copiar modelo</button></div>`).join('')}</div>`;
  }
  if(section==='configuracoes'){
    box.innerHTML=adminHeader('Configurações','Controle marca, planos, preços, domínio e integrações.')+
    `<div class="admin-grid-2"><div class="admin-panel-pro"><h3>Marca</h3><label>Nome da marca</label><input class="admin-search" value="Eterniza"><label>Slogan</label><input class="admin-search" value="Onde Cada História Vive Para Sempre!"><button class="primary-btn full" data-admin-modal="Configurações salvas|Na próxima etapa salvaremos no banco de dados.">Salvar marca</button></div><div class="admin-panel-pro"><h3>Integrações</h3><div class="settings-line"><span>YouTube API</span><b>Configurada</b></div><div class="settings-line"><span>Asaas</span><b>Configurado</b></div><div class="settings-line"><span>OpenAI/IA</span><b>Pendente</b></div><div class="settings-line"><span>Domínio</span><b>eterniza.com.br</b></div></div></div>`;
  }
  document.querySelectorAll('[data-admin-section]').forEach(b=>{ if(!b.dataset.bound){ b.dataset.bound='1'; b.onclick=()=>renderAdminSection(b.dataset.adminSection); }});
  document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(b.dataset.copy);showModal('Link copiado',b.dataset.copy)});
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>navigateTop('/presente/'+b.dataset.open));
  document.querySelectorAll('[data-qr]').forEach(b=>b.onclick=()=>showModal('QR Code Eterniza',`Use este link para gerar/colar no QR Code: ${b.dataset.qr}`));
  document.querySelectorAll('[data-admin-modal]').forEach(b=>b.onclick=()=>{const [t,msg]=(b.dataset.adminModal||'Eterniza|Ação preparada.').split('|');showModal(t,msg)});
}
function renderOrders(){ renderAdminSection(activeAdminSection||'dashboard'); }


async function loadPublicTributeBySlug(slug){
  try{
    go('landingScreen');
    showModal('Carregando história','Estamos abrindo esta homenagem Eterniza.');
    const res = await fetch(`/api/tributes/public/${encodeURIComponent(slug)}`);
    const data = await res.json().catch(()=>({}));
    if(!res.ok || !data.ok || !data.tribute){
      throw new Error(data.message || 'Esta página ainda não existe ou não foi publicada.');
    }
    const tribute = data.tribute;
    const content = tribute.content && typeof tribute.content === 'object' ? tribute.content : {};
    state = {
      ...state,
      ...content,
      tributeId: tribute.id,
      slug: tribute.slug,
      publicUrl: tribute.public_url || tribute.publicUrl || `/presente/${tribute.slug}`,
      receiverName: content.receiverName || tribute.receiver_name || tribute.title || 'Homenagem',
      senderName: content.senderName || tribute.sender_name || '',
      letterText: content.letterText || tribute.message || content.message || '',
      photos: Array.isArray(content.photos) && content.photos.length ? content.photos : (tribute.photos || []).map(p=>p.url).filter(Boolean),
      plan: content.plan || state.plan || plans.find(p=>p.id==='premium'),
      recipient: content.recipient || state.recipient || recipients.find(r=>r.id==='outro'),
      status: 'PUBLISHED'
    };
    document.body.dataset.publicGift='true';
    renderPreview();
    go('previewScreen');
    const modal = document.getElementById('modal');
    if(modal) modal.classList.add('hidden');
    setTimeout(()=>{document.querySelector('.gift-preview')?.scrollIntoView({behavior:'smooth',block:'start'});},250);
  }catch(error){
    go('landingScreen');
    showModal('Link não encontrado', error.message || 'Esta página ainda não existe.');
  }
}

function openRoute(){
  const params = new URLSearchParams(location.search || '');
  const route = params.get('route') || '';
  const sectionParam = params.get('section') || '';
  const startParam = params.get('start') || '';
  if(startParam === 'recipient'){
    renderRecipients();
    renderPlans();
    go('recipientScreen');
    return true;
  }
  if(route === 'login'){ setAuthMode('login'); go('loginScreen'); return true; }
  if(route === 'cadastro'){ setAuthMode('create'); go('loginScreen'); return true; }
  if(route === 'criar' || route === 'escolher'){ go('recipientScreen'); return true; }
  if(route === 'dashboard'){ if(state.userEmail){ go('dashboardScreen'); return true; } setAuthMode('login'); go('loginScreen'); return true; }
  if(route === 'admin'){ if(state.isAdmin){ renderOrders(); go('adminScreen'); return true; } setAuthMode('login'); showModal('Acesso administrativo','Entre com o usuário administrativo da Jeslie para abrir o painel.'); go('loginScreen'); return true; }
  if(route === 'presente'){
    const decodedSlug = decodeURIComponent(params.get('slug') || '');
    if(decodedSlug==='demo' || decodedSlug==='demo-maria-e-jose') ensureDemoOrder();
    const order=orders.find(o=>o.slug===decodedSlug);
    if(order){state={...state,...order};renderPreview();go('previewScreen');document.body.dataset.publicGift='true';setTimeout(()=>{document.querySelector('.gift-preview')?.scrollIntoView({behavior:'smooth',block:'start'});},250);return true;}
    if(decodedSlug){ loadPublicTributeBySlug(decodedSlug); return true; }
    go('landingScreen');showModal('Link não encontrado','Este presente ainda não existe.');return true;
  }
  if(sectionParam){ go('landingScreen'); setTimeout(()=>document.getElementById(sectionParam)?.scrollIntoView({behavior:'smooth',block:'start'}),120); return true; }
  const hash=location.hash || '';
  if(hash.startsWith('#/login')){
    setAuthMode('login');
    go('loginScreen');
    return true;
  }
  if(hash.startsWith('#/cadastro') || hash.startsWith('#/criar')){
    setAuthMode('create');
    go('loginScreen');
    return true;
  }
  if(hash.startsWith('#/dashboard')){
    if(state.userEmail){ go('dashboardScreen'); return true; }
    setAuthMode('login'); go('loginScreen'); return true;
  }
  if(hash.startsWith('#/admin') || hash.startsWith('#/painel-jeslie')){
    if(state.isAdmin){renderOrders();go('adminScreen');return true;}
    setAuthMode('login');
    showModal('Acesso administrativo','Entre com o usuário administrativo da Jeslie para abrir o painel.');
    go('loginScreen');
    return true;
  }
  const slug=(hash.match(/#\/presente\/([^?]+)/)||[])[1];
  if(slug){
    const decodedSlug=decodeURIComponent(slug);
    if(decodedSlug==='demo' || decodedSlug==='demo-maria-e-jose') ensureDemoOrder();
    const order=orders.find(o=>o.slug===decodedSlug);
    if(order){state={...state,...order};renderPreview();go('previewScreen');document.body.dataset.publicGift='true';setTimeout(()=>{document.querySelector('.gift-preview')?.scrollIntoView({behavior:'smooth',block:'start'});},250);return true;}
    if(decodedSlug){ loadPublicTributeBySlug(decodedSlug); return true; }
    go('landingScreen');showModal('Link não encontrado','Este presente ainda não existe.');return true;
  }
  const anchor=(hash.match(/^#(como-funciona|exemplos|planos|perguntas)$/)||[])[1];
  if(anchor){
    go('landingScreen');
    setTimeout(()=>document.getElementById(anchor)?.scrollIntoView({behavior:'smooth',block:'start'}),120);
    return true;
  }
  if(hash==='#/' || hash==='') return false;
  return false;
}

function goLoginCreate(e){ if(e) e.preventDefault(); navigateTop('/cadastro'); return false; }
function goLoginEnter(e){ if(e) e.preventDefault(); navigateTop('/login'); return false; }

/* ===== Eterniza V56: Checkout PIX direto na prévia ===== */
const publishPaymentPlans = [
  {slug:'essencial', name:'Essencial', price:'R$ 19,90', amount:19.90, desc:'Para uma homenagem simples e emocionante.'},
  {slug:'premium', name:'Premium', price:'R$ 39,90', amount:39.90, desc:'O mais escolhido. História completa com QR Code.'},
  {slug:'eterno', name:'Eterno', price:'R$ 69,90', amount:69.90, desc:'Experiência completa para eternizar para sempre.'}
];

let publishPollTimer = null;
let pixCreationInFlight = false;

function checkoutStyle(){
  return `
    <style id="eternizaCheckoutStyle">
      .eterniza-pay-overlay{position:fixed;inset:0;background:rgba(0,0,0,.82);backdrop-filter:blur(10px);z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px}
      .eterniza-pay-modal{width:min(920px,96vw);max-height:92vh;overflow:auto;border:1px solid rgba(239,189,82,.22);background:linear-gradient(145deg,rgba(24,27,27,.96),rgba(9,15,18,.96));border-radius:28px;box-shadow:0 30px 100px rgba(0,0,0,.55);padding:32px;position:relative;color:#fff}
      .eterniza-pay-close{position:absolute;right:18px;top:16px;width:44px;height:44px;border-radius:14px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.06);color:#fff;font-size:28px;cursor:pointer}
      .eterniza-pay-modal h2{font-family:Georgia,serif;font-size:42px;line-height:1.05;color:#fff8ea;margin:0 54px 10px 0}
      .eterniza-pay-modal p{color:#ead9b7;font-size:17px;line-height:1.45}
      .eterniza-plan-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:24px}
      .eterniza-plan-card{border:1px solid rgba(239,189,82,.2);background:rgba(0,0,0,.22);border-radius:22px;padding:22px;position:relative}
      .eterniza-plan-card.featured{border-color:rgba(239,189,82,.65);box-shadow:0 0 0 1px rgba(239,189,82,.18) inset}
      .eterniza-plan-card .tag{position:absolute;right:14px;top:14px;background:#f6cf72;color:#150f07;border-radius:999px;padding:7px 11px;font-size:12px;font-weight:1000}
      .eterniza-plan-card h3{font-size:25px;margin:0 0 10px;color:#fff}
      .eterniza-plan-card strong{display:block;color:#f6cf72;font-size:34px;margin-bottom:12px}
      .eterniza-plan-card p{min-height:60px;margin:0 0 18px}
      .eterniza-pay-btn{border:0;border-radius:15px;background:linear-gradient(135deg,#c99337,#f7dc82);color:#130d05;font-weight:1000;padding:14px 18px;cursor:pointer;width:100%}
      .eterniza-pay-secondary{border:1px solid rgba(239,189,82,.28);background:rgba(255,255,255,.06);color:#fff;border-radius:14px;padding:13px 16px;font-weight:900;cursor:pointer}
      .eterniza-pix-box{text-align:center;max-width:620px;margin:0 auto}
      .eterniza-pix-img{width:300px;max-width:100%;background:#fff;border-radius:20px;padding:14px;margin:12px auto;display:block}
      .eterniza-cpf-label{display:block;text-align:left;color:#f6cf72;font-weight:900;margin:14px 0 7px}.eterniza-cpf-label small{color:#ead9b7;font-weight:500}.eterniza-cpf-input{width:100%;box-sizing:border-box;border:1px solid rgba(239,189,82,.25);background:rgba(255,255,255,.07);color:#fff;border-radius:14px;padding:14px 15px;font-size:17px;outline:none}.eterniza-cpf-input:focus{border-color:#efbd52;box-shadow:0 0 0 3px rgba(239,189,82,.12)}.eterniza-cpf-error{min-height:20px;color:#ff9d9d!important;text-align:left;font-weight:800;margin:8px 0!important}
      .eterniza-coupon-box{margin:14px 0;border:1px solid rgba(239,189,82,.2);background:rgba(239,189,82,.055);border-radius:16px;padding:14px;text-align:left}
      .eterniza-coupon-row{display:grid;grid-template-columns:minmax(0,1fr) 150px;gap:12px;align-items:stretch}
      .eterniza-coupon-input{width:100%;min-width:0;height:56px;border:1px solid rgba(239,189,82,.2);background:#232726;color:#fff;border-radius:16px;padding:0 16px;font-size:16px;line-height:56px;text-transform:uppercase;outline:none;box-sizing:border-box;transition:border-color .2s ease,box-shadow .2s ease}
      .eterniza-coupon-input:focus{border-color:#efbd52;box-shadow:0 0 0 3px rgba(239,189,82,.12)}
      .eterniza-coupon-apply{appearance:none;-webkit-appearance:none;width:100%;height:56px;border:0!important;border-radius:16px!important;background:linear-gradient(135deg,#c99337,#f7dc82)!important;color:#171005!important;padding:0 18px!important;font-family:inherit;font-size:15px;font-weight:1000;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 10px 28px rgba(239,189,82,.14);transition:transform .2s ease,box-shadow .2s ease,opacity .2s ease}
      .eterniza-coupon-apply:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(239,189,82,.24)}
      .eterniza-coupon-apply:focus-visible{outline:3px solid rgba(239,189,82,.22);outline-offset:2px}
      .eterniza-coupon-apply:disabled{opacity:.62;cursor:wait;transform:none;box-shadow:none}
      .eterniza-coupon-apply.applied{background:linear-gradient(135deg,#2f9f63,#8dffb2)!important;color:#06120a!important}
      .eterniza-coupon-error{display:block;color:#ffb7b7;margin-top:8px}
      .eterniza-coupon-summary{display:grid;gap:5px;margin-top:10px;padding-top:10px;border-top:1px solid rgba(239,189,82,.14)}
      .eterniza-coupon-summary span{color:#c8b998}.eterniza-coupon-summary strong{color:#8dffb2;font-size:17px}
      .eterniza-pix-text{width:100%;min-height:96px;border-radius:16px;border:1px solid rgba(239,189,82,.25);background:rgba(255,255,255,.08);color:#fff;padding:14px;box-sizing:border-box}
      .eterniza-pay-status{margin-top:18px;color:#f6cf72;font-weight:1000;display:flex;align-items:center;justify-content:center;gap:10px}
      .eterniza-spinner{width:20px;height:20px;border-radius:50%;border:3px solid rgba(246,207,114,.22);border-top-color:#f6cf72;display:inline-block;animation:eternizaSpin .85s linear infinite}
      .eterniza-loading-orb{width:74px;height:74px;border-radius:50%;margin:4px auto 18px;border:4px solid rgba(246,207,114,.18);border-top-color:#f6cf72;border-right-color:#f6cf72;animation:eternizaSpin 1s linear infinite;box-shadow:0 0 40px rgba(246,207,114,.18)}
      .eterniza-success-mark{width:82px;height:82px;border-radius:50%;margin:0 auto 16px;background:linear-gradient(135deg,#42d47d,#b9ffcf);color:#07120b;display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:1000;box-shadow:0 0 42px rgba(66,212,125,.32);animation:eternizaPop .55s ease both}
      .eterniza-success-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
      .eterniza-success-screen{position:relative;overflow:hidden;padding:18px 0}
      .eterniza-success-screen:before,.eterniza-success-screen:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;filter:blur(35px);opacity:.28;pointer-events:none}
      .eterniza-success-screen:before{background:#efbd52;left:-70px;top:-80px}
      .eterniza-success-screen:after{background:#42d47d;right:-70px;bottom:-90px}
      .eterniza-success-sub{color:#8dffb2!important;text-transform:uppercase;letter-spacing:.12em;font-size:12px!important;font-weight:1000}
      .eterniza-success-countdown{margin-top:16px;color:#cdbd9f!important;font-size:14px!important}
      .eterniza-share-btn{grid-column:1/-1;background:#1fa855!important;color:#fff!important}
      .eterniza-confetti{position:fixed;inset:0;pointer-events:none;z-index:100000;overflow:hidden}
      .eterniza-confetti i{position:absolute;top:-30px;width:10px;height:18px;border-radius:3px;animation:eternizaConfetti 2.8s ease-in forwards}

      .eterniza-method-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:24px 0}
      .eterniza-method-card{border:1px solid rgba(239,189,82,.24);background:rgba(0,0,0,.20);border-radius:20px;padding:20px;text-align:left;color:#fff;cursor:pointer}
      .eterniza-method-card:hover{border-color:rgba(239,189,82,.62)}
      .eterniza-method-card strong{display:block;font-size:22px;margin-bottom:8px;color:#fff8ea}
      .eterniza-method-card span{display:block;color:#ead9b7;line-height:1.35}
      .eterniza-card-box{max-width:680px;margin:0 auto}
      #eternizaCardBrick{margin-top:18px;background:#fff;border-radius:18px;padding:12px;color:#111}
      .eterniza-back-row{display:flex;justify-content:flex-start;margin-bottom:16px}
      @keyframes eternizaSpin{to{transform:rotate(360deg)}}
      @keyframes eternizaPop{0%{transform:scale(.65);opacity:0}70%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
      @keyframes eternizaConfetti{0%{transform:translateY(-20px) rotate(0);opacity:0}10%{opacity:1}100%{transform:translateY(108vh) rotate(620deg);opacity:.9}}
      @media(max-width:850px){.eterniza-plan-grid{grid-template-columns:1fr}.eterniza-pay-modal{padding:24px}.eterniza-pay-modal h2{font-size:34px}.eterniza-coupon-row{grid-template-columns:1fr}.eterniza-coupon-apply{width:100%}}
    </style>
  `;
}

function closePublishCheckout(){
  if(publishPollTimer) clearInterval(publishPollTimer);
  publishPollTimer = null;
  const old = document.getElementById('eternizaPayOverlay');
  if(old) old.remove();
}

function showPublishCheckoutStep(html){
  closePublishCheckout();
  if(!document.getElementById('eternizaCheckoutStyle')){
    document.head.insertAdjacentHTML('beforeend', checkoutStyle());
  }
  document.body.insertAdjacentHTML('beforeend', `
    <div id="eternizaPayOverlay" class="eterniza-pay-overlay">
      <div class="eterniza-pay-modal">
        <button class="eterniza-pay-close" type="button" id="eternizaPayClose">×</button>
        ${html}
      </div>
    </div>
  `);
  const close = document.getElementById('eternizaPayClose');
  if(close) close.onclick = closePublishCheckout;
}

async function validatePreviewCoupon(planSlug, code){
  const couponCode=String(code||'').trim().toUpperCase();
  if(!couponCode) return null;

  const response=await fetch('/api/coupons/validate',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({code:couponCode,plan:planSlug})
  });
  const data=await response.json().catch(()=>({}));

  if(!response.ok || !data.ok){
    throw new Error(data.message||'Cupom inválido.');
  }

  return data.coupon;
}

function requestCouponBeforePix(planSlug){
  const plan=plans.find(p=>String(p.slug||p.id).toLowerCase()===planSlug)||state.plan;

  showPublishCheckoutStep(`
    <div class="eterniza-pix-box">
      <h2>Finalizar pagamento</h2>
      <p>${esc(systemSettings.checkoutMessage||'Finalize o pagamento para publicar sua homenagem.')}</p>
      <p>Plano <b>${esc(plan?.name||'')}</b> • <b>${esc(plan?.price||'')}</b></p>
      <div class="eterniza-coupon-box">
        <label class="eterniza-cpf-label" for="eternizaCouponInput">Tem um cupom?</label>
        <div class="eterniza-coupon-row">
          <input class="eterniza-coupon-input" id="eternizaCouponInput" maxlength="30" placeholder="EX.: BLACK20" value="${esc(state.couponCode||'')}">
          <button class="eterniza-coupon-apply" type="button" id="applyPreviewCoupon">Aplicar</button>
        </div>
        <small class="eterniza-coupon-error" id="eternizaCouponError"></small>
        <div id="eternizaCouponSummary"></div>
      </div>
      <button class="eterniza-pay-btn" type="button" id="continuePreviewPayment">Continuar para o PIX</button>
    </div>
  `);

  const input=document.getElementById('eternizaCouponInput');
  if(input) input.oninput=()=>{
    input.value=input.value.toUpperCase();
    state.appliedCoupon=null;
    const applyButton=document.getElementById('applyPreviewCoupon');
    if(applyButton){
      applyButton.classList.remove('applied');
      applyButton.textContent='Aplicar';
    }
    const summary=document.getElementById('eternizaCouponSummary');
    if(summary){summary.className='';summary.innerHTML='';}
    const error=document.getElementById('eternizaCouponError');
    if(error) error.textContent='';
  };

  const apply=document.getElementById('applyPreviewCoupon');
  if(apply){
    apply.onclick=async()=>{
      const error=document.getElementById('eternizaCouponError');
      const summary=document.getElementById('eternizaCouponSummary');
      apply.disabled=true;
      apply.classList.remove('applied');
      apply.textContent='Validando...';
      if(error) error.textContent='';
      try{
        const coupon=await validatePreviewCoupon(planSlug,input?.value||'');
        state.couponCode=coupon?.code||'';
        state.appliedCoupon=coupon||null;
        persistBuilderState();
        apply.classList.add('applied');
        apply.textContent='✓ Aplicado';
        if(summary && coupon){
          summary.className='eterniza-coupon-summary';
          summary.innerHTML=`<span>De ${formatPlanCurrencyFromCents(coupon.originalPriceCents)}</span><span>Desconto -${formatPlanCurrencyFromCents(coupon.discountCents)}</span><strong>Total ${formatPlanCurrencyFromCents(coupon.finalPriceCents)}</strong>`;
        }
      }catch(err){
        state.couponCode='';
        state.appliedCoupon=null;
        apply.classList.remove('applied');
        persistBuilderState();
        if(summary){summary.className='';summary.innerHTML='';}
        if(error) error.textContent=err.message||'Cupom inválido.';
      }finally{
        apply.disabled=false;
        if(!state.appliedCoupon){
          apply.classList.remove('applied');
          apply.textContent='Aplicar';
        }
      }
    };
  }

  const next=document.getElementById('continuePreviewPayment');
  if(next){
    next.onclick=()=>{
      state.couponCode=String(input?.value||'').trim().toUpperCase();
      persistBuilderState();
      createPreviewPix(planSlug,'',false,state.couponCode);
    };
  }
}

async function openPublishCheckout(){
  if(systemSettings.pixEnabled===false){
    return showModal('Pagamentos indisponíveis','O pagamento por PIX está temporariamente desativado.');
  }
  const planSlug=String(state.plan?.slug||state.plan?.id||'').trim().toLowerCase();

  if(!planSlug){
    showModal('Plano não encontrado','Volte e escolha o plano da homenagem antes de gerar o PIX.');
    return;
  }

  const validPlan=plans.find(plan=>
    String(plan.slug||plan.id||'').toLowerCase()===planSlug
  );

  if(!validPlan){
    showModal('Plano inválido','O plano salvo não está disponível. Volte e selecione novamente.');
    return;
  }

  state.plan={...validPlan,photos:planPhotoLimit(validPlan)};
  saveState();
  requestCouponBeforePix(planSlug);
}

async function ensureCurrentTributeSaved(){
  const email=(state.userEmail||'').trim().toLowerCase();
  if(!email) throw new Error('Sessão do cliente não encontrada. Entre novamente.');
  const res = await fetch('/api/tributes/draft', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({
      userEmail: email,
      tributeId: state.tributeId,
      content: state
    })
  });
  const data = await res.json();
  if(!res.ok || !data.ok || !data.tribute){
    throw new Error(data.message || 'Não foi possível salvar a homenagem antes do pagamento.');
  }
  state.tributeId = data.tribute.id;
  state.slug = data.tribute.slug || state.slug;
  state.publicUrl = data.tribute.public_url || state.publicUrl;
  persistBuilderState();
  return data.tribute;
}


async function choosePaymentMethod(planSlug){
  const plan = publishPaymentPlans.find(p => p.slug === planSlug) || publishPaymentPlans.find(p => p.slug === 'premium') || publishPaymentPlans[0];
  showPublishCheckoutStep(`
    <h2>⚡ Pagamento</h2>
    <p>Plano escolhido: <b>${esc(plan.name)}</b> • <b>${esc(plan.price)}</b></p>
    <div class="eterniza-pix-box">
      <p>O pagamento será gerado pelo Asaas. Após a confirmação, sua história será publicada automaticamente.</p>
      <div class="eterniza-method-grid" style="grid-template-columns:1fr">
        <button class="eterniza-method-card" type="button" id="payWithPixOnly">
          <strong>🟢 PIX</strong>
          <span>Gerar QR Code e PIX copia e cola dentro da Eterniza.</span>
        </button>
      </div>
      <button class="eterniza-pay-secondary" type="button" id="backToPlans" style="margin-top:10px;width:100%">Voltar aos planos</button>
    </div>
  `);
  const pix = document.getElementById('payWithPixOnly');
  if(pix) pix.onclick = () => createPreviewPix(plan.slug);
  const back = document.getElementById('backToPlans');
  if(back) back.onclick = openPublishCheckout;
}

function showCardSuccess(tributeId, fallbackSlug){
  const url = fallbackSlug ? `/presente/${fallbackSlug}` : '/dashboard';
  showPublishCheckoutStep(`
    <div class="eterniza-pix-box">
      <div class="eterniza-success-mark">✓</div>
      <h2>Pagamento aprovado!</h2>
      <p>Sua história foi publicada com sucesso.</p>
      <div class="eterniza-success-actions">
        <button class="eterniza-pay-btn" type="button" id="openCardPublishedStory">Abrir minha história</button>
        <button class="eterniza-pay-secondary" type="button" id="copyCardPublishedStory">Copiar link</button>
        <button class="eterniza-pay-btn eterniza-share-btn" type="button" id="shareCardPublishedStory">📤 Compartilhar homenagem</button>
      </div>
    </div>
  `);
  const open = document.getElementById('openCardPublishedStory');
  if(open) open.onclick = () => navigateTop(url, false);
  const copy = document.getElementById('copyCardPublishedStory');
  if(copy) copy.onclick = () => {
    const fullUrl = location.origin + url;
    navigator.clipboard?.writeText(fullUrl);
    copy.textContent = 'Link copiado!';
    setTimeout(()=>copy.textContent='Copiar link',1800);
  };
}


function onlyCpfDigits(value){
  return String(value||'').replace(/\D/g,'').slice(0,11);
}

function formatCpfInput(value){
  const digits=onlyCpfDigits(value);
  return digits
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d)/,'$1.$2')
    .replace(/(\d{3})(\d{1,2})$/,'$1-$2');
}

function isValidCpfInput(value){
  const cpf=onlyCpfDigits(value);
  if(cpf.length!==11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum=0;
  for(let i=0;i<9;i++) sum+=Number(cpf[i])*(10-i);
  let digit=11-(sum%11);
  if(digit>=10) digit=0;
  if(digit!==Number(cpf[9])) return false;

  sum=0;
  for(let i=0;i<10;i++) sum+=Number(cpf[i])*(11-i);
  digit=11-(sum%11);
  if(digit>=10) digit=0;
  return digit===Number(cpf[10]);
}

async function getSavedBilling(){
  try{
    const res=await fetch('/api/user/billing',{cache:'no-store'});
    const data=await res.json().catch(()=>({}));
    if(res.ok && data.ok){
      const billing=data.billing||null;
      if(billing){
        state.userCpf=onlyCpfDigits(billing.cpf||'');
        state.userPhone=billing.phone||state.userPhone||'';
        persistBuilderState();
      }
      return billing;
    }
  }catch(error){
    console.warn('Não foi possível consultar os dados de cobrança.',error);
  }
  return null;
}

function requestCpfBeforePix(planSlug,billing={},couponCode=""){
  showPublishCheckoutStep(`
    <div class="eterniza-pix-box">
      <h2>Dados para pagamento</h2>
      <p>Para gerar o PIX, informe o CPF do comprador. Ele será salvo com segurança e solicitado apenas uma vez.</p>
      <label class="eterniza-cpf-label" for="eternizaCpfInput">CPF</label>
      <input class="eterniza-cpf-input" id="eternizaCpfInput" inputmode="numeric" autocomplete="off" maxlength="14" placeholder="000.000.000-00" value="${esc(formatCpfInput(billing.cpf||''))}">
      <label class="eterniza-cpf-label" for="eternizaPhoneInput">Telefone <small>(opcional)</small></label>
      <input class="eterniza-cpf-input" id="eternizaPhoneInput" inputmode="tel" autocomplete="tel" placeholder="(00) 00000-0000" value="${esc(formatPhone(billing.phone||''))}">
      <p id="eternizaCpfError" class="eterniza-cpf-error"></p>
      <button class="eterniza-pay-btn" type="button" id="saveCpfAndPix">Salvar e gerar PIX</button>
      <button class="eterniza-pay-secondary" type="button" id="backCpfToPayment" style="margin-top:10px;width:100%">Voltar</button>
    </div>
  `);

  const cpfInput=document.getElementById('eternizaCpfInput');
  if(cpfInput){
    cpfInput.oninput=()=>{cpfInput.value=formatCpfInput(cpfInput.value)};
  }

  const phoneInput=document.getElementById('eternizaPhoneInput');
  if(phoneInput){
    phoneInput.maxLength=15;
    phoneInput.oninput=()=>{phoneInput.value=formatPhone(phoneInput.value)};
  }

  const save=document.getElementById('saveCpfAndPix');
  if(save){
    save.onclick=async()=>{
      const cpf=onlyCpfDigits(cpfInput?.value||'');
      const phone=normalizePhone(document.getElementById('eternizaPhoneInput')?.value||'');
      const error=document.getElementById('eternizaCpfError');

      if(!isValidCpfInput(cpf)){
        if(error) error.textContent='Informe um CPF válido.';
        return;
      }

      save.disabled=true;
      save.textContent='Salvando...';
      if(error) error.textContent='';

      try{
        const res=await fetch('/api/user/billing',{
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body:JSON.stringify({cpf,phone})
        });
        const data=await res.json().catch(()=>({}));
        if(!res.ok || !data.ok) throw new Error(data.message||'Não foi possível salvar o CPF.');
        state.userCpf=cpf;
        if(data.billing?.phone) state.userPhone=data.billing.phone;
        persistBuilderState();
        createPreviewPix(planSlug,cpf,true,couponCode);
      }catch(err){
        if(error) error.textContent=err.message||'Não foi possível salvar os dados.';
        save.disabled=false;
        save.textContent='Salvar e gerar PIX';
      }
    };
  }

  const back=document.getElementById('backCpfToPayment');
  if(back) back.onclick=()=>choosePaymentMethod(planSlug);
}

async function createPreviewPix(planSlug,cpfCnpj='',billingAlreadyChecked=false,couponCode=''){
  const savedPlanSlug=String(state.plan?.slug||state.plan?.id||'').trim().toLowerCase();
  planSlug=savedPlanSlug||String(planSlug||'').trim().toLowerCase();
  if(!planSlug){
    showModal('Plano não encontrado','Não foi possível identificar o plano escolhido.');
    return;
  }
  if(pixCreationInFlight) return;
  pixCreationInFlight=true;

  try{
    let cpf=onlyCpfDigits(cpfCnpj);

    if(!cpf && !billingAlreadyChecked){
      const billing=await getSavedBilling();
      cpf=onlyCpfDigits(billing?.cpf||'');
      if(!isValidCpfInput(cpf)){
        requestCpfBeforePix(planSlug,billing||{},couponCode);
        return;
      }
    }

    if(!isValidCpfInput(cpf)){
      requestCpfBeforePix(planSlug,{cpf},couponCode);
      return;
    }

    showPublishCheckoutStep(`
      <div class="eterniza-pix-box">
        <div class="eterniza-loading-orb"></div>
        <h2>Gerando pagamento...</h2>
        <p>Estamos salvando sua história e preparando o PIX com segurança.</p>
        <div class="eterniza-pay-status"><span class="eterniza-spinner"></span><span>Aguarde um instante...</span></div>
      </div>
    `);

    const tribute = await ensureCurrentTributeSaved();

    const res = await fetch('/api/payments/create', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        tributeId: tribute.id,
        plan: planSlug,
        couponCode: String(couponCode || state.couponCode || "").trim().toUpperCase()
      })
    });

    const data = await res.json().catch(()=>({}));
    if(!res.ok || !data.ok){
      if(data?.code==='CPF_REQUIRED'){
        const billing=await getSavedBilling();
        requestCpfBeforePix(planSlug,billing||{cpf});
        return;
      }
      throw new Error(data.message || 'Erro ao gerar pagamento PIX.');
    }

    const payment = data.payment || {};
    showPublishCheckoutStep(`
      <div class="eterniza-pix-box">
        <h2>PIX gerado com sucesso</h2>
        <p>Pague com o QR Code abaixo. Após a aprovação, sua história será publicada automaticamente.</p>
        ${payment.coupon ? `<div class="eterniza-coupon-summary"><span>Cupom ${esc(payment.coupon.code)}</span><span>Desconto -${formatPlanCurrencyFromCents(payment.coupon.discountCents)}</span><strong>Total ${formatPlanCurrencyFromCents(payment.coupon.finalPriceCents)}</strong></div>` : ''}
        ${payment.qrCodeBase64 ? `<img class="eterniza-pix-img" src="data:image/png;base64,${payment.qrCodeBase64}" alt="QR Code PIX">` : ''}
        ${payment.qrCode ? `<textarea class="eterniza-pix-text" readonly id="eternizaPixCopy">${payment.qrCode}</textarea>` : ''}
        <button class="eterniza-pay-btn" type="button" id="copyPixBtn">Copiar PIX copia e cola</button>
        <div class="eterniza-pay-status" id="publishPaymentStatus"><span class="eterniza-spinner"></span><span>Aguardando confirmação do pagamento...</span></div>
      </div>
    `);

    const copyBtn = document.getElementById('copyPixBtn');
    if(copyBtn){
      copyBtn.onclick = () => {
        const val = document.getElementById('eternizaPixCopy')?.value || payment.qrCode || '';
        navigator.clipboard?.writeText(val);
        copyBtn.textContent = 'PIX copiado!';
        setTimeout(()=>copyBtn.textContent='Copiar PIX copia e cola',1800);
      };
    }

    startPublishStatusPolling(
      tribute.id,
      tribute.slug || state.slug,
      payment.asaasId || payment.mercadoPagoId || payment.id || ""
    );
  }catch(error){
    showPublishCheckoutStep(`
      <div class="eterniza-pix-box">
        <h2>Não foi possível gerar o PIX</h2>
        <p>${esc(error.message || 'Tente novamente em alguns instantes.')}</p>
        <button class="eterniza-pay-btn" type="button" id="tryPixAgain">Tentar novamente</button>
      </div>
    `);
    const again = document.getElementById('tryPixAgain');
    if(again) again.onclick = openPublishCheckout;
  }finally{
    pixCreationInFlight=false;
  }
}

function launchPaymentConfetti(){
  const old=document.getElementById('eternizaPaymentConfetti');
  if(old) old.remove();

  const field=document.createElement('div');
  field.id='eternizaPaymentConfetti';
  field.className='eterniza-confetti';

  for(let i=0;i<38;i++){
    const piece=document.createElement('i');
    piece.style.left=`${(i*37)%100}%`;
    piece.style.background=`hsl(${(i*53)%360} 82% 66%)`;
    piece.style.animationDelay=`${(i%9)*.08}s`;
    piece.style.transform=`rotate(${(i*41)%360}deg)`;
    field.appendChild(piece);
  }

  document.body.appendChild(field);
  setTimeout(()=>field.remove(),3600);
}


async function shareEternizaTribute({title,url}){
  const safeUrl=String(url||'').trim();
  if(!safeUrl) return false;

  const shareTitle=String(title||'Uma homenagem especial').trim();
  const shareText='Preparei uma homenagem muito especial para você ❤️';

  if(navigator.share){
    try{
      await navigator.share({title:shareTitle,text:shareText,url:safeUrl});
      return true;
    }catch(error){
      if(error?.name==='AbortError') return false;
      console.warn('Compartilhamento nativo indisponível.',error);
    }
  }

  try{
    await navigator.clipboard.writeText(`${shareText}\n\n${safeUrl}`);
    showModal('Link copiado','O compartilhamento nativo não está disponível neste navegador. O link foi copiado.');
    return true;
  }catch(error){
    window.prompt('Copie o link da homenagem:',safeUrl);
    return false;
  }
}

function finishPaymentAndGoToDashboard({tributeId,slug,publicUrl,title}){
  const successData={
    tributeId:tributeId||'',
    slug:slug||'',
    publicUrl:publicUrl||(slug?`/presente/${slug}`:''),
    title:title||state.receiverName||'Sua homenagem'
  };

  try{
    sessionStorage.setItem('eternizaPaymentSuccess',JSON.stringify(successData));
  }catch(error){
    console.warn('Não foi possível guardar o aviso de pagamento.',error);
  }

  const params=new URLSearchParams({
    payment:'success',
    tributeId:successData.tributeId,
    slug:successData.slug
  });

  navigateTop(`/dashboard?${params.toString()}`,true);
}

function startPublishStatusPolling(tributeId, fallbackSlug, asaasId=''){
  if(publishPollTimer) clearInterval(publishPollTimer);

  const checkPayment=async()=>{
    try{
      const params=new URLSearchParams({
        tributeId:String(tributeId||'')
      });
      if(asaasId) params.set('asaasId',String(asaasId));

      const res=await fetch(`/api/payments/status?${params.toString()}`,{cache:'no-store'});
      const data=await res.json().catch(()=>({}));
      if(!res.ok || !data.ok) return;

      if(data.paymentStatus==='APPROVED' || data.published){
        if(publishPollTimer) clearInterval(publishPollTimer);
        publishPollTimer=null;

        const slug=data.tribute?.slug || fallbackSlug || '';
        const url=data.publicUrl || (slug?`/presente/${slug}`:'/dashboard');
        const fullUrl=url.startsWith('http')?url:(location.origin+url);

        launchPaymentConfetti();

        showPublishCheckoutStep(`
          <div class="eterniza-pix-box eterniza-success-screen">
            <div class="eterniza-success-mark">✓</div>
            <p class="eterniza-success-sub">Pagamento confirmado</p>
            <h2>Sua homenagem está no ar!</h2>
            <p><b>${esc(data.tributeTitle||state.receiverName||'Sua história')}</b> foi publicada com sucesso.</p>
            <div class="eterniza-success-actions">
              <button class="eterniza-pay-btn" type="button" id="openPublishedStory">Ver história</button>
              <button class="eterniza-pay-secondary" type="button" id="copyPublishedStory">Copiar link</button>
              <button class="eterniza-pay-btn eterniza-share-btn" type="button" id="sharePublishedStory">📤 Compartilhar homenagem</button>
            </div>
            <p class="eterniza-success-countdown">Você será levado ao seu painel em <b id="eternizaRedirectSeconds">5</b> segundos.</p>
          </div>
        `);

        const successData={
          tributeId:data.tribute?.id||tributeId,
          slug,
          publicUrl:url,
          title:data.tributeTitle||state.receiverName||'Sua homenagem'
        };

        let countdown=null;

        document.getElementById('openPublishedStory')?.addEventListener('click',()=>{
          if(countdown) clearInterval(countdown);
          navigateTop(url,false);
        });
        document.getElementById('copyPublishedStory')?.addEventListener('click',async event=>{
          if(countdown) clearInterval(countdown);
          await navigator.clipboard?.writeText(fullUrl);
          event.currentTarget.textContent='✓ Link copiado';
        });
        document.getElementById('sharePublishedStory')?.addEventListener('click',async event=>{
          if(countdown) clearInterval(countdown);
          const button=event.currentTarget;
          const original=button.textContent;
          button.textContent='Abrindo compartilhamento...';
          button.disabled=true;
          try{
            await shareEternizaTribute({
              title:data.tributeTitle||state.receiverName||'Uma homenagem especial',
              url:fullUrl
            });
          }finally{
            button.disabled=false;
            button.textContent=original;
          }
        });

        let seconds=5;
        const secondsEl=document.getElementById('eternizaRedirectSeconds');
        countdown=setInterval(()=>{
          seconds-=1;
          if(secondsEl) secondsEl.textContent=String(Math.max(0,seconds));
          if(seconds<=0){
            clearInterval(countdown);
            finishPaymentAndGoToDashboard(successData);
          }
        },1000);
      }
    }catch(error){
      console.warn('Não foi possível consultar o pagamento.',error);
    }
  };

  checkPayment();
  publishPollTimer=setInterval(checkPayment,3000);
}

/* ===== Fim Checkout PIX direto na prévia ===== */



(function injectAdminPlanStyles(){
  if(document.getElementById('adminPlanStyles')) return;
  const style=document.createElement('style');
  style.id='adminPlanStyles';
  style.textContent=`
    .promo-badge{display:inline-flex;margin:8px 0 0;padding:5px 9px;border-radius:999px;background:rgba(239,189,82,.18);color:#f6cf72;font-size:12px;font-style:normal;font-weight:900}
    .old-price{display:block;color:#cbb98f;text-decoration:line-through;margin-top:-8px;margin-bottom:8px}
    .hidden{display:none!important}
    .plan-editor-card{display:grid;gap:12px}
    .plan-editor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
    .plan-editor-head small{display:block;color:#f6cf72;text-transform:uppercase;font-weight:900;letter-spacing:.06em}
    .plan-editor-head h3{margin:3px 0 0}
    .promo-status{border-color:rgba(239,189,82,.35)!important;color:#f6cf72!important}
    .admin-grid-2.compact{gap:10px}
    .admin-grid-2.compact label,.plan-editor-card label{display:grid;gap:6px;color:#ead9b7;font-weight:800}
    .admin-textarea{min-height:92px;resize:vertical}
    .promo-editor{border:1px solid rgba(239,189,82,.16);background:rgba(0,0,0,.16);border-radius:16px;padding:12px;display:grid;gap:10px}
    .promo-toggle{display:flex!important;grid-template-columns:auto 1fr;align-items:center;gap:8px}
    .youtube-selected-box{align-items:center;gap:14px;flex-wrap:wrap}
    .youtube-selected-box img{width:82px;height:62px;object-fit:cover;border-radius:12px}
    .youtube-selected-copy{display:grid;gap:3px;min-width:180px;flex:1}
    .youtube-selected-copy small{color:#77d9a0;font-weight:900}
    .youtube-selected-copy strong{color:#fff;font-size:16px}
    .youtube-selected-copy span{color:#d8c8ab;font-size:13px}
    .youtube-selected-actions{display:flex;gap:8px;flex-wrap:wrap}
    .ghost-btn.danger{border-color:rgba(255,90,90,.35);color:#ffb0b0}
    .youtube-result-selected{border-color:#77d9a0!important;box-shadow:0 0 0 3px rgba(119,217,160,.13)!important}
    .eterniza-music-toast{position:fixed;right:22px;bottom:22px;z-index:99999;display:flex;align-items:center;gap:10px;padding:14px 18px;border-radius:14px;background:#10251a;color:#eafff0;border:1px solid rgba(119,217,160,.45);box-shadow:0 18px 55px rgba(0,0,0,.45);opacity:0;transform:translateY(18px);pointer-events:none;transition:.25s ease}
    .eterniza-music-toast.show{opacity:1;transform:translateY(0)}
    .eterniza-music-toast span{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#77d9a0;color:#082012;font-weight:1000}

    /* Modal padrão com fundo sólido e contraste alto */
    #modal{background:rgba(0,0,0,.82)!important;backdrop-filter:blur(10px)!important;-webkit-backdrop-filter:blur(10px)!important}
    #modal>div,#modal .modal-card,#modal .modal-content,#modal .modal-box{
      background:linear-gradient(145deg,#171c1a,#0d1210)!important;
      border:1px solid rgba(239,189,82,.34)!important;
      box-shadow:0 28px 90px rgba(0,0,0,.68),0 0 0 1px rgba(255,255,255,.025)!important;
      opacity:1!important;
      color:#fff!important;
    }
    #modalTitle{color:#fff8ea!important;text-shadow:none!important}
    #modalText{color:#e7dfd2!important;opacity:1!important;line-height:1.65!important}
    #modalOk{
      display:flex!important;
      align-items:center!important;
      justify-content:center!important;
      min-width:150px!important;
      min-height:48px!important;
      margin:22px auto 0!important;
      border:0!important;
      border-radius:14px!important;
      background:linear-gradient(135deg,#c99337,#f7dc82)!important;
      color:#171005!important;
      font-weight:1000!important;
      box-shadow:0 12px 30px rgba(239,189,82,.2)!important;
      cursor:pointer!important;
    }

    /* Organização do seletor e botão da sugestão de texto */
    .eterniza-ai-controls{
      display:grid!important;
      grid-template-columns:minmax(0,1fr) minmax(210px,auto)!important;
      gap:14px!important;
      align-items:stretch!important;
      width:100%!important;
      margin-top:8px!important;
    }
    .eterniza-ai-controls #aiTextStyle{
      width:100%!important;
      min-width:0!important;
      min-height:54px!important;
      margin:0!important;
      padding:0 16px!important;
      border:1px solid rgba(239,189,82,.22)!important;
      border-radius:15px!important;
      background:#232826!important;
      color:#fff!important;
      font:inherit!important;
      outline:none!important;
      box-sizing:border-box!important;
    }
    .eterniza-ai-controls #aiTextStyle:focus{
      border-color:#efbd52!important;
      box-shadow:0 0 0 3px rgba(239,189,82,.12)!important;
    }
    .eterniza-ai-controls #aiTextBtn{
      min-height:54px!important;
      margin:0!important;
      padding:0 22px!important;
      border:0!important;
      border-radius:15px!important;
      background:linear-gradient(135deg,#c99337,#f7dc82)!important;
      color:#171005!important;
      font-weight:1000!important;
      white-space:nowrap!important;
      box-shadow:0 12px 30px rgba(239,189,82,.16)!important;
      cursor:pointer!important;
      transition:transform .2s ease,box-shadow .2s ease!important;
    }
    .eterniza-ai-controls #aiTextBtn:hover{
      transform:translateY(-2px)!important;
      box-shadow:0 16px 36px rgba(239,189,82,.24)!important;
    }

    @media(max-width:700px){
      .eterniza-ai-controls{grid-template-columns:1fr!important}
      .eterniza-ai-controls #aiTextBtn{width:100%!important}
    }
    @media(max-width:600px){.youtube-selected-actions{width:100%}.youtube-selected-actions button{flex:1}.eterniza-music-toast{left:16px;right:16px;bottom:16px}}
  `;
  document.head.appendChild(style);
})();

['landingCreateBtn','landingCreateTopBtn'].forEach(id=>{const el=$(id); if(el){el.setAttribute('href','/cadastro'); el.setAttribute('target','_top'); el.addEventListener('click', goLoginCreate);}});
['landingLoginBtn','landingLoginTopBtn'].forEach(id=>{const el=$(id); if(el){el.setAttribute('href','/login'); el.setAttribute('target','_top'); el.addEventListener('click', goLoginEnter);}});
if($('demoOpenBtn')) { $('demoOpenBtn').setAttribute('href','/presente/demo-maria-e-jose'); $('demoOpenBtn').setAttribute('target','_top'); $('demoOpenBtn').addEventListener('click', (e)=>{e.preventDefault(); ensureDemoOrder(); navigateTop('/presente/demo-maria-e-jose'); return false;}); }
$('showLoginBtn').onclick=()=>setAuthMode('login');
$('showCreateBtn').onclick=()=>setAuthMode('create');
$('loginBtn').onclick=()=>navigateTop('/login',true);
(function organizeAiTextControls(){
  const select=$('aiTextStyle');
  const button=$('aiTextBtn');
  if(!select || !button) return;

  let wrapper=document.getElementById('eternizaAiControls');
  if(!wrapper){
    wrapper=document.createElement('div');
    wrapper.id='eternizaAiControls';
    wrapper.className='eterniza-ai-controls';
    select.parentNode.insertBefore(wrapper,select);
  }

  wrapper.appendChild(select);
  wrapper.appendChild(button);
})();


(function injectStoryOpeningUx(){
  if(document.getElementById('eternizaStoryOpeningUx')) return;
  const style=document.createElement('style');
  style.id='eternizaStoryOpeningUx';
  style.textContent=`
    body[data-screen="previewScreen"]{overflow-x:hidden}
    .story-stage{min-height:100svh}
    .story-open{
      box-sizing:border-box!important;
      min-height:100svh!important;
      height:100svh!important;
      max-height:100svh!important;
      padding:max(18px,env(safe-area-inset-top)) 20px max(22px,env(safe-area-inset-bottom))!important;
      display:flex!important;
      flex-direction:column!important;
      align-items:center!important;
      justify-content:center!important;
      gap:clamp(8px,1.6vh,16px)!important;
      overflow:hidden!important;
      text-align:center!important;
    }
    .story-open .story-logo{
      width:clamp(76px,14vh,130px)!important;
      max-height:16vh!important;
      object-fit:contain!important;
      margin:0!important;
    }
    .story-open .badge{margin:0!important}
    .story-open h2{
      margin:0!important;
      max-width:760px!important;
      font-size:clamp(28px,5.2vw,58px)!important;
      line-height:1.02!important;
    }
    .story-open p{
      margin:0!important;
      max-width:620px!important;
      font-size:clamp(14px,2.2vw,19px)!important;
      line-height:1.35!important;
    }
    .story-open .story-start{
      flex:none!important;
      min-height:56px!important;
      margin:clamp(4px,1vh,10px) 0 0!important;
      padding:0 clamp(22px,5vw,42px)!important;
      font-size:clamp(15px,2.4vw,19px)!important;
      position:relative!important;
      z-index:5!important;
      animation:eternizaOpenButtonIn .7s ease both,eternizaOpenButtonPulse 2.2s ease-in-out .8s infinite!important;
      box-shadow:0 16px 42px rgba(239,189,82,.28)!important;
    }
    .story-open>small{
      margin:0!important;
      max-width:620px!important;
      font-size:clamp(10px,1.7vw,13px)!important;
      line-height:1.25!important;
      opacity:.76!important;
    }
    @keyframes eternizaOpenButtonIn{
      from{opacity:0;transform:translateY(14px) scale(.96)}
      to{opacity:1;transform:translateY(0) scale(1)}
    }
    @keyframes eternizaOpenButtonPulse{
      0%,100%{transform:scale(1);box-shadow:0 16px 42px rgba(239,189,82,.22)}
      50%{transform:scale(1.035);box-shadow:0 20px 52px rgba(239,189,82,.38)}
    }
    @media(max-height:650px){
      .story-open{gap:7px!important;padding-top:10px!important;padding-bottom:10px!important}
      .story-open .story-logo{width:70px!important;max-height:12vh!important}
      .story-open h2{font-size:clamp(24px,5vw,38px)!important}
      .story-open .story-start{min-height:48px!important}
      .story-open>small{display:none!important}
    }
    @media(max-width:600px){
      .story-open{padding-left:16px!important;padding-right:16px!important}
      .story-open h2{font-size:clamp(27px,9vw,42px)!important}
      .story-open .story-start{width:min(100%,360px)!important}
    }
    .story-content{
      scroll-margin-top:0!important;
    }
    .story-prologue{
      scroll-margin-top:0!important;
    }
    .story-open.hide{
      opacity:0!important;
      transform:scale(.985)!important;
      pointer-events:none!important;
      transition:opacity .42s ease,transform .42s ease!important;
    }
    .story-content.show{
      animation:eternizaStoryContentIn .55s ease both!important;
    }
    @keyframes eternizaStoryContentIn{
      from{opacity:0;transform:translateY(14px)}
      to{opacity:1;transform:translateY(0)}
    }
    @media(prefers-reduced-motion:reduce){
      .story-open .story-start{animation:none!important}
      .story-open.hide,.story-content.show{animation:none!important;transition:none!important}
    }
  `;
  document.head.appendChild(style);
})();

$('createAccountBtn').onclick=createAccount;if($('logoutBtn')) $('logoutBtn').onclick=adminLogout;$('previewBtn').onclick=()=>{document.body.dataset.publicGift='false';buildPreview();};$('editBtn').onclick=()=>go('detailsScreen');$('publishBtn').textContent='❤️ Gerar PIX e publicar';$('publishBtn').onclick=openPublishCheckout;if($('newGiftBtn')) $('newGiftBtn').onclick=()=>go('recipientScreen'); if($('dashboardNewGiftBtn')) $('dashboardNewGiftBtn').onclick=()=>go('recipientScreen');$('backDetailsBtn').onclick=()=>go('recipientScreen');$('aiTextBtn').onclick=aiSuggestion;$('musicMode').onchange=()=>{stopAllMediaPlayback();state.musicMode=$('musicMode').value;state.selectedTrack=currentTrack();saveState();toggleYoutubeField();};document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{activeFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active-filter'));b.classList.add('active-filter');renderOrders()});
setupAuthAndYoutubeHelpers();renderRecipients();renderPlans();loadDynamicPlans();if(state.userEmail)$('email').value=state.userEmail;
window.addEventListener('hashchange',()=>{stopAllMediaPlayback();openRoute();});
window.addEventListener('pagehide',stopAllMediaPlayback);
window.addEventListener('beforeunload',stopAllMediaPlayback);
document.addEventListener('visibilitychange',()=>{if(document.hidden) stopAllMediaPlayback();});
if(!openRoute())go('landingScreen');
