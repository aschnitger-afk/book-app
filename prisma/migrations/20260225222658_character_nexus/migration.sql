-- AlterTable
ALTER TABLE "Character" ADD COLUMN "arcTimeline" TEXT;
ALTER TABLE "Character" ADD COLUMN "emotionPortraits" TEXT;
ALTER TABLE "Character" ADD COLUMN "heroJourneyStep" TEXT;
ALTER TABLE "Character" ADD COLUMN "soulprint" TEXT;
ALTER TABLE "Character" ADD COLUMN "voiceProfile" TEXT;

-- CreateTable
CREATE TABLE "RelationshipConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "strength" INTEGER NOT NULL DEFAULT 50,
    "description" TEXT,
    "isConflict" BOOLEAN NOT NULL DEFAULT false,
    "bookId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RelationshipConnection_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RelationshipConnection_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "RelationshipConnection_sourceId_targetId_key" ON "RelationshipConnection"("sourceId", "targetId");
