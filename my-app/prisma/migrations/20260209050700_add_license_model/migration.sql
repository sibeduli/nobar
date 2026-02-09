/*
  Warnings:

  - You are about to drop the column `status` on the `Merchant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Merchant" DROP COLUMN "status";

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL,
    "venueId" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'unpaid',
    "paidAt" TIMESTAMP(3),
    "midtransId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "License_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "License_venueId_key" ON "License"("venueId");

-- AddForeignKey
ALTER TABLE "License" ADD CONSTRAINT "License_venueId_fkey" FOREIGN KEY ("venueId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
