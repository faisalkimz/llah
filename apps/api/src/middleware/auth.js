import { jwtVerify } from 'jose';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
const secret = new TextEncoder().encode(env.JWT_ACCESS_SECRET);
export async function requireAuth(req, res, next) {
  const value = req.headers.authorization || '';
  const token = value.startsWith('Bearer ') ? value.slice(7) : null;
  if (!token) return res.status(401).json({ error:{ code:'UNAUTHENTICATED', message:'Authentication required.' } });
  try { 
    const { payload } = await jwtVerify(token, secret);
    if (payload.jti) {
      const session = await prisma.session.findUnique({ where: { id: payload.jti } });
      if (!session || session.revokedAt) {
        return res.status(401).json({ error: { code: 'SESSION_REVOKED', message: 'Session has been revoked.' } });
      }
    }
    req.auth = payload;
    req.user = { id: payload.sub, email: payload.email };
    next(); 
  }
  catch { return res.status(401).json({ error:{ code:'INVALID_TOKEN', message:'Invalid or expired access token.' } }); }
}
