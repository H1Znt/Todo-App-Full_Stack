import express from 'express';
import { getDb } from '../db/database';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/', async (req, res) => {
  try {
    const db = getDb();
    const todos = await db.all(
      'SELECT * FROM todos WHERE userId = ?',
      (req as any).user.userId
    );
    
    res.json(todos.map(todo => ({
      ...todo,
      completed: Boolean(todo.completed)
    })));
  } catch (error) {
    console.error('Get todos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    const userId = (req as any).user.userId;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const db = getDb();
    const result = await db.run(
      'INSERT INTO todos (title, userId) VALUES (?, ?)',
      title, userId
    );
    
    const newTodo = await db.get(
      'SELECT * FROM todos WHERE id = ?',
      result.lastID
    );
    
    res.status(201).json({
      ...newTodo,
      completed: Boolean(newTodo.completed)
    });
  } catch (error) {
    console.error('Create todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, completed } = req.body;
    const userId = (req as any).user.userId;
    
    const db = getDb();
    
    const todo = await db.get(
      'SELECT * FROM todos WHERE id = ? AND userId = ?',
      id, userId
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const updatedTodo = {
      title: title !== undefined ? title : todo.title,
      completed: completed !== undefined ? completed : todo.completed
    };
    
    await db.run(
      'UPDATE todos SET title = ?, completed = ? WHERE id = ?',
      updatedTodo.title, updatedTodo.completed ? 1 : 0, id
    );
    
    res.json({
      ...updatedTodo,
      id: Number(id),
      userId
    });
  } catch (error) {
    console.error('Update todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;
    
    const db = getDb();
    
    const todo = await db.get(
      'SELECT * FROM todos WHERE id = ? AND userId = ?',
      id, userId
    );
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    await db.run('DELETE FROM todos WHERE id = ?', id);
    
    res.sendStatus(204);
  } catch (error) {
    console.error('Delete todo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;