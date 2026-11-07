import { ServiceUnavailableException } from '@nestjs/common';
import { HealthController } from './health.controller.js';
import { PrismaService } from '../prisma/prisma.service.js';

function controllerWith(queryRaw: () => Promise<unknown>): HealthController {
  const prisma = { $queryRaw: queryRaw } as unknown as PrismaService;
  return new HealthController(prisma);
}

describe('HealthController', () => {
  it('returns ok when the database responds', async () => {
    const controller = controllerWith(vi.fn().mockResolvedValue([{ '?column?': 1 }]));
    await expect(controller.check()).resolves.toEqual({ status: 'ok' });
  });

  it('throws service unavailable when the database fails', async () => {
    const controller = controllerWith(vi.fn().mockRejectedValue(new Error('down')));
    await expect(controller.check()).rejects.toBeInstanceOf(
      ServiceUnavailableException,
    );
  });
});
