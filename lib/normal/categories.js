export const categories = [
  { id: 'namoro', label: 'Namoro / casal', icon: '♥', subtitle: 'O começo e todos os dias juntos', image: '/normal/cards/namoro.webp', accent: '#a45d55' },
  { id: 'casamento', label: 'Casamento', icon: '♡', subtitle: 'Uma história para celebrar a dois', image: '/normal/cards/casamento.webp', accent: '#ae8957' },
  { id: 'aniversario', label: 'Aniversário', icon: '🎂', subtitle: 'Mais um ano de vida e memórias', image: '/normal/cards/aniversario.webp', accent: '#bd8051' },
  { id: 'bebe', label: 'Bebê', icon: '☀', subtitle: 'Pequenos começos, grande amor', image: '/normal/cards/bebe.webp', accent: '#a77484' },
  { id: 'familia', label: 'Família', icon: '❀', subtitle: 'Tudo o que vivemos juntos', image: '/normal/cards/familia.webp', accent: '#758b62' },
  { id: 'pet', label: 'Meu pet', icon: '✿', subtitle: 'Para o companheiro de todas as horas', image: '/normal/cards/pet.webp', accent: '#8a7955' },
  { id: 'datas', label: 'Datas especiais', icon: '★', subtitle: 'Conquistas e dias inesquecíveis', image: '/normal/cards/datas.webp', accent: '#9676a5' },
  { id: 'homenagem', label: 'Homenagem / memorial', icon: '❧', subtitle: 'Um amor que permanece', image: '/normal/cards/homenagem.webp', accent: '#8c8067' },
];
export const categoryFor = id => categories.find(c => c.id === id) || categories[0];
export const steps = ['tipo', 'historia', 'datas', 'fotos', 'musica', 'preview'];
export const stepNames = ['Tipo', 'História', 'Datas', 'Fotos', 'Música', 'Prévia'];
