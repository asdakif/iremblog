-- CreateTable
CREATE TABLE "ReaderUser" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SavedStory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "storyId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedStory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ReaderUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedStory_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ReaderUser_email_key" ON "ReaderUser"("email");

-- CreateIndex
CREATE INDEX "SavedStory_userId_kind_idx" ON "SavedStory"("userId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "SavedStory_userId_storyId_kind_key" ON "SavedStory"("userId", "storyId", "kind");
