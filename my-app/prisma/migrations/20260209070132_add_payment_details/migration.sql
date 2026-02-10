-- AlterTable
ALTER TABLE "License" ADD COLUMN     "bank" TEXT,
ADD COLUMN     "cardType" TEXT,
ADD COLUMN     "grossAmount" TEXT,
ADD COLUMN     "maskedCard" TEXT,
ADD COLUMN     "paymentType" TEXT,
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "transactionStatus" TEXT,
ADD COLUMN     "transactionTime" TIMESTAMP(3),
ADD COLUMN     "vaNumber" TEXT;
