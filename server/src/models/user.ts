import bcrypt from 'bcryptjs';
import { getDb } from '../db/database';

export interface User {
  id: number;
  username: string;
  passwordHash: string;
}

export async function createUser(username: string, password: string): Promise<User> {
  const db = getDb();
  const passwordHash = await bcrypt.hash(password, 10);
  
  const result = await db.run(
    'INSERT INTO users (username, passwordHash) VALUES (?, ?)',
    username, passwordHash
  );
  
  if (result.lastID === undefined) {
    throw new Error('Failed to create user: lastID is undefined');
  }
  
  return {
    id: result.lastID,
    username,
    passwordHash
  };
}

export async function findUserByUsername(username: string): Promise<User | undefined> {
  const db = getDb();
  return await db.get('SELECT * FROM users WHERE username = ?', username);
}