import prisma from '../../lib/prisma.js';
import { createHmac, randomBytes } from 'node:crypto';

export async function createEndpoint(orgId, data) {
  const secret = data.secret ?? randomBytes(32).toString('hex');

  // Store the signing secret in plaintext so we can use it for HMAC signing.
  // The receiver gets the secret once (on creation) and uses it to verify
  // the X-Llah-Signature header on incoming deliveries.
  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      organizationId: orgId,
      url: data.url,
      secretHash: secret, // stored as-is; field name is legacy
      events: data.events,
      active: true,
    },
  });

  return { ...endpoint, secret };
}

export async function listEndpoints(orgId) {
  return prisma.webhookEndpoint.findMany({
    where: { organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getEndpoint(id, orgId) {
  const endpoint = await prisma.webhookEndpoint.findFirst({
    where: { id, organizationId: orgId },
  });
  if (!endpoint) {
    const err = new Error('Endpoint not found');
    err.status = 404;
    throw err;
  }
  return endpoint;
}

export async function updateEndpoint(id, orgId, data) {
  await getEndpoint(id, orgId);
  return prisma.webhookEndpoint.update({
    where: { id },
    data,
  });
}

export async function deleteEndpoint(id, orgId) {
  await getEndpoint(id, orgId);
  return prisma.webhookEndpoint.delete({ where: { id } });
}

async function sendToEndpoint(endpoint, eventType, eventId, payload, deliveryId) {
  const body = JSON.stringify({
    id: eventId,
    type: eventType,
    data: payload,
    createdAt: new Date().toISOString(),
  });
  const sig = createHmac('sha256', endpoint.secretHash).update(body).digest('hex');

  try {
    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Llah-Event': eventType,
        'X-Llah-Signature': sig,
      },
      body,
    });
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: {
        status: res.ok ? 'SUCCEEDED' : 'FAILED',
        responseStatus: res.status,
        deliveredAt: new Date(),
      },
    });
  } catch {
    await prisma.webhookDelivery.update({
      where: { id: deliveryId },
      data: { status: 'FAILED' },
    });
  }
}

export async function dispatchEvent(orgId, eventType, eventId, payload) {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      organizationId: orgId,
      active: true,
      events: { has: eventType },
    },
  });

  for (const endpoint of endpoints) {
    const delivery = await prisma.webhookDelivery.create({
      data: {
        endpointId: endpoint.id,
        eventType,
        eventId,
        status: 'PENDING',
        payload,
      },
    });
    await sendToEndpoint(endpoint, eventType, eventId, payload, delivery.id);
  }
}

export async function retryDelivery(deliveryId, orgId) {
  const delivery = await prisma.webhookDelivery.findFirst({
    where: { id: deliveryId },
    include: { endpoint: true },
  });

  if (!delivery) {
    const err = new Error('Delivery not found');
    err.status = 404;
    throw err;
  }

  if (delivery.endpoint.organizationId !== orgId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const newDelivery = await prisma.webhookDelivery.create({
    data: {
      endpointId: delivery.endpointId,
      eventType: delivery.eventType,
      eventId: delivery.eventId,
      status: 'PENDING',
      payload: delivery.payload,
    },
  });

  await sendToEndpoint(
    delivery.endpoint,
    delivery.eventType,
    delivery.eventId,
    delivery.payload,
    newDelivery.id,
  );

  return newDelivery;
}

export async function listDeliveries(orgId, filters) {
  const { endpointId, limit, offset } = filters;
  return prisma.webhookDelivery.findMany({
    where: {
      endpoint: { organizationId: orgId },
      ...(endpointId && { endpointId }),
    },
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
  });
}
