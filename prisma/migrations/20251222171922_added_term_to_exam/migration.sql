-- CreateEnum
CREATE TYPE "public"."TermType" AS ENUM ('FIRST', 'SECOND', 'THIRD', 'FOURTH');

-- AlterTable
ALTER TABLE "public"."Exam" ADD COLUMN     "term" "public"."TermType" NOT NULL DEFAULT 'FIRST';
