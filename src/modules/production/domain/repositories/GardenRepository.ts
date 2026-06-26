import { Garden } from "@prisma/client";
import { CreateGardenDTO } from "../../application/dtos/CreateGardenDTO.js";

export interface GardenRepository {
  create(data: CreateGardenDTO & { lotCode: string; organizationId: number }): Promise<Garden>;
  findAllByOrg(organizationId: number): Promise<Garden[]>;
  findById(id: number, organizationId: number): Promise<Garden | null>;
  update(id: number, organizationId: number, data: Partial<CreateGardenDTO>): Promise<Garden>;
  delete(id: number, organizationId: number): Promise<void>;
  
  findCropPlanById(cropPlanId: number): Promise<any | null>;
}