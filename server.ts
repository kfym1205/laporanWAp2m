import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import expandResultsHandler from './api/expand-results.ts';
import healthHandler from './api/health.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  return healthHandler(req, res);
});
app.options('/api/health', (req: Request, res: Response) => {
  return healthHandler(req, res);
});

// Gemini Expand Result endpoints
app.post('/api/expand-results', (req: Request, res: Response) => {
  return expandResultsHandler(req, res);
});
app.options('/api/expand-results', (req: Request, res: Response) => {
  return expandResultsHandler(req, res);
});

// Vite or Static file serving
async function initServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Laporan Harian P2M Server berjalan di port ${PORT}`);
  });
}

initServer().catch((err) => {
  console.error('Gagal menjalankan server:', err);
  process.exit(1);
});
