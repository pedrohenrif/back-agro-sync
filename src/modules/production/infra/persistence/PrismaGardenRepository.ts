import { prisma } from "../../../../core/database/prisma.js";
import { Garden } from "@prisma/client";
import { GardenRepository } from "../../domain/repositories/GardenRepository.js";
import { CreateGardenDTO } from "../../application/dtos/CreateGardenDTO.js";

export class PrismaGardenRepository implements GardenRepository {
  
  async create(data: CreateGardenDTO & { lotCode: string; organizationId: number }): Promise<Garden> {
    return await prisma.garden.create({
      data: {
        name: data.name,
        crop: data.crop || "Vazio",
        lotCode: data.lotCode,
        plantingDate: data.plantingDate ? new Date(data.plantingDate) : undefined,
        sizeInM2: data.sizeInM2,
        location: data.location || "",
        organization: { connect: { id: data.organizationId } },
        cropPlan: data.cropPlanId ? { connect: { id: data.cropPlanId } } : undefined,
      }
    });
  }

  async findAllByOrg(organizationId: number): Promise<Garden[]> {
    return await prisma.garden.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findById(id: number, organizationId: number): Promise<Garden | null> {
    return await prisma.garden.findFirst({
      where: { id, organizationId }
    });
  }

  async update(id: number, organizationId: number, data: any): Promise<Garden> {
    return await prisma.garden.update({
      where: { id }, 
      data: {
        ...data,
        plantingDate: data.plantingDate ? new Date(data.plantingDate) : undefined,
      }
    });
  }

  async delete(id: number, organizationId: number): Promise<void> {
    await prisma.garden.delete({
      where: { id }
    });
  }

  async findCropPlanById(cropPlanId: number): Promise<any | null> {
    return await prisma.cropPlan.findUnique({
      where: { id: cropPlanId }
    });
  }
}