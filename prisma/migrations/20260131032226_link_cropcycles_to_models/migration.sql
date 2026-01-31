-- CreateTable
CREATE TABLE "CropCycle" (
    "id" SERIAL NOT NULL,
    "gardenId" INTEGER NOT NULL,
    "cropPlanId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedHarvestDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CropCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GardenTask" (
    "id" SERIAL NOT NULL,
    "cropCycleId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "GardenTask_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CropCycle" ADD CONSTRAINT "CropCycle_gardenId_fkey" FOREIGN KEY ("gardenId") REFERENCES "Garden"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropCycle" ADD CONSTRAINT "CropCycle_cropPlanId_fkey" FOREIGN KEY ("cropPlanId") REFERENCES "CropPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GardenTask" ADD CONSTRAINT "GardenTask_cropCycleId_fkey" FOREIGN KEY ("cropCycleId") REFERENCES "CropCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
