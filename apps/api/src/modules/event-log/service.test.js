import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma.js', () => ({
  default: {
    auditEvent: {
      create: vi.fn(),
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

describe('event-log service', () => {
  describe('logEvent', () => {
    it('calls auditEvent.create with correct fields and returns the result', async () => {
      const created = {
        id: 'ev1',
        organizationId: 'org1',
        actorUserId: 'user1',
        action: 'invoice.created',
        targetType: 'Invoice',
        targetId: 'inv1',
        metadata: { amount: 100 },
        createdAt: new Date(),
      };
      prisma.auditEvent.create.mockResolvedValue(created);

      const result = await service.logEvent('org1', 'user1', {
        action: 'invoice.created',
        targetType: 'Invoice',
        targetId: 'inv1',
        metadata: { amount: 100 },
      });

      expect(prisma.auditEvent.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org1',
          actorUserId: 'user1',
          action: 'invoice.created',
          targetType: 'Invoice',
          targetId: 'inv1',
          metadata: { amount: 100 },
        },
      });
      expect(result).toBe(created);
    });

    it('passes undefined for optional fields when omitted', async () => {
      prisma.auditEvent.create.mockResolvedValue({});

      await service.logEvent('org1', undefined, { action: 'user.login' });

      expect(prisma.auditEvent.create).toHaveBeenCalledWith({
        data: {
          organizationId: 'org1',
          actorUserId: undefined,
          action: 'user.login',
          targetType: undefined,
          targetId: undefined,
          metadata: undefined,
        },
      });
    });
  });

  describe('listEvents', () => {
    it('builds where clause from all provided filters', async () => {
      prisma.auditEvent.findMany.mockResolvedValue([]);
      const from = '2024-01-01T00:00:00.000Z';
      const to = '2024-12-31T23:59:59.000Z';

      await service.listEvents('org1', {
        action: 'invoice.paid',
        resourceType: 'Invoice',
        resourceId: 'inv1',
        actorId: 'user1',
        from,
        to,
        limit: 10,
        offset: 5,
      });

      expect(prisma.auditEvent.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org1',
          action: 'invoice.paid',
          targetType: 'Invoice',
          targetId: 'inv1',
          actorUserId: 'user1',
          createdAt: {
            gte: new Date(from),
            lte: new Date(to),
          },
        },
        take: 10,
        skip: 5,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('omits filter fields when not provided', async () => {
      prisma.auditEvent.findMany.mockResolvedValue([]);

      await service.listEvents('org1', { limit: 20, offset: 0 });

      const call = prisma.auditEvent.findMany.mock.calls[0][0];
      expect(call.where).not.toHaveProperty('action');
      expect(call.where).not.toHaveProperty('targetType');
      expect(call.where).not.toHaveProperty('targetId');
      expect(call.where).not.toHaveProperty('actorUserId');
      expect(call.where).not.toHaveProperty('createdAt');
      expect(call.orderBy).toEqual({ createdAt: 'desc' });
    });

    it('applies only createdAt.gte when only from is provided', async () => {
      prisma.auditEvent.findMany.mockResolvedValue([]);
      const from = '2024-06-01T00:00:00.000Z';

      await service.listEvents('org1', { from, limit: 20, offset: 0 });

      const call = prisma.auditEvent.findMany.mock.calls[0][0];
      expect(call.where.createdAt).toEqual({ gte: new Date(from) });
    });
  });

  describe('getEvent', () => {
    it('returns the event when found', async () => {
      const event = { id: 'ev1', organizationId: 'org1', action: 'test' };
      prisma.auditEvent.findFirst.mockResolvedValue(event);

      const result = await service.getEvent('ev1', 'org1');

      expect(prisma.auditEvent.findFirst).toHaveBeenCalledWith({
        where: { id: 'ev1', organizationId: 'org1' },
      });
      expect(result).toBe(event);
    });

    it('throws a 404 error when event is not found', async () => {
      prisma.auditEvent.findFirst.mockResolvedValue(null);

      await expect(service.getEvent('missing', 'org1')).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('getEventStats', () => {
    it('calls groupBy with correct args', async () => {
      const from = '2024-01-01T00:00:00.000Z';
      const to = '2024-12-31T23:59:59.000Z';
      const stats = [{ action: 'invoice.paid', _count: { id: 5 } }];
      prisma.auditEvent.groupBy.mockResolvedValue(stats);

      const result = await service.getEventStats('org1', { from, to });

      expect(prisma.auditEvent.groupBy).toHaveBeenCalledWith({
        by: ['action'],
        where: {
          organizationId: 'org1',
          createdAt: { gte: new Date(from), lte: new Date(to) },
        },
        _count: { id: true },
      });
      expect(result).toBe(stats);
    });
  });
});
