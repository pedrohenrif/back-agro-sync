import { prisma } from "../../../../core/database/prisma.js";
import { User, Organization } from "@prisma/client";
import { UserRepository } from "../../domain/repositories/UserRepository.js";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return await prisma.user.findUnique({ where: { id } });
  }

  async findOrganizationById(id: number): Promise<Organization | null> {
    return await prisma.organization.findUnique({ where: { id } });
  }

  async createWithOrganization(data: any): Promise<User> {
    return await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: data.organizationName }
      });

      return await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          password: data.password, 
          role: 'ADMIN',
          organizationId: organization.id
        }
      });
    });
  }
}