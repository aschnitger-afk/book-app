-- CreateTable
CREATE TABLE "StoryIdea" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'idea',
    "positionX" REAL NOT NULL DEFAULT 0,
    "positionY" REAL NOT NULL DEFAULT 0,
    "color" TEXT,
    "tags" TEXT,
    "aiSummary" TEXT,
    "suggestedConnections" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "convertedToChapterId" TEXT,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoryIdea_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdeaConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'related',
    "label" TEXT,
    "strength" INTEGER NOT NULL DEFAULT 50,
    "isAiSuggested" BOOLEAN NOT NULL DEFAULT false,
    "aiReasoning" TEXT,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IdeaConnection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "StoryIdea" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdeaConnection_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "StoryIdea" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdeaConnection_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "IdeaConnection_sourceId_targetId_type_key" ON "IdeaConnection"("sourceId", "targetId", "type");
