/*
  Warnings:

  - You are about to drop the column `costAtTime` on the `SupplyUsage` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `SupplyUsage` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `SupplyUsage` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `SupplyUsage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantityUsed` to the `SupplyUsage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SupplyUsage" DROP CONSTRAINT "SupplyUsage_supplyId_fkey";

-- AlterTable
ALTER TABLE "SupplyUsage" DROP COLUMN "costAtTime",
DROP COLUMN "date",
DROP COLUMN "quantity",
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "organizationId" INTEGER NOT NULL,
ADD COLUMN     "quantityUsed" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "SupplyUsage" ADD CONSTRAINT "SupplyUsage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyUsage" ADD CONSTRAINT "SupplyUsage_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE CASCADE ON UPDATE CASCADE;
