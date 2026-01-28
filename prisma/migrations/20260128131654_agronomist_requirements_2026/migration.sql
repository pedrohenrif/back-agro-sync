/*
  Warnings:

  - You are about to drop the column `description` on the `CropPlan` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `Supply` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[lotCode]` on the table `Garden` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `lotCode` to the `Garden` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `JournalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CropPlan" DROP COLUMN "description",
ADD COLUMN     "commercialEfficiency" DOUBLE PRECISION DEFAULT 0.85,
ADD COLUMN     "expectedWeightPerUnit" DOUBLE PRECISION,
ADD COLUMN     "germinationRate" DOUBLE PRECISION DEFAULT 0.95,
ADD COLUMN     "safetyMargin" DOUBLE PRECISION DEFAULT 0.10,
ADD COLUMN     "spacingX" DOUBLE PRECISION,
ADD COLUMN     "spacingY" DOUBLE PRECISION,
ADD COLUMN     "targetMarketPrice" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Garden" ADD COLUMN     "cropPlanId" INTEGER,
ADD COLUMN     "geometry" JSONB,
ADD COLUMN     "lotCode" TEXT NOT NULL,
ADD COLUMN     "mapColor" TEXT DEFAULT '#2e7d32';

-- AlterTable
ALTER TABLE "JournalEntry" ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Supply" DROP COLUMN "isActive",
ADD COLUMN     "brand" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "minStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "supplierLot" TEXT,
ADD COLUMN     "unitPrice" DOUBLE PRECISION,
ADD COLUMN     "withdrawalDays" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "gardenId" INTEGER;

-- CreateTable
CREATE TABLE "SupplyUsage" (
    "id" SERIAL NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "costAtTime" DOUBLE PRECISION,
    "supplyId" INTEGER NOT NULL,
    "gardenId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SupplyUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Garden_lotCode_key" ON "Garden"("lotCode");

-- AddForeignKey
ALTER TABLE "Garden" ADD CONSTRAINT "Garden_cropPlanId_fkey" FOREIGN KEY ("cropPlanId") REFERENCES "CropPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyUsage" ADD CONSTRAINT "SupplyUsage_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyUsage" ADD CONSTRAINT "SupplyUsage_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE CASCADE ON UPDATE CASCADE;
