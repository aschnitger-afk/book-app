-- CreateTable
CREATE TABLE "ScreenplayScene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sceneNumber" INTEGER NOT NULL,
    "heading" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT,
    "timeOfDay" TEXT,
    "interior" BOOLEAN NOT NULL DEFAULT true,
    "content" TEXT NOT NULL DEFAULT '',
    "estimatedDuration" REAL,
    "characters" TEXT,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScreenplayScene_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
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
    "projectType" TEXT NOT NULL DEFAULT 'FICTION',
    "projectCategory" TEXT NOT NULL DEFAULT 'NOVEL',
    "targetFormat" TEXT,
    "screenplayData" TEXT,
    "targetLength" INTEGER,
    "styleanalysisCompleted" BOOLEAN NOT NULL DEFAULT false,
    "conceptCompleted" BOOLEAN NOT NULL DEFAULT false,
    "worldbuildingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "plottingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "plotStructure" TEXT,
    "draftingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "editingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "screenplayAdaptationStarted" BOOLEAN NOT NULL DEFAULT false,
    "screenplayCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "aiPersona" TEXT DEFAULT 'creative_muse',
    "sourceBookId" TEXT,
    CONSTRAINT "Book_sourceBookId_fkey" FOREIGN KEY ("sourceBookId") REFERENCES "Book" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("aiPersona", "conceptCompleted", "coverImage", "createdAt", "currentPhase", "description", "draftingCompleted", "editingCompleted", "genre", "id", "plotStructure", "plottingCompleted", "status", "styleanalysisCompleted", "title", "updatedAt", "worldbuildingCompleted") SELECT "aiPersona", "conceptCompleted", "coverImage", "createdAt", "currentPhase", "description", "draftingCompleted", "editingCompleted", "genre", "id", "plotStructure", "plottingCompleted", "status", "styleanalysisCompleted", "title", "updatedAt", "worldbuildingCompleted" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE TABLE "new_Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "plotPointId" TEXT,
    "povCharacter" TEXT,
    "setting" TEXT,
    "timeline" TEXT,
    "aiAnalysis" TEXT,
    "suggestions" TEXT,
    "isScreenplayFormat" BOOLEAN NOT NULL DEFAULT false,
    "sceneHeading" TEXT,
    "sceneDescription" TEXT,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chapter_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Chapter" ("aiAnalysis", "bookId", "content", "createdAt", "id", "order", "plotPointId", "povCharacter", "setting", "status", "suggestions", "timeline", "title", "updatedAt", "wordCount") SELECT "aiAnalysis", "bookId", "content", "createdAt", "id", "order", "plotPointId", "povCharacter", "setting", "status", "suggestions", "timeline", "title", "updatedAt", "wordCount" FROM "Chapter";
DROP TABLE "Chapter";
ALTER TABLE "new_Chapter" RENAME TO "Chapter";
CREATE TABLE "new_ResearchNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "category" TEXT,
    "tags" TEXT,
    "fileUrl" TEXT,
    "fileType" TEXT,
    "fileName" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isGlobal" BOOLEAN NOT NULL DEFAULT false,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ResearchNote_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ResearchNote" ("bookId", "category", "content", "createdAt", "fileName", "fileType", "fileUrl", "id", "tags", "title", "updatedAt") SELECT "bookId", "category", "content", "createdAt", "fileName", "fileType", "fileUrl", "id", "tags", "title", "updatedAt" FROM "ResearchNote";
DROP TABLE "ResearchNote";
ALTER TABLE "new_ResearchNote" RENAME TO "ResearchNote";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
