import express from 'express';
import cors from 'cors';
import path from 'path';
import authRouter from './routes/auth';
import todosRouter from './routes/todos';
import { initializeDatabase } from './db/database';
import { config } from './config';
import devRouter from './routes/dev';

const app = express();

app.use(cors({
  origin: config.clientUrl ?? "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

initializeDatabase().then(() => {
  console.log('Database initialized');
}).catch(err => {
  console.error('Database initialization failed:', err);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Todo List API',
    endpoints: {
      auth: ['POST /auth/register', 'POST /auth/login', 'POST /auth/refresh'],
      todos: ['GET /todos', 'POST /todos', 'PUT /todos/:id', 'DELETE /todos/:id']
    }
  });
});

app.use('/auth', authRouter);
app.use('/todos', todosRouter);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.use('/dev', devRouter);

export default app;

// fetch('http://localhost:3000/dev/reset-db', { method: 'DELETE' })
//   .then(res => res.json())
//   .then(console.log)