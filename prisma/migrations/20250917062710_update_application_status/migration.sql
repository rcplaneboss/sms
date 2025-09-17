-- AlterEnum
ALTER TYPE "public"."ApplicationStatus" ADD VALUE 'INTERVIEW_SCHEDULED';

-- AlterTable
ALTER TABLE "public"."TeacherProfile" ADD COLUMN     "acceptedTerms" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."TeacherPaymentInfo" (
    "id" TEXT NOT NULL,
    "bankName" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "accountNumber" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "teacherId" TEXT NOT NULL,

    CONSTRAINT "TeacherPaymentInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeacherPaymentInfo_teacherId_key" ON "public"."TeacherPaymentInfo"("teacherId");

-- AddForeignKey
ALTER TABLE "public"."TeacherPaymentInfo" ADD CONSTRAINT "TeacherPaymentInfo_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "public"."TeacherProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
