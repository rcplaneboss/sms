/*
  Warnings:

  - You are about to drop the column `programId` on the `Course` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Course` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Course" DROP CONSTRAINT "Course_programId_fkey";

-- AlterTable
ALTER TABLE "public"."Course" DROP COLUMN "programId";

-- CreateTable
CREATE TABLE "public"."_ProgramToSubject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramToSubject_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_ProgramToCourse" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ProgramToCourse_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ProgramToSubject_B_index" ON "public"."_ProgramToSubject"("B");

-- CreateIndex
CREATE INDEX "_ProgramToCourse_B_index" ON "public"."_ProgramToCourse"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Course_name_key" ON "public"."Course"("name");

-- AddForeignKey
ALTER TABLE "public"."_ProgramToSubject" ADD CONSTRAINT "_ProgramToSubject_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProgramToSubject" ADD CONSTRAINT "_ProgramToSubject_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Subject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProgramToCourse" ADD CONSTRAINT "_ProgramToCourse_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ProgramToCourse" ADD CONSTRAINT "_ProgramToCourse_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
