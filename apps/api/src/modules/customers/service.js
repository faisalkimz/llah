import * as repository from './repository.js';

/**
 * Customer service - business logic layer
 * Handles validation, authorization, and orchestrates repository calls
 */

/**
 * Create a new customer
 * Validates duplicate external ID before creating
 */
export async function createCustomer(organizationId, data) {
  // Check for duplicate external ID if provided
  if (data.externalId) {
    const existingByExternalId = await repository.findByExternalId(
      data.externalId,
      organizationId
    );
    if (existingByExternalId) {
      throw {
        statusCode: 409,
        code: 'DUPLICATE_EXTERNAL_ID',
        message: `Customer with external ID "${data.externalId}" already exists`,
      };
    }
  }

  // Check for duplicate email if provided (warning, not blocking)
  if (data.email) {
    const existingByEmail = await repository.findByEmail(data.email, organizationId);
    if (existingByEmail) {
      // Note: We allow duplicate emails across customers as one person might have multiple accounts
      // This is just for awareness, not blocking
      console.warn(
        `Creating customer with email ${data.email} that already exists for another customer in org ${organizationId}`
      );
    }
  }

  return repository.create(organizationId, data);
}

/**
 * Get customer by ID
 * Returns 404 if not found or not in organization
 */
export async function getCustomer(customerId, organizationId) {
  const customer = await repository.findById(customerId, organizationId);
  
  if (!customer) {
    throw {
      statusCode: 404,
      code: 'CUSTOMER_NOT_FOUND',
      message: 'Customer not found',
    };
  }

  return customer;
}

/**
 * Get customer with statistics (subscription count, invoice count, etc.)
 */
export async function getCustomerWithStats(customerId, organizationId) {
  const customer = await repository.findByIdWithStats(customerId, organizationId);
  
  if (!customer) {
    throw {
      statusCode: 404,
      code: 'CUSTOMER_NOT_FOUND',
      message: 'Customer not found',
    };
  }

  return customer;
}

/**
 * List customers with pagination and search
 */
export async function listCustomers(organizationId, options = {}) {
  return repository.findMany(organizationId, options);
}

/**
 * Update customer
 * Validates duplicate external ID before updating
 */
export async function updateCustomer(customerId, organizationId, data) {
  // Check if customer exists
  const existing = await repository.findById(customerId, organizationId);
  if (!existing) {
    throw {
      statusCode: 404,
      code: 'CUSTOMER_NOT_FOUND',
      message: 'Customer not found',
    };
  }

  // Check for duplicate external ID if being updated
  if (data.externalId && data.externalId !== existing.externalId) {
    const duplicate = await repository.externalIdExists(
      data.externalId,
      organizationId,
      customerId
    );
    if (duplicate) {
      throw {
        statusCode: 409,
        code: 'DUPLICATE_EXTERNAL_ID',
        message: `Customer with external ID "${data.externalId}" already exists`,
      };
    }
  }

  return repository.update(customerId, organizationId, data);
}

/**
 * Delete customer
 * Returns 404 if not found
 */
export async function deleteCustomer(customerId, organizationId) {
  // Check if customer exists
  const existing = await repository.findById(customerId, organizationId);
  if (!existing) {
    throw {
      statusCode: 404,
      code: 'CUSTOMER_NOT_FOUND',
      message: 'Customer not found',
    };
  }

  // Check if customer has active subscriptions
  const customerWithStats = await repository.findByIdWithStats(customerId, organizationId);
  if (customerWithStats._count.subscriptions > 0) {
    throw {
      statusCode: 409,
      code: 'CUSTOMER_HAS_SUBSCRIPTIONS',
      message: 'Cannot delete customer with active subscriptions',
    };
  }

  return repository.deleteById(customerId, organizationId);
}

/**
 * Get customer count for organization
 */
export async function getCustomerCount(organizationId) {
  return repository.count(organizationId);
}

/**
 * Search customers by name or email
 */
export async function searchCustomers(organizationId, searchTerm, options = {}) {
  return repository.findMany(organizationId, {
    ...options,
    search: searchTerm,
  });
}
