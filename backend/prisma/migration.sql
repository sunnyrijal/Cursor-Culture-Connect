-- CreateTable
CREATE TABLE "User" (
  "id" SERIAL NOT NULL,
  "email" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL,
  "fullName" TEXT,
  "university" TEXT,
  "state" TEXT,
  "city" TEXT,
  "mobileNumber" TEXT,
  "dateOfBirth" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "isRSVPed" BOOLEAN NOT NULL DEFAULT false,
  "isFavorited" BOOLEAN NOT NULL DEFAULT false,
  "imageUrl" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "time" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "categories" TEXT[],
  "organizer" TEXT NOT NULL,

  CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email"); 