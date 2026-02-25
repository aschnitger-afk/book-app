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
    "styleanalysisCompleted" BOOLEAN NOT NULL DEFAULT false,
    "conceptCompleted" BOOLEAN NOT NULL DEFAULT false,
    "worldbuildingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "plottingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "plotStructure" TEXT,
    "draftingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "editingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "aiPersona" TEXT DEFAULT 'creative_muse'
);
INSERT INTO "new_Book" ("aiPersona", "conceptCompleted", "coverImage", "createdAt", "currentPhase", "description", "draftingCompleted", "editingCompleted", "genre", "id", "plotStructure", "plottingCompleted", "status", "title", "updatedAt", "worldbuildingCompleted") SELECT "aiPersona", "conceptCompleted", "coverImage", "createdAt", "currentPhase", "description", "draftingCompleted", "editingCompleted", "genre", "id", "plotStructure", "plottingCompleted", "status", "title", "updatedAt", "worldbuildingCompleted" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
