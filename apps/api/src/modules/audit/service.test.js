import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma.js', () => ({
  default: {
    auditEvent: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      groupBy: vi.fn(),
    },
  },
}));

import prisma from '../../lib/prisma.js';
import * as service from './service.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('audit service', () => {
  describe('listAuditLog', () => {
    it('calls findMany with org filter, actor include, take/skip, and desc ordering', async () => {
      prisma.auditEvent.findMany.mockResolvedValue([]);

      await service.listAuditLog('org1', { limit: 15, offset: 5 });

      expect(prisma.auditEvent.findMany).toHaveBeenCalledWith({
        where: { organizationId: 'org1' },
        orderBy: { createdAt: 'desc' },
        take: 15,
        skip: 5,
        include: {
          actor: { select: { id: true, email: true, name: true } },
        },
      });
    });
  });

  describe('getAuditEntry', () => {
    it('returns the entry with actor include when found', async () => {
      const entry = {
        id: 'ev1',
        organizationId: 'org1',
        action: 'test',
        actor: { id: 'u1', email: 'a@b.com', name: 'A' },
      };
      prisma.auditEvent.findFirst.mockResolvedValue(entry);

      const result = await service.getAuditEntry('ev1', 'org1');

      expect(prisma.auditEvent.findFirst).toHaveBeenCalledWith({
        where: { id: 'ev1', organizationId: 'org1' },
        include: { actor: { select: { id: true, email: true, name: true } } },
      });
      expect(result).toBe(entry);
    });

    it('throws 404 when entry not found', async () => {
      prisma.auditEvent.findFirst.mockResolvedValue(null);
      await expect(service.getAuditEntry('missing', 'org1')).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('exportAuditLog', () => {
    it('returns { format: "json", data: rows } for json format', async () => {
      const rows = [{ id: 'ev1', action: 'test' }];
      prisma.auditEvent.findMany.mockResolvedValue(rows);

      const result = await service.exportAuditLog('org1', { format: 'json' });

      expect(result).toEqual({ format: 'json', data: rows });
    });

    it('returns a CSV string with correct header and one row per event', async () => {
      const rows = [
        {
          id: 'ev1',
          action: 'invoice.paid',
          targetType: 'Invoice',
          targetId: 'inv1',
          actor: { email: 'a@b.com' },
          ipAddress: '1.2.3.4',
          createdAt: new Date('2024-06-01T12:00:00.000Z'),
        },
        {
          id: 'ev2',
          action: 'user.login',
          targetType: null,
          targetId: null,
          actor: null,
          ipAddress: null,
          createdAt: new Date('2024-06-02T12:00:00.000Z'),
        },
      ];
      prisma.auditEvent.findMany.mockResolvedValue(rows);

      const result = await service.exportAuditLog('org1', { format: 'csv' });

      expect(result.format).toBe('csv');
      const lines = result.data.split('\n');
      expect(lines[0]).toBe('id,action,targetType,targetId,actorEmail,ipAddress,createdAt');
      expect(lines[1]).toBe('ev1,invoice.paid,Invoice,inv1,a@b.com,1.2.3.4,2024-06-01T12:00:00.000Z');
      // Null targetType/targetId/actorEmail/ipAddress all become empty strings (6 commas = 7 fields)
      expect(lines[2]).toBe('ev2,user.login,,,,,2024-06-02T12:00:00.000Z');
    });

    it('applies createdAt gte/lte only for provided bounds', async () => {
      prisma.auditEvent.findMany.mockResolvedValue([]);
      const from = '2024-01-01T00:00:00.000Z';
      const to = '2024-12-31T23:59:59.000Z';

      await service.exportAuditLog('org1', { from, to, format: 'json' });

      const where = prisma.auditEvent.findMany.mock.calls[0][0].where;
      expect(where.createdAt).toEqual({ gte: new Date(from), lte: new Date(to) });
    });

    it('applies only lte when only to is provided', async () => {
      prisma.auditEvent.findMany.mockResolvedValue([]);
      const to = '2024-12-31T23:59:59.000Z';

      await service.exportAuditLog('org1', { to, format: 'json' });

      const where = prisma.auditEvent.findMany.mock.calls[0][0].where;
      expect(where.createdAt).toEqual({ lte: new Date(to) });
    });
  });

  describe('getAuditStats', () => {
    it('runs both groupBy calls and returns { byTargetType, topActors }', async () => {
      const byTargetType = [{ targetType: 'Invoice', _count: { id: 3 } }];
      const byActor = [{ actorUserId: 'u1', _count: { id: 5 } }];
      prisma.auditEvent.groupBy
        .mockResolvedValueOnce(byTargetType)
        .mockResolvedValueOnce(byActor);

      const result = await service.getAuditStats('org1');

      expect(prisma.auditEvent.groupBy).toHaveBeenCalledTimes(2);
      expect(prisma.auditEvent.groupBy).toHaveBeenNthCalledWith(1, {
        by: ['targetType'],
        where: { organizationId: 'org1' },
        _count: { id: true },
      });
      expect(prisma.auditEvent.groupBy).toHaveBeenNthCalledWith(2, {
        by: ['actorUserId'],
        where: { organizationId: 'org1' },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 10,
      });
      expect(result).toEqual({ byTargetType, topActors: byActor });
    });
  });
});
