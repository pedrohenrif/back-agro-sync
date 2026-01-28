/*
  Warnings:

  - Added the required column `updatedAt` to the `SupplyCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `symbol` to the `SupplyUnit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SupplyUnit` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "SupplyCategory_name_key";

-- DropIndex
DROP INDEX "SupplyUnit_name_key";

-- AlterTable
ALTER TABLE "SupplyCategory" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SupplyUnit" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "organizationId" INTEGER,
ADD COLUMN     "symbol" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "SupplyUnit" ADD CONSTRAINT "SupplyUnit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupplyCategory" ADD CONSTRAINT "SupplyCategory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
