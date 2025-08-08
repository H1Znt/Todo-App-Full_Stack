import express from 'express';
import { createUser, findUserByUsername } from '../models/user';
import bcrypt from 'bcryptjs';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  storeRefreshToken,
  removeRefreshToken,
  verifyRefreshToken
} from '../utils/auth';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const existingUser = await findUserByUsername(username);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists or an incorrect password' });
    }
    
    const user = await createUser(username, password);
    
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);
    
    await storeRefreshToken(user.id, refreshToken);
    
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = await findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const accessToken = generateAccessToken(user.id, user.username);
    const refreshToken = generateRefreshToken(user.id, user.username);
    
    await storeRefreshToken(user.id, refreshToken);
    
    res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }
    
    await removeRefreshToken(refreshToken);
    
    const { userId, username } = await verifyRefreshToken(refreshToken);
    
    const newAccessToken = generateAccessToken(userId, username);
    const newRefreshToken = generateRefreshToken(userId, username);
    
    await storeRefreshToken(userId, newRefreshToken);
    
    res.json({ 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;