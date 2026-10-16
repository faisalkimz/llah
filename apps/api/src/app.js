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
// Capture raw body for webhook HMAC verification before json parser runs
app.use('/v1/webhooks-inbound', express.raw({ type: '*/*', limit: '1mb' }), (req, _res, next) => {
  if (Buffer.isBuffer(req.body)) {
    req.rawBody = req.body.toString('utf8');
    try {
      req.body = JSON.parse(req.rawBody || '{}');
    } catch {
      req.body = {};
    }
  }
  next();
});
app.use(express.json({ limit: '1mb' }));
app.get('/health', (req,res)=>res.json({status:'ok',service:'llah-api'}));
app.use('/v1', apiRouter);
app.use(errorHandler);
