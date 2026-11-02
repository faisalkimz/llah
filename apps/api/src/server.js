import 'dotenv/config';
import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initWebSocket } from './lib/ws.js';
import * as subscriptionsService from './modules/subscriptions/service.js';

const server = createServer(app);
initWebSocket(server);

server.listen(env.PORT, () => console.log(`Llah API listening on http://localhost:${env.PORT}`));

// Background scheduler: process subscription expirations + renewals every 5 minutes
setInterval(async () => {
  try { await subscriptionsService.processExpiredSubscriptions(); }
  catch (err) { console.error('Subscription expiration job failed:', err); }
  try { await subscriptionsService.processActiveSubscriptionRenewals(); }
  catch (err) { console.error('Subscription renewal job failed:', err); }
}, 5 * 60 * 1000);
