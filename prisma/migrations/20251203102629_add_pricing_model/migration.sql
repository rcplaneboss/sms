-- CreateTable
CREATE TABLE "public"."Pricing" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "billingCycle" TEXT NOT NULL DEFAULT 'ANNUAL',
    "description" TEXT,
    "discountPercent" DOUBLE PRECISION,
    "discountEndDate" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Pricing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Pricing_programId_key" ON "public"."Pricing"("programId");

-- AddForeignKey
ALTER TABLE "public"."Pricing" ADD CONSTRAINT "Pricing_programId_fkey" FOREIGN KEY ("programId") REFERENCES "public"."Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
