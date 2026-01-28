/*
  Warnings:

  - You are about to drop the column `observations` on the `Harvest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Harvest" DROP COLUMN "observations",
ADD COLUMN     "notes" TEXT;
