import { prisma } from "../../prisma/config/prisma.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";


export const registerUser = async (name: string, email: string, password: string) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prisma.user.create({
    data: {
      name, 
      email,
      password: hashedPassword, 
    },
  });
};

export const loginUser = async (email: string, password: string) => {
  try {

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    const token = generateToken(user.id);

    return { 
      success: true, 
      message: "Login realizado com sucesso!", 
      data: { 
        user: {
          id: user.id,
          email: user.email,
        },
        token 
      } 
    };
  } catch (error) {
    console.error(`Erro ao autenticar usuário (${email}):`, error);
    return { success: false, message: "Erro interno. Tente novamente mais tarde." };
  }
};