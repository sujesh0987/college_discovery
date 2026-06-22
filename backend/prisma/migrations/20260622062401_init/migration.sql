-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "examType" TEXT,
    "targetYear" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "College" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "bannerUrl" TEXT NOT NULL,
    "locationCity" TEXT NOT NULL,
    "locationState" TEXT NOT NULL,
    "feesMin" REAL NOT NULL,
    "feesMax" REAL NOT NULL,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "established" INTEGER NOT NULL,
    "naacGrade" TEXT,
    "nirfRank" INTEGER,
    "ownership" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "campusSize" REAL,
    "studentCount" INTEGER,
    "facultyCount" INTEGER,
    "affiliatedUniversity" TEXT,
    "regulatoryBody" TEXT,
    "mapEmbedUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collegeId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "seats" INTEGER NOT NULL,
    "fees" REAL NOT NULL,
    "eligibility" TEXT NOT NULL,
    "admissionMode" TEXT NOT NULL,
    CONSTRAINT "Course_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collegeId" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "avgPackage" REAL NOT NULL,
    "highestPackage" REAL NOT NULL,
    "medianPackage" REAL NOT NULL,
    "placementPercentage" REAL NOT NULL,
    "recruitersJson" TEXT NOT NULL,
    CONSTRAINT "Placement_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collegeId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "rating" REAL NOT NULL,
    "academicsRating" REAL NOT NULL,
    "facultyRating" REAL NOT NULL,
    "placementsRating" REAL NOT NULL,
    "infrastructureRating" REAL NOT NULL,
    "socialLifeRating" REAL NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Review_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedCollege" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "collegeId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedCollege_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SavedCollege_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SavedComparison" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "collegeIds" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedComparison_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Facility" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "collegeId" INTEGER NOT NULL,
    "library" BOOLEAN NOT NULL DEFAULT false,
    "hostel" BOOLEAN NOT NULL DEFAULT false,
    "sports" BOOLEAN NOT NULL DEFAULT false,
    "labs" BOOLEAN NOT NULL DEFAULT false,
    "wifi" BOOLEAN NOT NULL DEFAULT false,
    "cafeteria" BOOLEAN NOT NULL DEFAULT false,
    "gym" BOOLEAN NOT NULL DEFAULT false,
    "medical" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Facility_collegeId_fkey" FOREIGN KEY ("collegeId") REFERENCES "College" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SavedCollege_userId_collegeId_key" ON "SavedCollege"("userId", "collegeId");

-- CreateIndex
CREATE UNIQUE INDEX "Facility_collegeId_key" ON "Facility"("collegeId");
