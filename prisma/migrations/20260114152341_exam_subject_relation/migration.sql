/*
  Warnings:

  - You are about to drop the `Course` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_CourseToExam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProgramToCourse` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TeacherCourses` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ProgramType" AS ENUM ('CLASS', 'DEPARTMENT', 'OTHER');

-- DropForeignKey
ALTER TABLE "Course" DROP CONSTRAINT "Course_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToExam" DROP CONSTRAINT "_CourseToExam_A_fkey";

-- DropForeignKey
ALTER TABLE "_CourseToExam" DROP CONSTRAINT "_CourseToExam_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProgramToCourse" DROP CONSTRAINT "_ProgramToCourse_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProgramToCourse" DROP CONSTRAINT "_ProgramToCourse_B_fkey";

-- DropForeignKey
ALTER TABLE "_TeacherCourses" DROP CONSTRAINT "_TeacherCourses_A_fkey";

-- DropForeignKey
ALTER TABLE "_TeacherCourses" DROP CONSTRAINT "_TeacherCourses_B_fkey";

-- AlterTable
ALTER TABLE "Exam" ADD COLUMN     "subjectId" TEXT;

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "type" "ProgramType" NOT NULL DEFAULT 'CLASS';

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "teacherProfileId" TEXT;

-- DropTable
DROP TABLE "Course";

-- DropTable
DROP TABLE "_CourseToExam";

-- DropTable
DROP TABLE "_ProgramToCourse";

-- DropTable
DROP TABLE "_TeacherCourses";

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_teacherProfileId_fkey" FOREIGN KEY ("teacherProfileId") REFERENCES "TeacherProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Exam" ADD CONSTRAINT "Exam_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
