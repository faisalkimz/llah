import * as repository from './repository.js';

/**
 * Usage event service - idempotent ingestion
 */

export async function ingestEvent(organizationId, data) {
  // Check idempotency - if event with this key exists, return it
  const existing = await repository.findByIdempotencyKey(
    organizationId,
    data.idempotencyKey
  );

  if (existing) {
    return { event: existing, wasCreated: false };
  }

  // Create new event
  const event = await repository.create(organizationId, data);
  return { event, wasCreated: true };
}

export async function listEvents(organizationId, filters = {}) {
  const [events, total] = await Promise.all([
    repository.findMany(organizationId, filters),
    repository.count(organizationId, filters),
  ]);

  return {
    events,
    pagination: {
      total,
      limit: filters.limit || 100,
      offset: filters.offset || 0,
    },
  };
}

export async function getEventById(eventId, organizationId) {
  const event = await repository.findById(eventId, organizationId);

  if (!event) {
    const error = new Error('Usage event not found');
    error.code = 'EVENT_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return event;
}
