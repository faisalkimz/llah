import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error-handler.js';
import { apiRouter } from './routes.js';

// Handle BigInt serialization in JSON
BigInt.prototype.toJSON = function() { return this.toString(); };

export const app = express();
app.set('trust proxy', 1);
app.use(pinoHttp());
app.use(helmet());
app.use(cors({ origin: env.WEB_URL, credentials: true }));
app.use(rateLimit({ windowMs: 60_000, limit: 300 }));
app.use(express.json({ limit: '1mb' }));
app.get('/health', (req,res)=>res.json({status:'ok',service:'llah-api'}));
app.use('/v1', apiRouter);
app.use(errorHandler);
