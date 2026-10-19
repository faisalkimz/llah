import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../../lib/prisma.js', () => ({
  default: {
    featureFlag: {
      upsert: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import prisma from '../../lib/prisma.js';
import * as service from './service.js';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('feature-flags service', () => {
  describe('setFlag', () => {
    it('calls upsert with create/update and omits description from update when not provided', async () => {
      const flag = { id: 'f1', key: 'dark-mode', enabled: true };
      prisma.featureFlag.upsert.mockResolvedValue(flag);

      const result = await service.setFlag('dark-mode', { enabled: true });

      expect(prisma.featureFlag.upsert).toHaveBeenCalledWith({
        where: { key: 'dark-mode' },
        create: { key: 'dark-mode', enabled: true, description: undefined },
        update: { enabled: true },
      });
      expect(result).toBe(flag);
    });

    it('includes description in update when provided', async () => {
      prisma.featureFlag.upsert.mockResolvedValue({});

      await service.setFlag('new-ui', { enabled: false, description: 'New UI flag' });

      expect(prisma.featureFlag.upsert).toHaveBeenCalledWith({
        where: { key: 'new-ui' },
        create: { key: 'new-ui', enabled: false, description: 'New UI flag' },
        update: { enabled: false, description: 'New UI flag' },
      });
    });
  });

  describe('getFlag', () => {
    it('returns the result of findUnique', async () => {
      const flag = { key: 'dark-mode', enabled: true };
      prisma.featureFlag.findUnique.mockResolvedValue(flag);

      const result = await service.getFlag('dark-mode');

      expect(prisma.featureFlag.findUnique).toHaveBeenCalledWith({
        where: { key: 'dark-mode' },
      });
      expect(result).toBe(flag);
    });
  });

  describe('listFlags', () => {
    it('calls findMany with orderBy key asc', async () => {
      prisma.featureFlag.findMany.mockResolvedValue([]);

      await service.listFlags();

      expect(prisma.featureFlag.findMany).toHaveBeenCalledWith({
        orderBy: { key: 'asc' },
      });
    });
  });

  describe('deleteFlag', () => {
    it('calls delete with the correct key', async () => {
      prisma.featureFlag.delete.mockResolvedValue({});

      await service.deleteFlag('old-flag');

      expect(prisma.featureFlag.delete).toHaveBeenCalledWith({
        where: { key: 'old-flag' },
      });
    });
  });

  describe('isEnabled', () => {
    it('returns true when flag exists and is enabled', async () => {
      prisma.featureFlag.findUnique.mockResolvedValue({ key: 'feat', enabled: true });
      expect(await service.isEnabled('feat')).toBe(true);
    });

    it('returns false when flag exists and is disabled', async () => {
      prisma.featureFlag.findUnique.mockResolvedValue({ key: 'feat', enabled: false });
      expect(await service.isEnabled('feat')).toBe(false);
    });

    it('returns false when flag does not exist', async () => {
      prisma.featureFlag.findUnique.mockResolvedValue(null);
      expect(await service.isEnabled('missing')).toBe(false);
    });
  });
});
