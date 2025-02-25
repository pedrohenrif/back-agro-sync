import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwt.js";

const prisma = new PrismaClient();

export const registerUser = async (nome: string, email: string, senha: string) => {
  const hashedPassword = await bcrypt.hash(senha, 10);
  return prisma.usuario.create({
    data: { nome, email, senha: hashedPassword },
  });
};

export const loginUsuario = async (email: string, senha: string) => {
  try {
    // Busca o usuário pelo e-mail
    const usuario = await prisma.usuario.findUnique({ where: { email } });

    if (!usuario) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    // Compara a senha informada com a senha armazenada
    const isMatch = await bcrypt.compare(senha, usuario.senha);

    if (!isMatch) {
      return { success: false, message: "E-mail ou senha inválidos." };
    }

    // Gera o token de autenticação
    const token = generateToken(usuario.nr_sequencia);

    return { success: true, message: "Login realizado com sucesso!", data: { token } };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return { success: false, message: "Erro interno. Tente novamente mais tarde." };
  }
};
