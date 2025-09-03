/*
  Warnings:

  - The `previousEducation` column on the `StudentProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."StudentProfile" DROP COLUMN "previousEducation",
ADD COLUMN     "previousEducation" TEXT;
