/*
  Warnings:

  - The `status` column on the `CropCycle` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `priority` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Task` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'DONE');

-- CreateEnum
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "CropCycleStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED');

-- AlterTable
ALTER TABLE "CropCycle" DROP COLUMN "status",
ADD COLUMN     "status" "CropCycleStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "priority",
ADD COLUMN     "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
DROP COLUMN "status",
ADD COLUMN     "status" "TaskStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "AIMessage_userId_createdAt_idx" ON "AIMessage"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CropCycle_gardenId_idx" ON "CropCycle"("gardenId");

-- CreateIndex
CREATE INDEX "CropCycle_cropPlanId_idx" ON "CropCycle"("cropPlanId");

-- CreateIndex
CREATE INDEX "CropCycle_status_idx" ON "CropCycle"("status");

-- CreateIndex
CREATE INDEX "CropPlan_organizationId_idx" ON "CropPlan"("organizationId");

-- CreateIndex
CREATE INDEX "Garden_organizationId_idx" ON "Garden"("organizationId");

-- CreateIndex
CREATE INDEX "Garden_organizationId_isActive_idx" ON "Garden"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "Garden_cropPlanId_idx" ON "Garden"("cropPlanId");

-- CreateIndex
CREATE INDEX "GardenTask_cropCycleId_idx" ON "GardenTask"("cropCycleId");

-- CreateIndex
CREATE INDEX "GardenTask_dueDate_isCompleted_idx" ON "GardenTask"("dueDate", "isCompleted");

-- CreateIndex
CREATE INDEX "Harvest_gardenId_harvestDate_idx" ON "Harvest"("gardenId", "harvestDate");

-- CreateIndex
CREATE INDEX "JournalEntry_gardenId_date_idx" ON "JournalEntry"("gardenId", "date");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_idx" ON "JournalEntry"("userId");

-- CreateIndex
CREATE INDEX "Membership_organizationId_idx" ON "Membership"("organizationId");

-- CreateIndex
CREATE INDEX "Supply_organizationId_idx" ON "Supply"("organizationId");

-- CreateIndex
CREATE INDEX "Supply_organizationId_isActive_idx" ON "Supply"("organizationId", "isActive");

-- CreateIndex
CREATE INDEX "Supply_categoryId_idx" ON "Supply"("categoryId");

-- CreateIndex
CREATE INDEX "Supply_unitId_idx" ON "Supply"("unitId");

-- CreateIndex
CREATE INDEX "SupplyCategory_organizationId_idx" ON "SupplyCategory"("organizationId");

-- CreateIndex
CREATE INDEX "SupplyTransaction_supplyId_createdAt_idx" ON "SupplyTransaction"("supplyId", "createdAt");

-- CreateIndex
CREATE INDEX "SupplyTransaction_organizationId_idx" ON "SupplyTransaction"("organizationId");

-- CreateIndex
CREATE INDEX "SupplyTransaction_userId_idx" ON "SupplyTransaction"("userId");

-- CreateIndex
CREATE INDEX "SupplyUnit_organizationId_idx" ON "SupplyUnit"("organizationId");

-- CreateIndex
CREATE INDEX "SupplyUsage_organizationId_idx" ON "SupplyUsage"("organizationId");

-- CreateIndex
CREATE INDEX "SupplyUsage_organizationId_gardenId_idx" ON "SupplyUsage"("organizationId", "gardenId");

-- CreateIndex
CREATE INDEX "SupplyUsage_gardenId_idx" ON "SupplyUsage"("gardenId");

-- CreateIndex
CREATE INDEX "SupplyUsage_supplyId_idx" ON "SupplyUsage"("supplyId");

-- CreateIndex
CREATE INDEX "SupplyUsage_usedAt_idx" ON "SupplyUsage"("usedAt");

-- CreateIndex
CREATE INDEX "Task_organizationId_idx" ON "Task"("organizationId");

-- CreateIndex
CREATE INDEX "Task_organizationId_status_idx" ON "Task"("organizationId", "status");

-- CreateIndex
CREATE INDEX "Task_organizationId_dueDate_idx" ON "Task"("organizationId", "dueDate");

-- CreateIndex
CREATE INDEX "Task_gardenId_idx" ON "Task"("gardenId");

-- CreateIndex
CREATE INDEX "Task_assignedToId_idx" ON "Task"("assignedToId");
