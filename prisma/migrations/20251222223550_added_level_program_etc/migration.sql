/*
  Warnings:

  - Added the required column `levelId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `programId` to the `Exam` table without a default value. This is not possible if the table is not empty.
  - Added the required column `trackId` to the `Exam` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Exam" ADD COLUMN     "levelId" TEXT NOT NULL,
ADD COLUMN     "programId" TEXT NOT NULL,
ADD COLUMN     "trackId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "public"."_CourseToExam" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CourseToExam_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CourseToExam_B_index" ON "public"."_CourseToExam"("B");

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "public"."Track"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "public"."Level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Exam" ADD CONSTRAINT "Exam_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CourseToExam" ADD CONSTRAINT "_CourseToExam_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_CourseToExam" ADD CONSTRAINT "_CourseToExam_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Exam"("id") ON DELETE CASCADE ON UPDATE CASCADE;
