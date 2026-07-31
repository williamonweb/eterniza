CREATE TABLE "Campaign" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'CUSTOM',
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "priority" INTEGER NOT NULL DEFAULT 0,
  "badge" TEXT,
  "titleBefore" TEXT NOT NULL,
  "titleHighlight" TEXT,
  "subtitle" TEXT,
  "buttonText" TEXT NOT NULL DEFAULT 'Criar minha homenagem',
  "buttonLink" TEXT NOT NULL DEFAULT '/cadastro',
  "heroImageUrl" TEXT,
  "showTopBanner" BOOLEAN NOT NULL DEFAULT false,
  "bannerText" TEXT,
  "bannerButtonText" TEXT,
  "bannerButtonLink" TEXT,
  "primaryColor" TEXT NOT NULL DEFAULT '#efbd52',
  "backgroundColor" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Campaign_slug_key" ON "Campaign"("slug");
CREATE INDEX "Campaign_isActive_startDate_endDate_priority_idx" ON "Campaign"("isActive", "startDate", "endDate", "priority");
