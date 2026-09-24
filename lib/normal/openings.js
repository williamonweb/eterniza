// Shared defaults for the public experience and the CMS.
export const normalOpenings = [
  { id:'namoro', label:'Namoro / casal', lines:['Algumas histórias começam com um encontro.','E se tornam o nosso lugar favorito.'] },
  { id:'casamento', label:'Casamento', lines:['Duas vidas, uma escolha.','E um amor para celebrar todos os dias.'] },
  { id:'aniversario', label:'Aniversário', lines:['Hoje é dia de celebrar você.','E tudo de bonito que ainda virá.'] },
  { id:'bebe', label:'Bebê', lines:['Uma vida pequena.','Um amor maior do que o mundo.'] },
  { id:'familia', label:'Família', lines:['As melhores histórias nascem em casa.','E vivem em cada abraço.'] },
  { id:'pet', label:'Pet', lines:['Quatro patas, infinitas lembranças.','Um amor que faz parte da família.'] },
  { id:'datas', label:'Datas especiais', lines:['Há dias que merecem ficar para sempre.','Este é um deles.'] },
  { id:'homenagem', label:'Homenagem / memorial', lines:['Algumas presenças nunca nos deixam.','Elas vivem em nossas memórias.'] },
];
export const openingKey = (id, line) => `normalIntro_${id}_${line}`;
export const openingDefaults = Object.fromEntries(normalOpenings.flatMap(item => item.lines.map((line, index) => [openingKey(item.id, index + 1),line])));
