import * as repository from './repository.js';

/**
 * Meter service - business logic layer
 */

/**
 * Create a new meter
 * Validates that meter key is unique within organization
 * @param {string} organizationId - Organization ID
 * @param {object} data - Meter data
 * @returns {Promise<object>} Created meter
 * @throws {Error} If meter key already exists
 */
export async function createMeter(organizationId, data) {
  // Check if meter key already exists in this organization
  const existing = await repository.findByKey(data.key, organizationId);
  
  if (existing) {
    const error = new Error(`Meter with key '${data.key}' already exists in this organization`);
    error.code = 'METER_KEY_EXISTS';
    error.statusCode = 409;
    throw error;
  }

  return repository.create(organizationId, data);
}

/**
 * List meters with pagination and search
 * @param {string} organizationId - Organization ID
 * @param {object} filters - Filter options
 * @returns {Promise<object>} Meters and pagination info
 */
export async function listMeters(organizationId, filters = {}) {
  const [meters, total] = await Promise.all([
    repository.findMany(organizationId, filters),
    repository.count(organizationId, filters),
  ]);

  return {
    meters,
    pagination: {
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    },
  };
}

/**
 * Get a meter by ID
 * @param {string} meterId - Meter ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} Meter
 * @throws {Error} If meter not found
 */
export async function getMeterById(meterId, organizationId) {
  const meter = await repository.findById(meterId, organizationId);
  
  if (!meter) {
    const error = new Error('Meter not found');
    error.code = 'METER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return meter;
}

/**
 * Get a meter by key
 * @param {string} key - Meter key
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} Meter
 * @throws {Error} If meter not found
 */
export async function getMeterByKey(key, organizationId) {
  const meter = await repository.findByKey(key, organizationId);
  
  if (!meter) {
    const error = new Error(`Meter with key '${key}' not found`);
    error.code = 'METER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return meter;
}

/**
 * Get a meter with usage and price statistics
 * @param {string} meterId - Meter ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} Meter with stats
 * @throws {Error} If meter not found
 */
export async function getMeterWithStats(meterId, organizationId) {
  const meter = await repository.findByIdWithStats(meterId, organizationId);
  
  if (!meter) {
    const error = new Error('Meter not found');
    error.code = 'METER_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return meter;
}

/**
 * Update a meter
 * Note: Cannot update key to avoid breaking existing usage events and prices
 * @param {string} meterId - Meter ID
 * @param {string} organizationId - Organization ID
 * @param {object} data - Fields to update (name, unit, aggregation)
 * @returns {Promise<object>} Updated meter
 * @throws {Error} If meter not found
 */
export async function updateMeter(meterId, organizationId, data) {
  // Verify meter exists
  await getMeterById(meterId, organizationId);

  // Note: We don't allow updating the key to maintain referential integrity
  // with existing usage events and prices
  
  return repository.update(meterId, organizationId, data);
}

/**
 * Delete a meter
 * Only allows deletion if meter has no usage events or prices
 * @param {string} meterId - Meter ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<object>} Deleted meter
 * @throws {Error} If meter not found or has usage/prices
 */
export async function deleteMeter(meterId, organizationId) {
  // Verify meter exists
  await getMeterById(meterId, organizationId);

  // Check if meter has usage events
  const hasUsageEvents = await repository.hasUsage(meterId);
  if (hasUsageEvents) {
    const error = new Error(
      'Cannot delete meter with existing usage events. Usage data would be orphaned.'
    );
    error.code = 'METER_HAS_USAGE';
    error.statusCode = 409;
    throw error;
  }

  // Check if meter is used in prices
  const hasPrices = await repository.hasPrice(meterId);
  if (hasPrices) {
    const error = new Error(
      'Cannot delete meter that is used in pricing. Remove the meter from all prices first.'
    );
    error.code = 'METER_HAS_PRICES';
    error.statusCode = 409;
    throw error;
  }

  return repository.deleteById(meterId, organizationId);
}
