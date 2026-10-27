import { useState, useEffect, useRef, useCallback } from 'react';

const WS_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:4000/ws');

/**
 * React hook for connecting to the Llah WebSocket real-time feed.
 * Automatically reconnects on disconnect with exponential backoff.
 *
 * Usage:
 *   const { events, connected, lastEvent } = useRealtimeFeed({ orgId });
 */
export function useRealtimeFeed({ orgId, maxEvents = 50 } = {}) {
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeout = useRef(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const params = new URLSearchParams();
    if (orgId) params.set('orgId', orgId);
    const url = `${WS_URL}${params.toString() ? '?' + params.toString() : ''}`;

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'connected') return; // Skip connection confirmation

          setLastEvent(data);
          setEvents(prev => {
            const next = [data, ...prev];
            return next.slice(0, maxEvents); // Keep only the last N events
          });
        } catch {
          // Ignore non-JSON messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        // Reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current += 1;
        reconnectTimeout.current = setTimeout(connect, delay);
      };

      ws.onerror = () => {
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      // WebSocket constructor can throw if URL is invalid
      setConnected(false);
    }
  }, [orgId, maxEvents]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [connect]);

  function clearEvents() {
    setEvents([]);
    setLastEvent(null);
  }

  return { events, connected, lastEvent, clearEvents };
}
