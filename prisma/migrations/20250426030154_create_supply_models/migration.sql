-- CreateTable
CREATE TABLE "SupplyUnit" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SupplyUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "SupplyCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supply" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "categoryId" INTEGER NOT NULL,
    "unitId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Supply_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SupplyUnit_name_key" ON "SupplyUnit"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SupplyCategory_name_key" ON "SupplyCategory"("name");

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "SupplyCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "SupplyUnit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supply" ADD CONSTRAINT "Supply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
