/*
  Warnings:

  - The `previousEducation` column on the `StudentProfile` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."PreviousEducationType" AS ENUM ('BASIC', 'HIGH_SCHOOL', 'MASTER_DEGREE', 'DEGREE_HOLDER', 'NOVICE', 'OTHERS');

-- AlterTable
ALTER TABLE "public"."StudentProfile" DROP COLUMN "previousEducation",
ADD COLUMN     "previousEducation" "public"."PreviousEducationType";

-- DropEnum
DROP TYPE "public"."previousEducationType";
