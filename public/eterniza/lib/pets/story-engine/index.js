const STORY_TYPES = {
  FAREWELL: {
    id: "FAREWELL",
    icon: "🌈",
    title: "Despedida",
    cardText: "Uma despedida delicada, feita para acolher e preservar memórias.",
    eyebrow: "Uma homenagem de amor",
    palette: "#315b84",
    musicQuery: "piano instrumental emocionante despedida pet",
    questions: [
      {
        id: "yearsTogether",
        label: "Quanto tempo viveram juntos?",
        type: "choice",
        options: [
          ["LESS_ONE", "Menos de 1 ano"],
          ["ONE_FIVE", "De 1 a 5 anos"],
          ["MORE_FIVE", "Mais de 5 anos"],
        ],
      },
      {
        id: "personality",
        label: "Como era o jeitinho dele?",
        type: "choice",
        options: [
          ["PLAYFUL", "Brincalhão"],
          ["CALM", "Calmo e companheiro"],
          ["PROTECTIVE", "Protetor"],
          ["UNIQUE", "Único de um jeito especial"],
        ],
      },
    ],
  },
  SURGERY: {
    id: "SURGERY",
    icon: "🩺",
    title: "Cirurgia",
    cardText: "Uma mensagem de coragem, cuidado e esperança depois do procedimento.",
    eyebrow: "Um dia de coragem",
    palette: "#2979a8",
    musicQuery: "piano esperança superação instrumental",
    questions: [
      {
        id: "procedure",
        label: "Qual foi o procedimento?",
        type: "choice",
        options: [
          ["CASTRATION", "Castração"],
          ["ORTHOPEDIC", "Cirurgia ortopédica"],
          ["DENTAL", "Procedimento odontológico"],
          ["OTHER", "Outro procedimento"],
        ],
      },
      {
        id: "outcome",
        label: "Como está o pet agora?",
        type: "choice",
        options: [
          ["DISCHARGED", "Recebeu alta"],
          ["RECOVERING", "Está se recuperando"],
          ["HOSPITALIZED", "Segue internado e acompanhado"],
        ],
      },
    ],
  },
  RECOVERY: {
    id: "RECOVERY",
    icon: "❤️",
    title: "Recuperação",
    cardText: "Celebre a evolução e cada pequena vitória do tratamento.",
    eyebrow: "Cada passo é uma vitória",
    palette: "#3d9b83",
    musicQuery: "instrumental leve esperança recuperação",
    questions: [
      {
        id: "recoveryStatus",
        label: "Como está a recuperação?",
        type: "choice",
        options: [
          ["COMPLETE", "Recuperação completa"],
          ["EVOLVING", "Evoluindo bem"],
          ["FOLLOW_UP", "Ainda em acompanhamento"],
        ],
      },
      {
        id: "biggestVictory",
        label: "Qual foi a maior vitória?",
        type: "choice",
        options: [
          ["EATING", "Voltou a comer bem"],
          ["WALKING", "Voltou a caminhar ou brincar"],
          ["HOME", "Pôde voltar para casa"],
          ["OTHER", "Cada dia está sendo uma vitória"],
        ],
      },
    ],
  },
  DISCHARGE: {
    id: "DISCHARGE",
    icon: "🏥",
    title: "Alta hospitalar",
    cardText: "Uma experiência alegre para celebrar a volta para casa.",
    eyebrow: "Hora de voltar para casa",
    palette: "#4b9c78",
    musicQuery: "música alegre suave volta para casa instrumental",
    questions: [
      {
        id: "afterDischarge",
        label: "Como será a próxima etapa?",
        type: "choice",
        options: [
          ["HOME", "Descanso e carinho em casa"],
          ["TREATMENT", "Continuará o tratamento em casa"],
          ["RETURN", "Terá retorno para acompanhamento"],
        ],
      },
    ],
  },
  BIRTHDAY: {
    id: "BIRTHDAY",
    icon: "🎂",
    title: "Aniversário",
    cardText: "Uma celebração alegre por mais um ano de amor e aventuras.",
    eyebrow: "Hoje é dia de celebrar",
    palette: "#c6923e",
    musicQuery: "música feliz aniversário pet instrumental alegre",
    questions: [
      {
        id: "age",
        label: "Quantos anos está completando?",
        type: "text",
        placeholder: "Ex.: 7 anos",
      },
      {
        id: "favoriteThing",
        label: "O que ele mais ama fazer?",
        type: "choice",
        options: [
          ["PLAY", "Brincar"],
          ["WALK", "Passear"],
          ["SLEEP", "Dormir pertinho da família"],
          ["EAT", "Ganhar petiscos"],
        ],
      },
    ],
  },
  ADOPTION: {
    id: "ADOPTION",
    icon: "🏠",
    title: "Adoção",
    cardText: "O começo — ou a celebração — de uma família que se encontrou.",
    eyebrow: "Uma família acaba de nascer",
    palette: "#b46f55",
    musicQuery: "música emocionante adoção família instrumental",
    questions: [
      {
        id: "adoptionMoment",
        label: "Qual momento está sendo celebrado?",
        type: "choice",
        options: [
          ["FIRST_DAY", "Primeiro dia na nova família"],
          ["ANNIVERSARY", "Aniversário de adoção"],
          ["NEW_HOME", "Chegada ao novo lar"],
        ],
      },
    ],
  },
  VACCINATION: {
    id: "VACCINATION",
    icon: "💉",
    title: "Vacinação",
    cardText: "Uma mensagem curta e positiva sobre cuidado e prevenção.",
    eyebrow: "Cuidar também é amar",
    palette: "#438fc1",
    musicQuery: "música leve feliz pet instrumental",
    questions: [
      {
        id: "vaccineMoment",
        label: "Qual etapa da vacinação?",
        type: "choice",
        options: [
          ["FIRST", "Primeira vacina"],
          ["BOOSTER", "Dose de reforço"],
          ["ANNUAL", "Vacinação anual"],
        ],
      },
    ],
  },
  CUSTOM: {
    id: "CUSTOM",
    icon: "✨",
    title: "Personalizada",
    cardText: "Crie uma experiência para qualquer outro momento especial.",
    eyebrow: "Um momento para sempre",
    palette: "#6a72bd",
    musicQuery: "piano instrumental emocionante suave",
    questions: [
      {
        id: "mood",
        label: "Qual deve ser o clima da experiência?",
        type: "choice",
        options: [
          ["JOY", "Alegre"],
          ["GRATITUDE", "Gratidão"],
          ["HOPE", "Esperança"],
          ["EMOTIONAL", "Emocionante"],
        ],
      },
    ],
  },
};

