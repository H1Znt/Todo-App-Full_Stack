import jwt from 'jsonwebtoken';
import { getDb } from '../db/database';
import { config } from '../config';

export function generateAccessToken(userId: number, username: string): string {
  return jwt.sign({ userId, username }, config.jwt.secretAccess, { expiresIn: config.jwt.expiresInAccess });
}

export function generateRefreshToken(userId: number, username: string): string {
  return jwt.sign({ userId, username }, config.jwt.secretRefresh, { expiresIn: config.jwt.expiresInRefresh });
}

export async function verifyRefreshToken(refreshToken: string): Promise<{ userId: number; username: string }> {
  const db = getDb();
  
  const tokenInDb = await db.get(
    'SELECT userId FROM tokens WHERE refreshToken = ?',
    refreshToken
  );
  
  if (!tokenInDb) {
    throw new Error('Invalid refresh token');
  }
  
  const payload = jwt.verify(refreshToken, config.jwt.secretRefresh) as { userId: number; username: string };
  return payload;
}

export async function storeRefreshToken(userId: number, refreshToken: string): Promise<void> {
  const db = getDb();
  await db.run(
    'INSERT INTO tokens (userId, refreshToken) VALUES (?, ?)',
    userId, refreshToken
  );
}

export async function removeRefreshToken(refreshToken: string): Promise<void> {
  const db = getDb();
  await db.run('DELETE FROM tokens WHERE refreshToken = ?', refreshToken);
}