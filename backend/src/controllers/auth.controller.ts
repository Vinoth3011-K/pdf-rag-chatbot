import { Request, Response } from "express";
import { authService } from "@services/auth.service";
import { ApiError } from "@utils/ApiError";
import { asyncHandler } from "@middlewares/errorHandler";
import { env } from "@config/env";

const refreshCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: "strict" as const,
  path: "/api/auth/refresh"
};


// Signup
export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  const user = await authService.signup(
    name,
    email,
    password
  );

  res.status(201).json({
    success: true,
    data: { user }
  });
});


// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await authService.login(
    email,
    password
  );

  res.cookie(
    "refreshToken",
    result.refreshToken,
    refreshCookieOptions
  );

  res.status(200).json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
});


// Refresh token
export const refresh = asyncHandler(async (req: Request, res: Response) => {

  const token =
    req.cookies?.refreshToken ||
    req.body?.refreshToken;

  if (!token) {
    throw ApiError.unauthorized(
      "Refresh token missing"
    );
  }


  const result = await authService.refresh(token);


  res.cookie(
    "refreshToken",
    result.refreshToken,
    refreshCookieOptions
  );


  res.status(200).json({
    success: true,
    data: {
      accessToken: result.accessToken,
      user: result.user
    }
  });
});


// Logout
export const logout = asyncHandler(async (req: Request, res: Response) => {

  if (req.user) {
    await authService.logout(
      req.user.sub
    );
  }


  res.clearCookie(
    "refreshToken",
    {
      path: "/api/auth/refresh"
    }
  );


  res.status(200).json({
    success: true,
    data: {
      message: "Logged out successfully"
    }
  });
});


// Current user
export const me = asyncHandler(async (req: Request, res: Response) => {

  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });

});