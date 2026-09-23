import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

/**
 * All routes require authentication
 */
router.use(requireAuth);

/**
 * POST /customers
 * Create a new customer in the organization
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const data = validators.createCustomerSchema.parse(req.body);
    
    // Get organization from header
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    const customer = await service.createCustomer(organizationId, data);
    
    res.status(201).json({ data: customer });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /customers
 * List customers with pagination and search
 */
router.get('/', async (req, res, next) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    // Validate query parameters
    const params = validators.listCustomersQuerySchema.parse(req.query);
    
    const result = await service.listCustomers(organizationId, params);
    
    res.json({ data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /customers/:id
 * Get a specific customer by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.customerIdSchema.parse(req.params);
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    const customer = await service.getCustomerWithStats(id, organizationId);
    
    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /customers/:id
 * Update a customer
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = validators.customerIdSchema.parse(req.params);
    const data = validators.updateCustomerSchema.parse(req.body);
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    const customer = await service.updateCustomer(id, organizationId, data);
    
    res.json({ data: customer });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /customers/:id
 * Delete a customer
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.customerIdSchema.parse(req.params);
    const organizationId = req.headers['x-organization-id'];
    
    if (!organizationId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_ORGANIZATION',
          message: 'x-organization-id header is required',
        },
      });
    }
    
    await service.deleteCustomer(id, organizationId);
    
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;

