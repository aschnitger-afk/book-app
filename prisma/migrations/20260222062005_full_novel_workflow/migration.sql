-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN "aiAnalysis" TEXT;
ALTER TABLE "Chapter" ADD COLUMN "plotPointId" TEXT;
ALTER TABLE "Chapter" ADD COLUMN "povCharacter" TEXT;
ALTER TABLE "Chapter" ADD COLUMN "setting" TEXT;
ALTER TABLE "Chapter" ADD COLUMN "suggestions" TEXT;
ALTER TABLE "Chapter" ADD COLUMN "timeline" TEXT;

-- AlterTable
ALTER TABLE "Character" ADD COLUMN "age" TEXT;
ALTER TABLE "Character" ADD COLUMN "appearance" TEXT;
ALTER TABLE "Character" ADD COLUMN "arc" TEXT;
ALTER TABLE "Character" ADD COLUMN "flaws" TEXT;
ALTER TABLE "Character" ADD COLUMN "motivations" TEXT;
ALTER TABLE "Character" ADD COLUMN "occupation" TEXT;
ALTER TABLE "Character" ADD COLUMN "personality" TEXT;
ALTER TABLE "Character" ADD COLUMN "portraitUrl" TEXT;
ALTER TABLE "Character" ADD COLUMN "relationships" TEXT;
ALTER TABLE "Character" ADD COLUMN "roadBack" TEXT;
ALTER TABLE "Character" ADD COLUMN "strengths" TEXT;
ALTER TABLE "Character" ADD COLUMN "wish" TEXT;

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN "persona" TEXT;

-- AlterTable
ALTER TABLE "StyleProfile" ADD COLUMN "pov" TEXT;
ALTER TABLE "StyleProfile" ADD COLUMN "tense" TEXT;
ALTER TABLE "StyleProfile" ADD COLUMN "voice" TEXT;

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "premise" TEXT,
    "elevatorPitch" TEXT,
    "themes" TEXT,
    "tone" TEXT,
    "targetAudience" TEXT,
    "logline" TEXT,
    "centralConflict" TEXT,
    "uniqueHook" TEXT,
    "aiFeedback" TEXT,
    "suggestions" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Concept_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorldSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookId" TEXT NOT NULL,
    "timePeriod" TEXT,
    "location" TEXT,
    "worldType" TEXT,
    "geography" TEXT,
    "culture" TEXT,
    "politics" TEXT,
    "technology" TEXT,
    "history" TEXT,
    "rules" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorldSettings_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "worldSettingsId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "significance" TEXT,
    "atmosphere" TEXT,
    "imageUrl" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Location_worldSettingsId_fkey" FOREIGN KEY ("worldSettingsId") REFERENCES "WorldSettings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ResearchNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "fileName" TEXT,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResearchNote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeneratedImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "prompt" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageType" TEXT NOT NULL,
    "characterId" TEXT,
    "locationId" TEXT,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GeneratedImage_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AIPersona" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "genre" TEXT,
    "status" TEXT NOT NULL DEFAULT 'concept',
    "currentPhase" TEXT NOT NULL DEFAULT 'concept',
    "coverImage" TEXT,
    "conceptCompleted" BOOLEAN NOT NULL DEFAULT false,
    "worldbuildingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "plottingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "draftingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "editingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "aiPersona" TEXT DEFAULT 'creative_muse'
);
INSERT INTO "new_Book" ("createdAt", "description", "genre", "id", "status", "title", "updatedAt") SELECT "createdAt", "description", "genre", "id", "status", "title", "updatedAt" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE TABLE "new_PlotPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "act" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "description" TEXT,
    "plotPointType" TEXT,
    "emotionalBeat" TEXT,
    "charactersInvolved" TEXT,
    "locationId" TEXT,
    "notes" TEXT,
    "bookId" TEXT NOT NULL,
    "isComplete" BOOLEAN NOT NULL DEFAULT false,
    "wordCountTarget" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PlotPoint_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PlotPoint" ("act", "bookId", "createdAt", "description", "id", "notes", "order", "title", "updatedAt") SELECT "act", "bookId", "createdAt", "description", "id", "notes", "order", "title", "updatedAt" FROM "PlotPoint";
DROP TABLE "PlotPoint";
ALTER TABLE "new_PlotPoint" RENAME TO "PlotPoint";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Concept_bookId_key" ON "Concept"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "WorldSettings_bookId_key" ON "WorldSettings"("bookId");

-- CreateIndex
CREATE UNIQUE INDEX "AIPersona_key_key" ON "AIPersona"("key");
