import { User, Organization } from "@prisma/client";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  findOrganizationById(id: number): Promise<Organization | null>;
  createWithOrganization(data: any): Promise<User>;
}