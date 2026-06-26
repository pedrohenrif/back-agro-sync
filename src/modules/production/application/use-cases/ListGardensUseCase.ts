import { GardenRepository } from "../../domain/repositories/GardenRepository.js";

export class ListGardensUseCase {
  constructor(private gardenRepository: GardenRepository) {}

  async execute(organizationId: number) {
    return await this.gardenRepository.findAllByOrg(organizationId);
  }
}