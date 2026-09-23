import { Router } from 'express';
import * as service from './service.js';
import * as validators from './validators.js';
import { success, error as errorResponse } from '../../lib/api-response.js';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.createInvoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const invoice = await service.createInvoice(organizationId, value);
    return res.status(201).json(success(invoice));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.get('/', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.listInvoicesSchema.validate(req.query);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const invoices = await service.listInvoices(organizationId, value);
    return res.json(success(invoices));
  } catch (err) {
    return res.status(500).json(errorResponse(err.message));
  }
});

router.get('/:invoiceId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const invoice = await service.getInvoice(req.params.invoiceId, organizationId);
    return res.json(success(invoice));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.put('/:invoiceId', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const { error, value } = validators.updateInvoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json(errorResponse(error.details[0].message));
    }

    const invoice = await service.updateInvoice(req.params.invoiceId, organizationId, value);
    return res.json(success(invoice));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

router.post('/:invoiceId/finalize', async (req, res) => {
  try {
    const organizationId = req.headers['x-organization-id'];
    if (!organizationId) {
      return res.status(400).json(errorResponse('x-organization-id header is required'));
    }

    const invoice = await service.finalizeInvoice(req.params.invoiceId, organizationId);
    return res.json(success(invoice));
  } catch (err) {
    return res.status(err.status || 500).json(errorResponse(err.message));
  }
});

export default router;
