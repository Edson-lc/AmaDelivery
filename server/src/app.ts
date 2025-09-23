import express from 'express';
import cors from 'cors';
import { env } from './env';
import routes from './routes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), env: { port: env.PORT } });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', error);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
