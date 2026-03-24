-- CreateTable
CREATE TABLE "StoryAnalyticsEvent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "storyId" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "value" INTEGER,
    "sessionKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StoryAnalyticsEvent_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Story" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "coverImage" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "sponsorLabel" TEXT,
    "sponsorUrl" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Story" ("content", "coverImage", "createdAt", "excerpt", "featured", "id", "published", "slug", "sortOrder", "title", "updatedAt", "viewCount") SELECT "content", "coverImage", "createdAt", "excerpt", "featured", "id", "published", "slug", "sortOrder", "title", "updatedAt", "viewCount" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
CREATE UNIQUE INDEX "Story_slug_key" ON "Story"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "StoryAnalyticsEvent_storyId_eventType_createdAt_idx" ON "StoryAnalyticsEvent"("storyId", "eventType", "createdAt");
