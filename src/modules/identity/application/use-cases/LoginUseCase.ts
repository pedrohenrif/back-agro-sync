import { UserRepository } from "../../domain/repositories/UserRepository.js";
import { AppError } from "../../../../@shared/errors/AppError.js";
import { generateToken } from "../../../../@shared/utils/jwt.js";
import bcrypt from "bcrypt";

export class LoginUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ email, password }: any) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError("E-mail ou senha inválidos.", 401);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("E-mail ou senha inválidos.", 401);
    }

    const token = generateToken({
      userId: user.id,
      organizationId: user.organizationId,
      role: user.role
    });

    return {
      user: { id: user.id, name: user.name, email: user.email },
      token
    };
  }
}