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

const plans = [
  {id:'basico', name:'Básico', price:'R$ 19,90', cents:1990, photos:2, duration:'1 mês', features:['2 fotos','Música por YouTube','Carta personalizada']},
  {id:'top', name:'Top', price:'R$ 28,90', cents:2890, photos:5, duration:'5 meses', features:['5 fotos','Música de fundo','Carta personalizada','Contador para casais']},
  {id:'premium', name:'Premium', price:'R$ 39,90', cents:3990, photos:10, duration:'vitalício', features:['10 fotos','Música de fundo','Carta personalizada','Contador para casais','Data especial para casais']}
];
const screens=['landingScreen','loginScreen','dashboardScreen','recipientScreen','planScreen','detailsScreen','previewScreen','adminScreen'];
const $=id=>document.getElementById(id);
let state=JSON.parse(localStorage.getItem('giftBuilderState')||'{}');
let orders=JSON.parse(localStorage.getItem('giftOrders')||'[]');
let timer=null, carouselTimer=null, activeFilter='todos', activeAudio=null;
let autosaveTimer=null;
let autosaveBusy=false;
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
          localStorage.setItem('giftBuilderState',JSON.stringify(state));
          document.body.dataset.autosave='saved';
        }else{
          document.body.dataset.autosave='error';
        }
      }catch(e){document.body.dataset.autosave='error'}finally{autosaveBusy=false}
    },900);
  }catch(e){}
}
function saveState(){localStorage.setItem('giftBuilderState',JSON.stringify(state)); autosaveToNeon()} function saveOrders(){localStorage.setItem('giftOrders',JSON.stringify(orders))}
function adminLogout(){
  stopAppMusic();
  state={};
  saveState();
  fetch('/api/auth/logout',{method:'POST'}).finally(()=>navigateTop('/login', true));
}
function showModal(t,m){$('modalTitle').textContent=t;$('modalText').textContent=m;$('modal').classList.remove('hidden')} $('modalOk').onclick=()=>$('modal').classList.add('hidden');
function go(screen){screens.forEach(id=>$(id).classList.remove('active'));$(screen).classList.add('active');document.body.dataset.screen=screen;const m={landingScreen:['Eterniza','Onde Cada História Vive Para Sempre.',0],loginScreen:['Entrar','Acesse ou crie sua conta para começar.',10],dashboardScreen:['Meu painel','Gerencie suas homenagens Eterniza.',16],recipientScreen:['Para quem é?','O tema será escolhido automaticamente.',25],planScreen:['Escolha o plano','Defina fotos, validade e recursos.',42],detailsScreen:['Monte a página','Preencha textos, cores, fotos e música.',68],previewScreen:['Prévia profissional','Confira como o cliente verá.',88],adminScreen:['Painel Jeslie','Gestão de pedidos, clientes, status e links.',100]};$('screenTitle').textContent=m[screen][0];$('screenSubtitle').textContent=m[screen][1];$('progressBar').style.width=m[screen][2]+'%'; if(screen==='dashboardScreen') renderClientDashboard(); if(screen!=='previewScreen'&&timer) clearInterval(timer)}
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

    // Plano padrão só para liberar o editor.
    // O plano real será escolhido no pagamento.
    state.plan = plans.find(p => p.id === 'premium');

    saveState();
    prepareDetails();
    go('detailsScreen');
  });
}
function renderPlans(){$('planGrid').innerHTML=plans.map(p=>`<button class="plan-card" data-plan="${p.id}"><strong>${p.name}</strong><div class="price">${p.price}</div><p>Online: <b>${p.duration}</b></p><ul>${p.features.map(f=>`<li>${f}</li>`).join('')}</ul></button>`).join('');document.querySelectorAll('[data-plan]').forEach(b=>b.onclick=()=>{state.plan=plans.find(p=>p.id===b.dataset.plan);saveState();prepareDetails();go('detailsScreen')})}
function prepareDetails(){
  const r=state.recipient||recipients[0], p=state.plan||plans[0];
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
  $('photoLimit').textContent=`Seu plano ${p.name} permite até ${p.photos} foto(s). Clique em cada caixa para adicionar uma foto. Não precisa preencher todas.`;
  state.photos = Array.isArray(state.photos) ? state.photos.slice(0,p.photos) : [];
  saveState();
  renderSlots(p.photos);
}
function renderSlots(total=(state.plan?.photos||2)){
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
      state.photos.splice(idx,1);
      saveState();
      renderSlots(total);
    };
  });
}
function filesToDataUrls(files){
  return Promise.all([...files].map(f=>new Promise(res=>{
    const r=new FileReader();
    r.onload=e=>res(e.target.result);
    r.readAsDataURL(f);
  })));
}
$('photos').addEventListener('change',async()=>{
  const max=state.plan?.photos||2;
  const chosen=await filesToDataUrls($('photos').files);
  if(!chosen.length) return;
  state.photos=Array.isArray(state.photos)?state.photos:[];
  let slot=Number($('photos').dataset.slot||0);
  chosen.forEach(src=>{
    if(slot<max){ state.photos[slot]=src; slot++; }
  });
  state.photos=state.photos.filter(Boolean).slice(0,max);
  saveState();
  renderSlots(max);
  if(chosen.length > max) showModal('Limite do plano',`Este plano aceita até ${max} foto(s).`);
});
function youtubeId(url){if(!url)return'';const ps=[/youtube\.com\/watch\?v=([^&]+)/,/youtube\.com\/watch\?.*?&v=([^&]+)/,/youtu\.be\/([^?&]+)/,/youtube\.com\/shorts\/([^?&]+)/,/youtube\.com\/embed\/([^?&]+)/,/youtube\.com\/live\/([^?&]+)/];for(const p of ps){const m=url.trim().match(p);if(m)return m[1].replace(/[^a-zA-Z0-9_-]/g,'')}return''}
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
  const r=state.recipient?.id||'outro';
  const recv=($('receiverName')?.value||'você').trim()||'você';
  const send=($('senderName')?.value||'alguém que te ama').trim()||'alguém que te ama';
  const style=($('aiTextStyle')?.value||'emocionante');
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
  $('letterText').value = recipientSpecific[r] || base[style] || base.emocionante;
  showModal('Texto criado','Criei uma sugestão mais completa. Você pode editar tudo antes de gerar a homenagem.');
}
async function buildPreview(){if(!state.plan||!state.recipient)return showModal('Falta informação','Escolha destinatário e plano.');state.receiverName=$('receiverName').value.trim();state.senderName=$('senderName').value.trim();state.specialDate=$('specialDate').value;state.musicMode=$('musicMode').value;state.selectedTrack=currentTrack();state.youtubeLink=$('youtubeLink').value.trim();state.letterText=$('letterText').value.trim();state.primaryColor=$('primaryColor').value;state.secondaryColor=$('secondaryColor').value;if(!state.receiverName||!state.senderName||!state.letterText)return showModal('Campos obrigatórios','Preencha quem recebe, quem envia e a carta.');const id=youtubeId(state.youtubeLink);if(state.musicMode==='youtube'&&state.youtubeLink&&!id)return showModal('Link inválido','Cole um link válido do YouTube.');state.youtubeId=state.musicMode==='youtube'?id:'';state.photos=(Array.isArray(state.photos)?state.photos:[]).filter(Boolean).slice(0,state.plan.photos);saveState();renderPreview();go('previewScreen')}
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
        <h2>${esc(state.receiverName)},<br>tem uma história esperando por você.</h2>
        <p>Preparada com carinho por ${esc(state.senderName)}.</p>
        <button type="button" class="primary-btn story-start" id="startSurprise">Abrir surpresa e tocar música ❤️</button>
        ${(state.musicMode!=='youtube'&&currentTrack())?`<small>Trilha Eterniza: ${esc(currentTrack().title)}.</small>`:(state.youtubeId?'<small>A música tenta iniciar pelo YouTube nesse clique.</small>':'<small>Sem música informada nesta prévia.</small>')}
      </div>
      <div class="story-content" id="storyContent">
        <div class="story-topbar">
          <span>${esc(r.theme)}</span>
          ${((state.musicMode!=='youtube'&&currentTrack())||state.youtubeId)?`<button type="button" id="playMusic" class="music-pill">▶ Música</button>`:''}
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
        ${state.youtubeId?`<div class="music-frame-wrap" id="ytHolder"></div>`:''}
      </div>
    </section>`;
  $('orderSummary').innerHTML=`<div class="order-line"><span>Cliente</span><strong>${esc(state.userEmail||'-')}</strong></div><div class="order-line"><span>Para</span><strong>${esc(r.title)}</strong></div><div class="order-line"><span>Tema</span><strong>${esc(r.theme)}</strong></div><div class="order-line"><span>Plano</span><strong>${esc(p.name)}</strong></div><div class="order-line"><span>Valor</span><strong>${esc(p.price)}</strong></div><div class="order-line"><span>Fotos</span><strong>${photoList.length}/${p.photos}</strong></div><div class="order-line"><span>Validade</span><strong>${esc(p.duration)}</strong></div>`;
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
    startMusic(false);
    open.classList.add('hide');
    content.classList.add('show');
    setTimeout(()=>open.style.display='none',900);
    runPrologue();
    setTimeout(()=>{
      runCineSlides();
      scrollStoryToPhotos();
    },11200);
    setTimeout(typeLetter,13800);
  };
  initMusic();
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
  if(!show) stopYoutubePreview();
  state.musicMode=mode;
  updateTrackInfo();
}
function stopAppMusic(){
  if(activeAudio){
    try{activeAudio.pause(); activeAudio.currentTime=0;}catch(e){}
    activeAudio=null;
  }
}
function startAppMusic(){
  stopAppMusic();
  const t=currentTrack();
  if(!t || !t.src) return false;
  activeAudio = new Audio(t.src);
  activeAudio.loop = true;
  activeAudio.volume = 0;
  const fadeTarget = .68;
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
function youtubeEmbedSrc(){
  if(!state.youtubeId) return '';
  const params=new URLSearchParams({
    autoplay:'1', mute:'0', controls:'0', rel:'0', modestbranding:'1', playsinline:'1', enablejsapi:'1', fs:'0', iv_load_policy:'3'
  });
  if(location.protocol.startsWith('http')) params.set('origin',location.origin);
  return `https://www.youtube.com/embed/${state.youtubeId}?${params.toString()}`;
}
function createYoutubeFrame(){
  const holder=$('ytHolder');
  if(!holder||!state.youtubeId) return null;
  let frame=$('ytFrame');
  if(frame) return frame;
  frame=document.createElement('iframe');
  frame.id='ytFrame';
  frame.title='Música do YouTube';
  frame.src=youtubeEmbedSrc();
  frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
  frame.setAttribute('allowfullscreen','');
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
    if(showMsg&&!ok) showModal('Música de fundo','Este navegador não liberou o áudio interno. Tente clicar novamente em “Tocar música”.');
    return;
  }
  if(!state.youtubeId) return;
  stopAppMusic();
  const frame=createYoutubeFrame();
  if(!frame) return;
  if(b){b.textContent='♫ Tentando tocar'; b.classList.add('playing')}
  const tryPlay=()=>{commandYoutube(frame,'unMute');commandYoutube(frame,'setVolume',[100]);commandYoutube(frame,'playVideo')};
  tryPlay();
  frame.onload=()=>setTimeout(tryPlay,350);
  setTimeout(tryPlay,800);
  setTimeout(tryPlay,1800);
  setTimeout(()=>{ if(b) b.innerHTML='▶ Tocar música novamente'; },4200);
  if(showMsg) showModal('YouTube','Se não sair som, o vídeo ou o navegador bloqueou a reprodução em segundo plano. Para venda, a opção mais segura é usar as trilhas prontas do app.');
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
function stopYoutubePreview(){
  if(youtubePreviewFrame) commandYoutube(youtubePreviewFrame,'pauseVideo');
  youtubePreviewPlaying=false;
  const btn=$('youtubePlayPauseBtn');
  if(btn){btn.textContent='▶ Play prévia'; btn.disabled=!youtubePreviewLoadedId; btn.classList.remove('playing');}
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
function selectYoutubeResult(item){
  selectedYoutubeResult=item;
  state.youtubeId=item.id;
  state.youtubeLink=`https://www.youtube.com/watch?v=${item.id}`;
  if($('youtubeLink')) $('youtubeLink').value=state.youtubeLink;
  const selected=$('youtubeSelectedBox');
  if(selected){
    selected.classList.remove('hidden');
    selected.innerHTML=`<img src="${esc(item.thumb)}" alt=""><div><strong>${esc(item.title)}</strong><span>${esc(item.channel)}</span><small>Música selecionada para a homenagem</small></div>`;
  }
  loadYoutubePreview(item.id);
  saveState();
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
function loadYoutubePreview(idOverride){
  const id=idOverride || state.youtubeId || youtubePreviewLoadedId || youtubeId(($('youtubeLink')?.value||'').trim());
  if(!id) return showModal('YouTube','Escolha uma música na lista para carregar a prévia.');
  const holder=$('youtubePreviewHolder');
  if(!holder) return;
  stopYoutubePreview();
  youtubePreviewLoadedId=id;
  youtubePreviewFrame=document.createElement('iframe');
  youtubePreviewFrame.title='Prévia de áudio do YouTube';
  youtubePreviewFrame.className='youtube-hidden-frame';
  youtubePreviewFrame.src=youtubePreviewSrc(id);
  youtubePreviewFrame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture');
  youtubePreviewFrame.setAttribute('allowfullscreen','');
  holder.innerHTML='';
  holder.appendChild(youtubePreviewFrame);
  const note=document.createElement('div');
  note.className='youtube-preview-note audio-only';
  note.innerHTML='Prévia em modo áudio. O vídeo fica oculto na Eterniza. Se não tocar, abra o projeto pelo arquivo <strong>iniciar-eterniza.bat</strong> ou escolha outra versão da música.';
  holder.appendChild(note);
  const btn=$('youtubePlayPauseBtn');
  if(btn){btn.disabled=false; btn.textContent='▶ Play prévia'; btn.classList.remove('playing');}
}
function toggleYoutubePreview(){
  if(!youtubePreviewFrame){ loadYoutubePreview(); }
  if(!youtubePreviewFrame) return;
  const btn=$('youtubePlayPauseBtn');
  if(location.protocol === 'file:'){
    showModal('Prévia do YouTube','O YouTube costuma bloquear player quando o HTML é aberto direto pelo arquivo. Abra pelo <strong>iniciar-eterniza.bat</strong> para rodar em localhost e testar a prévia sem mostrar vídeo.');
  }
  if(youtubePreviewPlaying){
    commandYoutube(youtubePreviewFrame,'pauseVideo');
    youtubePreviewPlaying=false;
    if(btn){btn.textContent='▶ Play prévia'; btn.classList.remove('playing');}
    return;
  }
  commandYoutube(youtubePreviewFrame,'unMute');
  commandYoutube(youtubePreviewFrame,'setVolume',[100]);
  commandYoutube(youtubePreviewFrame,'playVideo');
  youtubePreviewPlaying=true;
  if(btn){btn.textContent='⏸ Pausar prévia'; btn.classList.add('playing');}
}
function setupAuthAndYoutubeHelpers(){
  ['email','newEmail'].forEach(id=>{
    const el=$(id);
    if(el) el.addEventListener('input',()=>{ const pos=el.selectionStart; el.value=el.value.toLowerCase(); try{el.setSelectionRange(pos,pos)}catch(e){}; });
  });
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
        ['clientes','👥 Clientes','Cadastros, WhatsApp e histórico'],['homenagens','🎁 Homenagens','Links, status e publicações'],['biblioteca','🎵 Biblioteca','Trilhas Eterniza e YouTube'],['escritor','🤖 Escritor Eterniza','Cartas por emoção e tamanho'],['cupons','🎟️ Cupons','Datas comemorativas e descontos'],['pagamentos','💳 Pagamentos','Pix, cartão e Asaas'],['analytics','📊 Analytics','Visualizações, QR e dispositivos'],['qrcode','▦ QR Code','PNG, PDF, etiqueta e cartão'],['whatsapp','📱 WhatsApp','Mensagens prontas para clientes'],['configuracoes','⚙️ Configurações','Logo, planos, domínio e APIs']
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
    `<div class="admin-grid-2"><div class="admin-panel-pro"><h3>Marca</h3><label>Nome da marca</label><input class="admin-search" value="Eterniza"><label>Slogan</label><input class="admin-search" value="Onde Cada História Vive Para Sempre!"><button class="primary-btn full" data-admin-modal="Configurações salvas|Na próxima etapa salvaremos no banco de dados.">Salvar marca</button></div><div class="admin-panel-pro"><h3>Integrações</h3><div class="settings-line"><span>YouTube API</span><b>Configurada</b></div><div class="settings-line"><span>Asaas</span><b>Pendente</b></div><div class="settings-line"><span>OpenAI/IA</span><b>Pendente</b></div><div class="settings-line"><span>Domínio</span><b>eterniza.com.br</b></div></div></div>`;
  }
  document.querySelectorAll('[data-admin-section]').forEach(b=>{ if(!b.dataset.bound){ b.dataset.bound='1'; b.onclick=()=>renderAdminSection(b.dataset.adminSection); }});
  document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=()=>{navigator.clipboard?.writeText(b.dataset.copy);showModal('Link copiado',b.dataset.copy)});
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>navigateTop('/presente/'+b.dataset.open));
  document.querySelectorAll('[data-qr]').forEach(b=>b.onclick=()=>showModal('QR Code Eterniza',`Use este link para gerar/colar no QR Code: ${b.dataset.qr}`));
  document.querySelectorAll('[data-admin-modal]').forEach(b=>b.onclick=()=>{const [t,msg]=(b.dataset.adminModal||'Eterniza|Ação preparada.').split('|');showModal(t,msg)});
}
function renderOrders(){ renderAdminSection(activeAdminSection||'dashboard'); }

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
    if(order){state={...state,...order};saveState();renderPreview();go('previewScreen');document.body.dataset.publicGift='true';setTimeout(()=>{document.querySelector('.gift-preview')?.scrollIntoView({behavior:'smooth',block:'start'});},250);return true;}
    go('landingScreen');showModal('Link não encontrado','Este presente ainda não existe neste navegador.');return true;
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
    if(order){state={...state,...order};saveState();renderPreview();go('previewScreen');document.body.dataset.publicGift='true';setTimeout(()=>{document.querySelector('.gift-preview')?.scrollIntoView({behavior:'smooth',block:'start'});},250);return true;}
    go('landingScreen');showModal('Link não encontrado','Este presente ainda não existe neste navegador.');return true;
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
      .eterniza-pix-text{width:100%;min-height:96px;border-radius:16px;border:1px solid rgba(239,189,82,.25);background:rgba(255,255,255,.08);color:#fff;padding:14px;box-sizing:border-box}
      .eterniza-pay-status{margin-top:18px;color:#f6cf72;font-weight:1000;display:flex;align-items:center;justify-content:center;gap:10px}
      .eterniza-spinner{width:20px;height:20px;border-radius:50%;border:3px solid rgba(246,207,114,.22);border-top-color:#f6cf72;display:inline-block;animation:eternizaSpin .85s linear infinite}
      .eterniza-loading-orb{width:74px;height:74px;border-radius:50%;margin:4px auto 18px;border:4px solid rgba(246,207,114,.18);border-top-color:#f6cf72;border-right-color:#f6cf72;animation:eternizaSpin 1s linear infinite;box-shadow:0 0 40px rgba(246,207,114,.18)}
      .eterniza-success-mark{width:82px;height:82px;border-radius:50%;margin:0 auto 16px;background:linear-gradient(135deg,#42d47d,#b9ffcf);color:#07120b;display:flex;align-items:center;justify-content:center;font-size:44px;font-weight:1000;box-shadow:0 0 42px rgba(66,212,125,.32);animation:eternizaPop .55s ease both}
      .eterniza-success-actions{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}
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
      @media(max-width:850px){.eterniza-plan-grid{grid-template-columns:1fr}.eterniza-pay-modal{padding:24px}.eterniza-pay-modal h2{font-size:34px}}
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

function openPublishCheckout(){
  const title = state.receiverName ? `Publicar a história de ${esc(state.receiverName)}` : 'Publicar sua história';
  showPublishCheckoutStep(`
    <h2>❤️ ${title}</h2>
    <p>Sua prévia está pronta. Escolha como deseja eternizar este momento.</p>
    <div class="eterniza-plan-grid">
      ${publishPaymentPlans.map(plan => `
        <article class="eterniza-plan-card ${plan.slug === 'premium' ? 'featured' : ''}">
          ${plan.slug === 'premium' ? '<span class="tag">Mais escolhido</span>' : ''}
          <h3>${esc(plan.name)}</h3>
          <strong>${esc(plan.price)}</strong>
          <p>${esc(plan.desc)}</p>
          <button class="eterniza-pay-btn" type="button" data-publish-plan="${esc(plan.slug)}">Quero este plano ❤️</button>
        </article>
      `).join('')}
    </div>
  `);

  document.querySelectorAll('[data-publish-plan]').forEach(btn => {
    btn.onclick = () => choosePaymentMethod(btn.dataset.publishPlan);
  });
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
  localStorage.setItem('giftBuilderState', JSON.stringify(state));
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

async function createPreviewPix(planSlug){
  try{
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
        plan: planSlug || 'premium'
      })
    });

    const data = await res.json();
    if(!res.ok || !data.ok){
      throw new Error(data.message || 'Erro ao gerar pagamento PIX.');
    }

    const payment = data.payment || {};
    showPublishCheckoutStep(`
      <div class="eterniza-pix-box">
        <h2>PIX gerado com sucesso</h2>
        <p>Pague com o QR Code abaixo. Após a aprovação, sua história será publicada automaticamente.</p>
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

    startPublishStatusPolling(tribute.id, tribute.slug || state.slug);
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
  }
}

function startPublishStatusPolling(tributeId, fallbackSlug){
  if(publishPollTimer) clearInterval(publishPollTimer);
  publishPollTimer = setInterval(async()=>{
    try{
      const res = await fetch('/api/tributes/list');
      const data = await res.json();
      if(!data.ok || !Array.isArray(data.tributes)) return;
      const tribute = data.tributes.find(t => t.id === tributeId);
      if(!tribute) return;
      if(String(tribute.status).toUpperCase() === 'PUBLISHED'){
        clearInterval(publishPollTimer);
        publishPollTimer = null;
        const url = tribute.public_url || tribute.publicUrl || (tribute.slug ? `/presente/${tribute.slug}` : (fallbackSlug ? `/presente/${fallbackSlug}` : '/dashboard'));
        showPublishCheckoutStep(`
          <div class="eterniza-pix-box">
            <div class="eterniza-success-mark">✓</div>
            <h2>Pagamento aprovado!</h2>
            <p>Sua história agora vive para sempre.</p>
            <div class="eterniza-success-actions">
              <button class="eterniza-pay-btn" type="button" id="openPublishedStory">Abrir minha história</button>
              <button class="eterniza-pay-secondary" type="button" id="copyPublishedStory">Copiar link</button>
            </div>
          </div>
        `);
        const open = document.getElementById('openPublishedStory');
        if(open) open.onclick = () => navigateTop(url, false);
        const copy = document.getElementById('copyPublishedStory');
        if(copy) copy.onclick = () => {
          const fullUrl = url.startsWith('http') ? url : (location.origin + url);
          navigator.clipboard?.writeText(fullUrl);
          copy.textContent = 'Link copiado!';
          setTimeout(()=>copy.textContent='Copiar link',1800);
        };
      }
    }catch(e){}
  }, 5000);
}
/* ===== Fim Checkout PIX direto na prévia ===== */


['landingCreateBtn','landingCreateTopBtn'].forEach(id=>{const el=$(id); if(el){el.setAttribute('href','/cadastro'); el.setAttribute('target','_top'); el.addEventListener('click', goLoginCreate);}});
['landingLoginBtn','landingLoginTopBtn'].forEach(id=>{const el=$(id); if(el){el.setAttribute('href','/login'); el.setAttribute('target','_top'); el.addEventListener('click', goLoginEnter);}});
if($('demoOpenBtn')) { $('demoOpenBtn').setAttribute('href','/presente/demo-maria-e-jose'); $('demoOpenBtn').setAttribute('target','_top'); $('demoOpenBtn').addEventListener('click', (e)=>{e.preventDefault(); ensureDemoOrder(); navigateTop('/presente/demo-maria-e-jose'); return false;}); }
$('showLoginBtn').onclick=()=>setAuthMode('login');
$('showCreateBtn').onclick=()=>setAuthMode('create');
$('loginBtn').onclick=()=>navigateTop('/login',true);
$('createAccountBtn').onclick=()=>navigateTop('/cadastro',true);if($('logoutBtn')) $('logoutBtn').onclick=adminLogout;$('previewBtn').onclick=()=>{document.body.dataset.publicGift='false';buildPreview();};$('editBtn').onclick=()=>go('detailsScreen');$('publishBtn').textContent='❤️ Publicar minha história';$('publishBtn').onclick=openPublishCheckout;if($('newGiftBtn')) $('newGiftBtn').onclick=()=>go('recipientScreen'); if($('dashboardNewGiftBtn')) $('dashboardNewGiftBtn').onclick=()=>go('recipientScreen');$('backDetailsBtn').onclick=()=>go('recipientScreen');$('aiTextBtn').onclick=aiSuggestion;$('musicMode').onchange=()=>{state.musicMode=$('musicMode').value;state.selectedTrack=currentTrack();saveState();toggleYoutubeField();};document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>{activeFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.remove('active-filter'));b.classList.add('active-filter');renderOrders()});
setupAuthAndYoutubeHelpers();renderRecipients();renderPlans();if(state.userEmail)$('email').value=state.userEmail;window.addEventListener('hashchange',openRoute);if(!openRoute())go('landingScreen');
