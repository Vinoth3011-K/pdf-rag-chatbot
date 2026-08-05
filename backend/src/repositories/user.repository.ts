import { User } from "@prisma/client";
import { prisma } from "@config/prisma";

export class UserRepository {
  findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: string;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: data.passwordHash,
        role: data.role || "USER"
      }
    });
  }

  updateRefreshToken(id: string, refreshToken: string | null): Promise<User> {
    return prisma.user.update({
      where: { id },
      data: { refreshToken }
    });
  }
}

export const userRepository = new UserRepository();