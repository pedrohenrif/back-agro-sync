-- AlterTable
ALTER TABLE "PlanSupply" ADD COLUMN     "supplyId" INTEGER;

-- AddForeignKey
ALTER TABLE "PlanSupply" ADD CONSTRAINT "PlanSupply_supplyId_fkey" FOREIGN KEY ("supplyId") REFERENCES "Supply"("id") ON DELETE SET NULL ON UPDATE CASCADE;
