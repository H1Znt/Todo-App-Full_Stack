import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Environment variable ${name} is missing`);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
  jwt: {
    secretAccess: getEnvVar("JWT_SECRET_ACCESS") as jwt.Secret,
    secretRefresh: getEnvVar("JWT_SECRET_REFRESH") as jwt.Secret,
    expiresInAccess: (process.env.ACCESS_TOKEN_EXPIRES_IN ??
      "15m") as jwt.SignOptions["expiresIn"],
    expiresInRefresh: (process.env.REFRESH_TOKEN_EXPIRES_IN ??
      "7d") as jwt.SignOptions["expiresIn"],
  },
};
