import * as repository from './repository.js';

export async function createPrice(organizationId, data) {
  return repository.create(organizationId, data);
}

export async function listPrices(organizationId, filters = {}) {
  const [prices, total] = await Promise.all([
    repository.findMany(organizationId, filters),
    repository.count(organizationId, filters),
  ]);

  return {
    prices,
    pagination: {
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    },
  };
}

export async function getPriceById(priceId, organizationId) {
  const price = await repository.findById(priceId, organizationId);

  if (!price) {
    const error = new Error('Price not found');
    error.code = 'PRICE_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return price;
}

export async function updatePrice(priceId, organizationId, data) {
  await getPriceById(priceId, organizationId);
  return repository.update(priceId, organizationId, data);
}

export async function deletePrice(priceId, organizationId) {
  await getPriceById(priceId, organizationId);
  return repository.deleteById(priceId, organizationId);
}
