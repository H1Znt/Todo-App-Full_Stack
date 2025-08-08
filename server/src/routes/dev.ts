import express from 'express';
import { getDb } from '../db/database';

const router = express.Router();

router.delete('/reset-db', async (req, res) => {
  try {
    const db = await getDb();
    
    await db.run('DELETE FROM todos');
    await db.run('DELETE FROM tokens');
    await db.run('DELETE FROM users');
    
    res.json({ message: 'Database cleared successfully' });
  } catch (error) {
    console.error('DB reset error:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

export default router;