import bcrypt from "bcrypt";
import { userRepository } from "@repositories/user.repository";
import { ApiError } from "@utils/ApiError";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@utils/token";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; role: string };
}

export class AuthService {

  async signup(
    name: string,
    email: string,
    password: string
  ): Promise<{ id: string; email: string; name: string; role: string }> {

    const existingUser = await userRepository.findByEmail(email);

    if (existingUser) {
      throw ApiError.badRequest("Email already registered");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepository.create({
      name,
      email,
      passwordHash
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }


  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatches) {
      throw ApiError.unauthorized("Invalid email or password");
    }

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    const refreshToken = signRefreshToken({
      sub: user.id
    });

    await userRepository.updateRefreshToken(
      user.id,
      refreshToken
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }


  async refresh(refreshToken: string): Promise<AuthTokens> {

    let payload;

    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized(
        "Invalid or expired refresh token"
      );
    }


    const user = await userRepository.findById(payload.sub);

    if (!user || user.refreshToken !== refreshToken) {
      throw ApiError.unauthorized(
        "Refresh token has been revoked"
      );
    }


    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role
    });


    const newRefreshToken = signRefreshToken({
      sub: user.id
    });


    await userRepository.updateRefreshToken(
      user.id,
      newRefreshToken
    );


    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }


  async logout(userId: string): Promise<void> {
    await userRepository.updateRefreshToken(
      userId,
      null
    );
  }
}


export const authService = new AuthService();