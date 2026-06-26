import { Request, Response } from "express";
import { PrismaUserRepository } from "../persistence/PrismaUserRepository.js";
import { LoginUseCase } from "../../application/use-cases/LoginUseCase.js";
import { AppError } from "../../../../@shared/errors/AppError.js";


const userRepository = new PrismaUserRepository();
const loginUseCase = new LoginUseCase(userRepository);

export class AuthController {
  
  async login(req: Request, res: Response): Promise<void> {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError("E-mail e senha são obrigatórios.");
    }

    const result = await loginUseCase.execute({ email, password });

    res.json({ success: true, data: result });
  }

  async getMe(req: Request, res: Response): Promise<void> {
    const userId = req.user?.userId;
    const orgId = req.user?.organizationId;

    if (!userId || !orgId) {
      throw new AppError("Usuário não identificado.", 401);
    }

    const user = await userRepository.findById(userId);
    const organization = await userRepository.findOrganizationById(orgId);

    if (!user || !organization) {
      throw new AppError("Dados não encontrados.", 404);
    }

    const { password, ...userWithoutPassword } = user;

    res.json({ 
      user: userWithoutPassword, 
      organization 
    });
  }
}