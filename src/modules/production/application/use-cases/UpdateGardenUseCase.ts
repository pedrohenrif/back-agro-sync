import { GardenRepository } from "../../domain/repositories/GardenRepository.js";
import { AppError } from "../../../../@shared/errors/AppError.js";

export class UpdateGardenUseCase {
  constructor(private gardenRepository: GardenRepository) {}

  async execute(id: number, organizationId: number, data: any) {
    const garden = await this.gardenRepository.findById(id, organizationId);

    if (!garden) {
      throw new AppError("Canteiro não encontrado ou acesso negado.", 404);
    }

    return await this.gardenRepository.update(id, organizationId, data);
  }
}