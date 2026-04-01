-- CreateTable
CREATE TABLE "CmsTheme" (
    "id" TEXT NOT NULL,
    "primary" TEXT NOT NULL DEFAULT '#2563EB',
    "primaryHover" TEXT NOT NULL DEFAULT '#1D4ED8',
    "accent" TEXT NOT NULL DEFAULT '#06B6D4',
    "success" TEXT NOT NULL DEFAULT '#16A34A',
    "warning" TEXT NOT NULL DEFAULT '#D97706',
    "danger" TEXT NOT NULL DEFAULT '#DC2626',
    "navy" TEXT NOT NULL DEFAULT '#0B1929',
    "navyMid" TEXT NOT NULL DEFAULT '#132F4C',
    "fontSans" TEXT NOT NULL DEFAULT '''DM Sans'', ''Sarabun'', system-ui, sans-serif',
    "fontMono" TEXT NOT NULL DEFAULT '''JetBrains Mono'', ''Fira Code'', monospace',
    "logoText" TEXT NOT NULL DEFAULT 'CUSTOMS-EDOC',
    "logoIcon" TEXT NOT NULL DEFAULT '⚓',
    "companyName" TEXT NOT NULL DEFAULT 'NEXRA TECHNOLOGY CO., LTD.',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsTheme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsSection" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "tagText" TEXT,
    "tagColor" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsSectionCard" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "icon" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "color" TEXT,
    "metadata" JSONB,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsSectionCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CmsSection_slug_key" ON "CmsSection"("slug");

-- CreateIndex
CREATE INDEX "CmsSectionCard_sectionId_sortOrder_idx" ON "CmsSectionCard"("sectionId", "sortOrder");

-- AddForeignKey
ALTER TABLE "CmsSectionCard" ADD CONSTRAINT "CmsSectionCard_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CmsSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
