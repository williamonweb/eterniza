
export const DEFAULT_SYSTEM_SETTINGS = {
  companyName: "Eterniza",
  slogan: "Onde Cada História Vive Para Sempre.",
  supportEmail: "",
  supportWhatsapp: "",
  instagramUrl: "",
  facebookUrl: "",
  websiteUrl: "https://eternizas.com.br",
  logoUrl: "/eterniza/assets/brand/logo-eterniza.png",
  faviconUrl: "/favicon.ico",

  landingBadge: "⭐ Experiência cinematográfica",
  landingTitleBefore: "Transforme fotos, música e palavras em uma",
  landingTitleHighlight: "homenagem inesquecível.",
  landingSubtitle:
    "A pessoa recebe um link, clica em abrir surpresa e vive uma experiência emocionante, com fotos, música, carta, bodas, momentos especiais e QR Code.",
  landingShowExamples: true,
  landingShowPlans: true,
  landingShowProof: true,
  promoBannerEnabled: false,
  promoBannerText: "🔥 Promoção especial por tempo limitado!",

  monthlyRevenueGoal: 3000,
  annualRevenueGoal: 36000,
  monthlySalesGoal: 100,

  pixEnabled: true,
  pixExpirationMinutes: 60,
  checkoutMessage: "Finalize o pagamento para publicar sua homenagem.",
  paymentApprovedMessage: "Pagamento confirmado! Sua homenagem já está disponível.",
  afterPaymentDestination: "dashboard",

  musicEnabled: true,
  musicAutoplay: false,
  musicShowPlayer: true,
  musicDefaultVolume: 68,
  youtubeSearchEnabled: true,

  uploadEnabled: true,
  uploadMaxSizeMb: 8,
  uploadMaxDimension: 1600,
  uploadQualityPercent: 82,
  uploadAcceptedFormats: "image/jpeg,image/png,image/webp",

  aiEnabled: true,
  aiDefaultStyle: "emocionante",
  aiMaxCharacters: 3000,
  aiPromptBase: "Escreva uma homenagem emocionante, humana e personalizada.",

  whatsappEnabled: true,
  whatsappTemplate: "Olá, {NOME}! Sua homenagem está pronta: {LINK}\nPlano: {PLANO}",

  emailRegistrationSubject: "Bem-vindo ao Eterniza",
  emailRegistrationBody: "Seu cadastro foi realizado com sucesso.",
  emailPixSubject: "Seu PIX foi gerado",
  emailPixBody: "Finalize o pagamento para publicar sua homenagem: {LINK}",
  emailApprovedSubject: "Sua homenagem está no ar",
  emailApprovedBody: "Pagamento confirmado! Acesse sua homenagem: {LINK}",
};

export const SETTINGS_GROUPS = {
  companyName: "general",
  slogan: "general",
  supportEmail: "general",
  supportWhatsapp: "general",
  instagramUrl: "general",
  facebookUrl: "general",
  websiteUrl: "general",
  logoUrl: "general",
  faviconUrl: "general",

  landingBadge: "landing",
  landingTitleBefore: "landing",
  landingTitleHighlight: "landing",
  landingSubtitle: "landing",
  landingShowExamples: "landing",
  landingShowPlans: "landing",
  landingShowProof: "landing",
  promoBannerEnabled: "landing",
  promoBannerText: "landing",

  monthlyRevenueGoal: "commercial",
  annualRevenueGoal: "commercial",
  monthlySalesGoal: "commercial",

  pixEnabled: "payments",
  pixExpirationMinutes: "payments",
  checkoutMessage: "payments",
  paymentApprovedMessage: "payments",
  afterPaymentDestination: "payments",

  musicEnabled: "music",
  musicAutoplay: "music",
  musicShowPlayer: "music",
  musicDefaultVolume: "music",
  youtubeSearchEnabled: "music",

  uploadEnabled: "upload",
  uploadMaxSizeMb: "upload",
  uploadMaxDimension: "upload",
  uploadQualityPercent: "upload",
  uploadAcceptedFormats: "upload",

  aiEnabled: "ai",
  aiDefaultStyle: "ai",
  aiMaxCharacters: "ai",
  aiPromptBase: "ai",

  whatsappEnabled: "whatsapp",
  whatsappTemplate: "whatsapp",

  emailRegistrationSubject: "emails",
  emailRegistrationBody: "emails",
  emailPixSubject: "emails",
  emailPixBody: "emails",
  emailApprovedSubject: "emails",
  emailApprovedBody: "emails",
};
