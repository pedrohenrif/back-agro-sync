import { Request, Response } from "express";
import { PrismaGardenRepository } from "../persistence/PrismaGardenRepository.js";
import { CreateGardenUseCase } from "../../application/use-cases/CreateGardenUseCase.js";
import { ListGardensUseCase } from "../../application/use-cases/ListGardensUseCase.js";
import { CalculateStandUseCase } from "../../application/use-cases/CalculateStandUseCase.js";
import { DeleteGardenUseCase } from "../../application/use-cases/DeleteGardenUseCase.js";
import { UpdateGardenUseCase } from "../../application/use-cases/UpdateGardenUseCase.js";

const gardenRepository = new PrismaGardenRepository();

const createGardenUseCase = new CreateGardenUseCase(gardenRepository);
const listGardensUseCase = new ListGardensUseCase(gardenRepository);
const calculateStandUseCase = new CalculateStandUseCase(gardenRepository);
const updateGardenUseCase = new UpdateGardenUseCase(gardenRepository);
const deleteGardenUseCase = new DeleteGardenUseCase(gardenRepository);

export class GardenController {
  
  async create(req: Request, res: Response): Promise<void> {
    const organizationId = req.user!.organizationId;
    
    const result = await createGardenUseCase.execute(req.body, organizationId);
    
    res.status(201).json(result);
  }

  async index(req: Request, res: Response): Promise<void> {
    const organizationId = req.user!.organizationId;
    
    const gardens = await listGardensUseCase.execute(organizationId);
    
    res.json(gardens);
  }

  async calculate(req: Request, res: Response): Promise<void> {
    const { areaM2, cropPlanId } = req.body;
    
    const result = await calculateStandUseCase.execute(areaM2, Number(cropPlanId));
    
    res.json(result);
  }
  
  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;
    
    const result = await updateGardenUseCase.execute(
      Number(id), 
      organizationId, 
      req.body
    );
    
    res.json(result);
  }

  async delete(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const organizationId = req.user!.organizationId;

    await deleteGardenUseCase.execute(Number(id), organizationId);
    
    res.status(204).send();
  }
}