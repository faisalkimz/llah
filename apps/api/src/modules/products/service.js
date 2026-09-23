import * as repository from './repository.js';

export async function createProduct(organizationId, data) {
  return repository.create(organizationId, data);
}

export async function listProducts(organizationId, filters = {}) {
  const [products, total] = await Promise.all([
    repository.findMany(organizationId, filters),
    repository.count(organizationId, filters),
  ]);

  return {
    products,
    pagination: {
      total,
      limit: filters.limit || 20,
      offset: filters.offset || 0,
    },
  };
}

export async function getProductById(productId, organizationId) {
  const product = await repository.findById(productId, organizationId);

  if (!product) {
    const error = new Error('Product not found');
    error.code = 'PRODUCT_NOT_FOUND';
    error.statusCode = 404;
    throw error;
  }

  return product;
}

export async function updateProduct(productId, organizationId, data) {
  await getProductById(productId, organizationId);
  return repository.update(productId, organizationId, data);
}

export async function deleteProduct(productId, organizationId) {
  await getProductById(productId, organizationId);
  return repository.deleteById(productId, organizationId);
}
