import jwt, { type Secret } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as Secret;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set");
}

export type JwtPayload = { sub: string; email?: string };

export function signToken(payload: JwtPayload, expiresInSeconds: number = 60 * 60 * 24 * 7) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresInSeconds });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
