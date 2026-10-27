import 'dotenv/config';
import { createServer } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { initWebSocket } from './lib/ws.js';

const server = createServer(app);
initWebSocket(server);

server.listen(env.PORT, () => console.log(`Llah API listening on http://localhost:${env.PORT}`));
