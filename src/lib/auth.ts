import { JWTPayload, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
export async function verifyAuth(token: string): Promise<JWTPayload> {
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    return verified.payload;
  } catch {
    throw new Error('Invalid token');
  }
}



export async function comparePasswords(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// export default or other named exports
