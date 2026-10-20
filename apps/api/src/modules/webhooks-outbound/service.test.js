import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma.js', () => ({
  default: {
    webhookEndpoint: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    webhookDelivery: {
      create: vi.fn(),
      update: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import prisma from '../../lib/prisma.js';
import * as service from './service.js';

let fetchMock;

beforeEach(() => {
  vi.clearAllMocks();
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

describe('webhooks-outbound service', () => {
  describe('createEndpoint', () => {
    it('generates a 64-char hex secret when none provided and stores it as the signing key', async () => {
      const created = {
        id: 'ep1',
        organizationId: 'org1',
        url: 'https://example.com/hook',
        events: ['invoice.created'],
        active: true,
      };
      prisma.webhookEndpoint.create.mockResolvedValue(created);

      const result = await service.createEndpoint('org1', {
        url: 'https://example.com/hook',
        events: ['invoice.created'],
      });

      expect(result.secret).toMatch(/^[0-9a-f]{64}$/);

      const createCall = prisma.webhookEndpoint.create.mock.calls[0][0];
      // Plaintext secret is stored so it can be used for HMAC signing later
      expect(createCall.data.secretHash).toBe(result.secret);
      expect(createCall.data).toEqual({
        organizationId: 'org1',
        url: 'https://example.com/hook',
        secretHash: result.secret,
        events: ['invoice.created'],
        active: true,
      });
    });

    it('uses provided secret and stores it as the signing key', async () => {
      prisma.webhookEndpoint.create.mockResolvedValue({ id: 'ep1' });

      const result = await service.createEndpoint('org1', {
        url: 'https://example.com/hook',
        events: ['invoice.paid'],
        secret: 'my-secret',
      });

      expect(result.secret).toBe('my-secret');
      expect(prisma.webhookEndpoint.create.mock.calls[0][0].data.secretHash).toBe('my-secret');
    });
  });

  describe('getEndpoint', () => {
    it('throws 404 when endpoint not found', async () => {
      prisma.webhookEndpoint.findFirst.mockResolvedValue(null);
      await expect(service.getEndpoint('missing', 'org1')).rejects.toMatchObject({
        status: 404,
      });
    });
  });

  describe('updateEndpoint', () => {
    it('calls getEndpoint first then webhookEndpoint.update', async () => {
      const existing = { id: 'ep1', organizationId: 'org1' };
      prisma.webhookEndpoint.findFirst.mockResolvedValue(existing);
      prisma.webhookEndpoint.update.mockResolvedValue({ ...existing, active: false });

      await service.updateEndpoint('ep1', 'org1', { active: false });

      expect(prisma.webhookEndpoint.findFirst).toHaveBeenCalledWith({
        where: { id: 'ep1', organizationId: 'org1' },
      });
      expect(prisma.webhookEndpoint.update).toHaveBeenCalledWith({
        where: { id: 'ep1' },
        data: { active: false },
      });
    });
  });

  describe('dispatchEvent', () => {
    it('queries subscribed endpoints, creates pending delivery, and marks SUCCEEDED on 2xx', async () => {
      const endpoint = {
        id: 'ep1',
        url: 'https://example.com/hook',
        secretHash: 'hash',
        active: true,
        events: ['invoice.created'],
      };
      prisma.webhookEndpoint.findMany.mockResolvedValue([endpoint]);
      prisma.webhookDelivery.create.mockResolvedValue({ id: 'del1' });
      const response = { ok: true, status: 200 };
      fetchMock.mockResolvedValue(response);

      await service.dispatchEvent('org1', 'invoice.created', 'evt1', { id: 'inv1' });

      expect(prisma.webhookEndpoint.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org1',
          active: true,
          events: { has: 'invoice.created' },
        },
      });
      expect(prisma.webhookDelivery.create).toHaveBeenCalledWith({
        data: {
          endpointId: 'ep1',
          eventType: 'invoice.created',
          eventId: 'evt1',
          status: 'PENDING',
          payload: { id: 'inv1' },
        },
      });
      expect(fetchMock).toHaveBeenCalled();
      expect(prisma.webhookDelivery.update).toHaveBeenCalledWith({
        where: { id: 'del1' },
        data: {
          status: 'SUCCEEDED',
          responseStatus: 200,
          deliveredAt: expect.any(Date),
        },
      });
    });

    it('marks delivery FAILED when fetch rejects', async () => {
      const endpoint = {
        id: 'ep1',
        url: 'https://example.com/hook',
        secretHash: 'hash',
        active: true,
        events: ['invoice.created'],
      };
      prisma.webhookEndpoint.findMany.mockResolvedValue([endpoint]);
      prisma.webhookDelivery.create.mockResolvedValue({ id: 'del1' });
      fetchMock.mockRejectedValue(new Error('network down'));

      await service.dispatchEvent('org1', 'invoice.created', 'evt1', {});

      expect(prisma.webhookDelivery.update).toHaveBeenCalledWith({
        where: { id: 'del1' },
        data: { status: 'FAILED' },
      });
    });
  });

  describe('retryDelivery', () => {
    it('throws 404 when delivery is missing', async () => {
      prisma.webhookDelivery.findFirst.mockResolvedValue(null);
      await expect(service.retryDelivery('missing', 'org1')).rejects.toMatchObject({
        status: 404,
      });
    });

    it('throws 403 when endpoint belongs to a different org', async () => {
      prisma.webhookDelivery.findFirst.mockResolvedValue({
        id: 'del1',
        endpointId: 'ep1',
        eventType: 'invoice.created',
        eventId: 'evt1',
        payload: {},
        endpoint: { id: 'ep1', organizationId: 'other-org' },
      });
      await expect(service.retryDelivery('del1', 'org1')).rejects.toMatchObject({
        status: 403,
      });
    });

    it('creates a new delivery and re-sends for an owned delivery', async () => {
      const delivery = {
        id: 'del1',
        endpointId: 'ep1',
        eventType: 'invoice.created',
        eventId: 'evt1',
        payload: { id: 'inv1' },
        endpoint: { id: 'ep1', organizationId: 'org1', url: 'https://example.com/hook', secretHash: 'hash' },
      };
      prisma.webhookDelivery.findFirst.mockResolvedValue(delivery);
      const newDelivery = { id: 'del2' };
      prisma.webhookDelivery.create.mockResolvedValue(newDelivery);
      fetchMock.mockResolvedValue({ ok: true, status: 200 });

      const result = await service.retryDelivery('del1', 'org1');

      expect(result).toBe(newDelivery);
      expect(prisma.webhookDelivery.create).toHaveBeenCalledWith({
        data: {
          endpointId: 'ep1',
          eventType: 'invoice.created',
          eventId: 'evt1',
          status: 'PENDING',
          payload: { id: 'inv1' },
        },
      });
      expect(fetchMock).toHaveBeenCalled();
    });
  });

  describe('listDeliveries', () => {
    it('scopes by endpoint.organizationId with optional endpointId, take/skip, orderBy desc', async () => {
      prisma.webhookDelivery.findMany.mockResolvedValue([]);

      await service.listDeliveries('org1', { endpointId: 'ep1', limit: 25, offset: 5 });

      expect(prisma.webhookDelivery.findMany).toHaveBeenCalledWith({
        where: {
          endpoint: { organizationId: 'org1' },
          endpointId: 'ep1',
        },
        take: 25,
        skip: 5,
        orderBy: { createdAt: 'desc' },
      });
    });

    it('omits endpointId when not provided', async () => {
      prisma.webhookDelivery.findMany.mockResolvedValue([]);

      await service.listDeliveries('org1', { limit: 20, offset: 0 });

      const call = prisma.webhookDelivery.findMany.mock.calls[0][0];
      expect(call.where).toEqual({ endpoint: { organizationId: 'org1' } });
      expect(call.orderBy).toEqual({ createdAt: 'desc' });
    });
  });
});
