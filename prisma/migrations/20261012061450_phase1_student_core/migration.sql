-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "address" TEXT,
ADD COLUMN     "guardianName" TEXT,
ADD COLUMN     "guardianPhone" TEXT;

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL,
    "studentName" TEXT NOT NULL,
    "guardianName" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "classApplied" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Enquiry_pkey" PRIMARY KEY ("id")
);
