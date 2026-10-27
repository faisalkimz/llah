import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';
import { generateInvoiceHtml } from './pdf.js';

const router = Router();
router.use(requireOrg);

// PDF export — returns printable HTML
router.get('/:invoiceId/pdf', async (req, res) => {
  try {
    const html = await generateInvoiceHtml(req.params.invoiceId, req.organizationId);
    res.setHeader('Content-Type', 'text/html');
    return res.send(html);
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.post('/', async (req, res) => {
  try {
    const result = validators.createInvoiceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const invoice = await service.createInvoice(req.organizationId, result.data);
    return res.status(201).json({ data: invoice });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = validators.listInvoicesSchema.safeParse(req.query);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const invoices = await service.listInvoices(req.organizationId, result.data);
    return res.json({ data: invoices });
  } catch (err) {
    return res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

router.get('/:invoiceId', async (req, res) => {
  try {
    const invoice = await service.getInvoice(req.params.invoiceId, req.organizationId);
    return res.json({ data: invoice });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: 'INTERNAL_ERROR', message: err.message } });
  }
});

// Only allow editing DRAFT invoices; finalized invoices are immutable
router.put('/:invoiceId', async (req, res) => {
  try {
    const result = validators.updateInvoiceSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: result.error.errors[0].message } });
    }
    const invoice = await service.updateInvoice(req.params.invoiceId, req.organizationId, result.data);
    return res.json({ data: invoice });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: err.status === 422 ? 'INVALID_STATE' : 'INTERNAL_ERROR', message: err.message } });
  }
});

// DRAFT → OPEN
router.post('/:invoiceId/finalize', async (req, res) => {
  try {
    const invoice = await service.finalizeInvoice(req.params.invoiceId, req.organizationId);
    return res.json({ data: invoice });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: err.status === 422 ? 'INVALID_STATE' : 'INTERNAL_ERROR', message: err.message } });
  }
});

// OPEN → VOID
router.post('/:invoiceId/void', async (req, res) => {
  try {
    const invoice = await service.voidInvoice(req.params.invoiceId, req.organizationId);
    return res.json({ data: invoice });
  } catch (err) {
    return res.status(err.status || 500).json({ error: { code: err.status === 422 ? 'INVALID_STATE' : 'INTERNAL_ERROR', message: err.message } });
  }
});

export default router;
