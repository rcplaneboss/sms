/*
  Warnings:

  - Made the column `phoneNumber` on table `StudentProfile` required. This step will fail if there are existing NULL values in that column.
  - Changed the type of `previousEducation` on the `StudentProfile` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."previousEducationType" AS ENUM ('BASIC', 'HIGH_SCHOOL', 'MASTER_DEGREE', 'DEGREE_HOLDER', 'NOVICE', 'OTHERS');

-- AlterTable
ALTER TABLE "public"."StudentProfile" ALTER COLUMN "phoneNumber" SET NOT NULL,
DROP COLUMN "previousEducation",
ADD COLUMN     "previousEducation" "public"."previousEducationType" NOT NULL;
