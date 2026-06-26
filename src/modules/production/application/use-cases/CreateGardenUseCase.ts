import { GardenRepository } from "../../domain/repositories/GardenRepository.js";
import { LotCodeGenerator } from "../../domain/service/LotCodeGenerator.js";
import { CreateGardenDTO } from "../dtos/CreateGardenDTO.js";

export class CreateGardenUseCase {
  constructor(
    private gardenRepository: GardenRepository
  ) {}

  async execute(data: CreateGardenDTO, organizationId: number) {
    const lotCode = LotCodeGenerator.generate(data.crop || "Vazio");

    const garden = await this.gardenRepository.create({
      ...data,
      lotCode,
      organizationId
    });

    return garden;
  }
}