import { GardenRepository } from "../../domain/repositories/GardenRepository.js";
import { StandCalculator } from "../../domain/service/StandCalculator.js";

export class CalculateStandUseCase {
  constructor(private gardenRepository: GardenRepository) {}

  async execute(areaM2: number, cropPlanId: number) {
    const plan = await this.gardenRepository.findCropPlanById(cropPlanId);

    if (!plan || !plan.spacingX || !plan.spacingY) {
      throw new Error("Plano de cultivo incompleto.");
    }

    const baseStand = StandCalculator.calculate(areaM2, plan.spacingX, plan.spacingY);
    
    const germination = plan.germinationRate || 0.95;
    const requiredSeeds = Math.ceil(baseStand / germination);

    return {
      baseStand,
      requiredSeeds,
      expectedYieldKg: baseStand * (plan.expectedWeightPerUnit || 0) * 0.85
    };
  }
}