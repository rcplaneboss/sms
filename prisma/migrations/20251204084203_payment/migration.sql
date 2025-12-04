-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- AlterTable
ALTER TABLE "public"."Application" ADD COLUMN     "paymentStatus" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING';

-- CreateTable
CREATE TABLE "public"."Payment" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "receiptUrl" TEXT NOT NULL,
    "receiptFileName" TEXT,
    "status" "public"."PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "approvedBy" TEXT,
    "approvalNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payment_applicationId_key" ON "public"."Payment"("applicationId");

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "public"."Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;