export const EXPERIENCE_TYPES = Object.values(STORY_TYPES).map((item) => ({
  id: item.id,
  icon: item.icon,
  title: item.title,
  text: item.cardText,
}));

export function getStoryQuestions(type) {
  return STORY_TYPES[type]?.questions || [];
}

function answer(answers, key, fallback = "") {
  return String(answers?.[key] || fallback);
}

function nameOf(data) {
  return String(data?.petName || "este pet").trim() || "este pet";
}

export function buildPetStory(data = {}) {
  const type = STORY_TYPES[data.type] || STORY_TYPES.CUSTOM;
  const petName = nameOf(data);
  const answers = data.storyAnswers || {};
  const customMessage = String(data.message || "").trim();

  const base = {
    type: type.id,
    icon: type.icon,
    eyebrow: type.eyebrow,
    palette: data.themeColor || type.palette,
    suggestedMusicQuery: type.musicQuery,
    timings: {
      first: 900,
      second: 5000,
      third: 9100,
      reveal: 12900,
    },
    intro: [],
    emotionTitle: "",
    chapters: [],
    finalTitle: "",
    finalText: "",
    defaultTitle: type.title,
    defaultMessage: "",
  };

  if (type.id === "FAREWELL") {
    const personality = {
      PLAYFUL: "brincadeiras que enchiam a casa de alegria",
      CALM: "uma presença calma que sempre trazia paz",
      PROTECTIVE: "um amor protetor que cuidava de todos",
      UNIQUE: "um jeitinho único que ninguém poderá esquecer",
    }[answer(answers, "personality")] || "um jeitinho impossível de esquecer";

    base.intro = [
      "Alguns encontros mudam a nossa vida.",
      "O amor não termina quando chega a despedida.",
      `Esta história é sobre ${petName}.`,
    ];
    base.emotionTitle = "A saudade é o amor encontrando uma nova forma de permanecer.";
    base.chapters = [
      ["Um amor que permanece", `${petName} deixou memórias que o tempo jamais poderá apagar.`],
      ["Um jeitinho inesquecível", `Ficam ${personality}, os olhares e cada pequeno gesto de carinho.`],
      ["Para sempre perto", "Porque quem foi amado de verdade continua vivendo dentro de cada lembrança."],
    ];
    base.finalTitle = "Algumas histórias não acabam. Elas passam a morar no coração.";
    base.finalText = "Volte sempre que quiser sentir esse amor novamente.";
    base.defaultTitle = `Para sempre, ${petName}`;
    base.defaultMessage = `Alguns companheiros chegam de mansinho e transformam para sempre a vida de uma família.\n\n${petName} deixou amor, aprendizados e lembranças que nenhum tempo será capaz de apagar.\n\nQue a saudade encontre conforto em tudo o que foi vivido e que cada memória mantenha esse vínculo sempre perto.`;
  }

  if (type.id === "SURGERY") {
    const procedure = {
      CASTRATION: "um procedimento importante para sua saúde e bem-estar",
      ORTHOPEDIC: "um procedimento que exigiu força e muitos cuidados",
      DENTAL: "um cuidado importante para voltar a sorrir e viver bem",
      OTHER: "um procedimento importante para sua saúde",
    }[answer(answers, "procedure")] || "um procedimento importante";

    const outcome = answer(answers, "outcome");
    const outcomeText = {
      DISCHARGED: "Agora chegou a melhor parte: descansar perto de quem ama.",
      RECOVERING: "A recuperação continua, um dia de cada vez, cercada de carinho.",
      HOSPITALIZED: "A equipe continua por perto, acompanhando cada detalhe da recuperação.",
    }[outcome] || "Agora começa uma nova etapa de cuidado e recuperação.";

    base.intro = [
      "Hoje foi um dia de coragem.",
      "Enquanto sua família aguardava, muitas mãos cuidavam com atenção.",
      `${petName} mostrou uma força incrível.`,
    ];
    base.emotionTitle = "Os grandes recomeços começam com cuidado, confiança e coragem.";
    base.chapters = [
      ["Um dia importante", `${petName} passou por ${procedure}.`],
      ["Cuidado em cada detalhe", "Conhecimento, carinho e atenção estiveram presentes em cada momento."],
      ["Uma nova etapa", outcomeText],
    ];
    base.finalTitle = "Hoje essa história ganhou um capítulo de força e esperança.";
    base.finalText = outcomeText;
    base.defaultTitle = `Um dia de coragem para ${petName}`;
    base.defaultMessage = `Hoje ${petName} viveu um momento importante e mostrou uma coragem enorme.\n\nDurante todo o procedimento, cada detalhe foi acompanhado com atenção, responsabilidade e carinho.\n\n${outcomeText}\n\nToda a equipe deseja uma recuperação tranquila, confortável e cheia de boas notícias.`;
  }

  if (type.id === "RECOVERY") {
    const status = answer(answers, "recoveryStatus");
    const victory = {
      EATING: "voltar a comer bem",
      WALKING: "voltar a caminhar, brincar e demonstrar alegria",
      HOME: "poder voltar para casa",
      OTHER: "seguir avançando a cada novo dia",
    }[answer(answers, "biggestVictory")] || "cada pequeno avanço";

    const statusText = {
      COMPLETE: "O caminho foi vencido e hoje é dia de comemorar.",
      EVOLVING: "A evolução continua e cada novo dia traz mais esperança.",
      FOLLOW_UP: "O acompanhamento continua, com cuidado e confiança em cada etapa.",
    }[status] || "Cada novo dia traz mais esperança.";

    base.intro = [
      "Nem toda vitória chega fazendo barulho.",
      "Às vezes ela aparece em um passo, uma refeição ou um rabinho abanando.",
      `${petName} está escrevendo uma história de superação.`,
    ];
    base.emotionTitle = "Pequenos avanços podem representar conquistas gigantes.";
    base.chapters = [
      ["Cada passo importa", `Uma das grandes vitórias foi ${victory}.`],
      ["Força todos os dias", "A recuperação foi construída com paciência, cuidado e muito amor."],
      ["Um grande recomeço", statusText],
    ];
    base.finalTitle = "Hoje celebramos tudo o que já foi conquistado.";
    base.finalText = statusText;
    base.defaultTitle = `As vitórias de ${petName}`;
    base.defaultMessage = `A recuperação de ${petName} é feita de pequenas e importantes vitórias.\n\nCada avanço trouxe alívio, esperança e a certeza de que todo cuidado vale a pena.\n\nHoje celebramos ${victory} e tudo o que ainda está por vir.\n\n${statusText}`;
  }

  if (type.id === "DISCHARGE") {
    const after = {
      HOME: "Agora é hora de descansar no seu cantinho, cercado de carinho.",
      TREATMENT: "O tratamento continua em casa, com a presença de quem mais ama.",
      RETURN: "Em breve haverá um reencontro para acompanhar toda essa evolução.",
    }[answer(answers, "afterDischarge")] || "Agora é hora de descansar no seu cantinho.";

    base.intro = [
      "Hoje é dia de voltar para casa.",
      "Depois de tantos cuidados, chegou o momento mais esperado.",
      `O cantinho de ${petName} está esperando.`,
    ];
    base.emotionTitle = "Nenhum lugar acolhe melhor do que o colo e o carinho da família.";
    base.chapters = [
      ["O caminho de volta", "A internação termina e uma nova etapa começa."],
      ["Carinho em casa", after],
      ["Um reencontro feliz", "Que os próximos dias sejam tranquilos, confortáveis e cheios de amor."],
    ];
    base.finalTitle = "Bem-vindo de volta ao melhor lugar do mundo: a sua casa.";
    base.finalText = after;
    base.defaultTitle = `${petName} está voltando para casa`;
    base.defaultMessage = `Chegou o momento tão esperado: ${petName} recebeu alta!\n\nFoi uma alegria acompanhar essa etapa e oferecer todo o cuidado necessário.\n\n${after}\n\nDesejamos dias tranquilos, uma ótima recuperação e muitos momentos felizes em família.`;
  }

  if (type.id === "ADOPTION") {
    const moment = answer(answers, "adoptionMoment");
    const momentText = {
      FIRST_DAY: "Hoje começa o primeiro capítulo dessa nova vida em família.",
      ANNIVERSARY: "Hoje celebramos o dia em que essa família ficou completa.",
      NEW_HOME: "Hoje um novo lar ganhou mais amor, alegria e companhia.",
    }[moment] || "Hoje começa uma história para a vida inteira.";

    base.intro = [
      "Às vezes, duas vidas estavam procurando exatamente uma pela outra.",
      "Bastou um encontro, um olhar e um pouco de coragem.",
      `E uma família encontrou ${petName}.`,
    ];
    base.emotionTitle = "Adoção não muda apenas uma vida. Ela cria uma nova história para todos.";
    base.chapters = [
      ["O encontro", "Entre tantos caminhos, vocês finalmente se encontraram."],
      ["Uma família nasceu", momentText],
      ["Uma vida inteira pela frente", "Que nunca faltem segurança, brincadeiras e muito amor."],
    ];
    base.finalTitle = "Que esta seja a primeira de muitas lembranças felizes.";
    base.finalText = momentText;
    base.defaultTitle = `A nova história de ${petName}`;
    base.defaultMessage = `Algumas famílias não começam no nascimento. Elas começam em um encontro.\n\n${petName} encontrou um lar, e esse lar encontrou um amor que talvez nem soubesse que estava faltando.\n\n${momentText}\n\nQue essa nova jornada seja cheia de segurança, descobertas, carinho e muitos anos juntos.`;
  }

  if (type.id === "BIRTHDAY") {
    const age = answer(answers, "age", "mais um ano");
    const favorite = {
      PLAY: "brincadeiras",
      WALK: "passeios e novas aventuras",
      SLEEP: "sonecas pertinho de quem ama",
      EAT: "petiscos e momentos deliciosos",
    }[answer(answers, "favoriteThing")] || "momentos felizes";

    base.intro = [
      "Hoje o dia amanheceu mais alegre.",
      `É dia de celebrar ${age} de uma história muito especial.`,
      `Hoje a festa é de ${petName}!`,
    ];
    base.emotionTitle = "Mais um ano espalhando alegria, carinho e amor por onde passa.";
    base.chapters = [
      ["Um dia de festa", `Hoje celebramos ${age} de ${petName}.`],
      ["Tudo o que faz feliz", `Que nunca faltem ${favorite}.`],
      ["Muitos capítulos pela frente", "Que o próximo ano seja ainda mais bonito, saudável e divertido."],
    ];
    base.finalTitle = `Feliz aniversário, ${petName}!`;
    base.finalText = "Que venham muitos anos de saúde, amor e aventuras.";
    base.defaultTitle = `Feliz aniversário, ${petName}!`;
    base.defaultMessage = `Hoje celebramos ${age} de uma vida que torna todos os dias mais felizes.\n\n${petName} é motivo de sorrisos, carinho e muitas histórias inesquecíveis.\n\nQue nunca faltem ${favorite}, saúde e amor.\n\nFeliz aniversário e muitos capítulos lindos pela frente!`;
  }

  if (type.id === "VACCINATION") {
    const moment = {
      FIRST: "Hoje foi dado o primeiro passo para uma vida protegida.",
      BOOSTER: "Hoje a proteção ficou ainda mais forte.",
      ANNUAL: "Mais um ano de cuidado e prevenção em dia.",
    }[answer(answers, "vaccineMoment")] || "Hoje foi dado mais um passo para uma vida protegida.";

    base.timings = { first: 700, second: 3500, third: 6500, reveal: 9300 };
    base.intro = [
      "Cuidar também é amar.",
      "Um gesto rápido hoje protege muitos momentos amanhã.",
      `${petName} está com o cuidado em dia.`,
    ];
    base.emotionTitle = "Prevenção é um dos maiores presentes que podemos oferecer.";
    base.chapters = [
      ["Proteção", moment],
      ["Responsabilidade e amor", "Cada dose ajuda a construir uma vida mais longa e saudável."],
      ["Muitos momentos pela frente", "Agora é seguir brincando, explorando e sendo muito amado."],
    ];
    base.finalTitle = "Cuidado em dia. Amor para a vida inteira.";
    base.finalText = moment;
    base.defaultTitle = `Cuidado e proteção para ${petName}`;
    base.defaultMessage = `${moment}\n\nCuidar da saúde também é uma forma de demonstrar amor.\n\nDesejamos que ${petName} tenha uma vida longa, saudável e cheia de momentos felizes ao lado da família.`;
  }

  if (type.id === "CUSTOM") {
    const mood = answer(answers, "mood");
    const moodText = {
      JOY: "Uma lembrança leve, alegre e cheia de bons sentimentos.",
      GRATITUDE: "Uma mensagem para agradecer por tudo o que foi vivido.",
      HOPE: "Uma experiência feita para renovar a esperança.",
      EMOTIONAL: "Um momento contado com sensibilidade e emoção.",
    }[mood] || "Um momento contado com carinho.";

    base.intro = [
      "Alguns momentos merecem uma pausa.",
      "Porque aquilo que toca o coração merece ser lembrado.",
      `Esta história é sobre ${petName}.`,
    ];
    base.emotionTitle = moodText;
    base.chapters = [
      ["Um momento especial", `${petName} faz parte de uma história única.`],
      ["Uma lembrança com significado", moodText],
      ["Para guardar", "Que esta experiência seja aberta sempre que o coração quiser recordar."],
    ];
    base.finalTitle = "Onde existe amor, existe uma história que merece permanecer.";
    base.finalText = moodText;
    base.defaultTitle = `Um momento especial de ${petName}`;
    base.defaultMessage = `Preparamos esta experiência para registrar um momento muito especial de ${petName}.\n\n${moodText}\n\nQue estas fotos, palavras e lembranças continuem trazendo bons sentimentos por muito tempo.`;
  }

  return {
    ...base,
    message: customMessage || base.defaultMessage,
    title: String(data.title || "").trim() || base.defaultTitle,
  };
}

export function getStoryDefaults(type, data = {}) {
  const story = buildPetStory({ ...data, type, message: "", title: "" });
  return {
    title: story.defaultTitle,
    message: story.defaultMessage,
    themeColor: story.palette,
    suggestedMusicQuery: story.suggestedMusicQuery,
  };
}
