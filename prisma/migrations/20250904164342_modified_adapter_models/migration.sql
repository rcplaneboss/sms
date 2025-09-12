/*
  Warnings:

  - The primary key for the `Account` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accessTokenExpires` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `providerType` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `refreshToken` on the `Account` table. All the data in the column will be lost.
  - The primary key for the `Session` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `accessToken` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `Session` table. All the data in the column will be lost.
  - You are about to drop the `VerificationRequest` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_userId_fkey";

-- DropIndex
DROP INDEX "public"."Account_provider_providerAccountId_key";

-- DropIndex
DROP INDEX "public"."Session_accessToken_key";

-- AlterTable
ALTER TABLE "public"."Account" DROP CONSTRAINT "Account_pkey",
DROP COLUMN "accessTokenExpires",
DROP COLUMN "id",
DROP COLUMN "providerType",
DROP COLUMN "refreshToken",
ADD COLUMN     "expires_at" INTEGER,
ADD COLUMN     "id_token" TEXT,
ADD COLUMN     "refresh_token" TEXT,
ADD COLUMN     "scope" TEXT,
ADD COLUMN     "session_state" TEXT,
ADD COLUMN     "token_type" TEXT,
ADD COLUMN     "type" TEXT NOT NULL,
ADD CONSTRAINT "Account_pkey" PRIMARY KEY ("provider", "providerAccountId");

-- AlterTable
ALTER TABLE "public"."Session" DROP CONSTRAINT "Session_pkey",
DROP COLUMN "accessToken",
DROP COLUMN "id";

-- DropTable
DROP TABLE "public"."VerificationRequest";

-- CreateTable
CREATE TABLE "public"."VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- AddForeignKey
ALTER TABLE "public"."Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
