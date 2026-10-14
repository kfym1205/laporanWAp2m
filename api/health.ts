import type { IncomingMessage, ServerResponse } from 'http';

interface HealthResponse {
  status: string;
  hasGeminiKey: boolean;
  environment: string;
  timestamp: string;
}

export default async function handler(
  req: IncomingMessage & { query?: Record<string, any>; method?: string },
  res: ServerResponse & {
    status?: (code: number) => any;
    json?: (data: any) => any;
  }
) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    if (typeof res.status === 'function') {
      res.status(200).end();
    } else {
      res.statusCode = 200;
      res.end();
    }
    return;
  }

  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  const data: HealthResponse = {
    status: 'ok',
    hasGeminiKey: hasKey,
    environment: process.env.VERCEL ? 'vercel' : 'node-express',
    timestamp: new Date().toISOString(),
  };

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(200).json(data);
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}
