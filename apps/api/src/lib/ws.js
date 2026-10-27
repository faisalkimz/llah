import { WebSocketServer } from 'ws';

let wss = null;

/**
 * Initialize WebSocket server on the existing HTTP server.
 * Clients connect to ws://localhost:4000 and receive real-time events.
 */
export function initWebSocket(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // Optionally track org ID from query params
    const url = new URL(req.url, `http://${req.headers.host}`);
    ws.orgId = url.searchParams.get('orgId') || null;

    ws.isAlive = true;
    ws.on('pong', () => { ws.isAlive = true; });

    ws.send(JSON.stringify({
      type: 'connected',
      message: 'Connected to Llah real-time feed',
      timestamp: new Date().toISOString(),
    }));
  });

  // Heartbeat every 30s to clean up dead connections
  const interval = setInterval(() => {
    wss.clients.forEach(ws => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on('close', () => clearInterval(interval));

  console.log('WebSocket server initialized at /ws');
  return wss;
}

/**
 * Broadcast a real-time event to all connected clients (optionally filtered by orgId).
 */
export function broadcast(eventType, data, orgId = null) {
  if (!wss) return;

  const message = JSON.stringify({
    type: eventType,
    data,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      // If the client is filtering by org, only send matching events
      if (orgId && client.orgId && client.orgId !== orgId) return;
      client.send(message);
    }
  });
}

/**
 * Get the current WebSocket server instance.
 */
export function getWss() {
  return wss;
}
