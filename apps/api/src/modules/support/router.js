import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

// List tickets
router.get('/', async (req, res, next) => {
  try {
    const query = validators.listQuerySchema.parse(req.query);
    const data = await service.listTickets(req.organizationId, query);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// Create ticket
router.post('/', async (req, res, next) => {
  try {
    const body = validators.createTicketSchema.parse(req.body);
    const data = await service.createTicket(req.organizationId, body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

// Get a single ticket
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.ticketIdSchema.parse(req.params);
    const data = await service.getTicket(req.organizationId, id);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// Update a ticket
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = validators.ticketIdSchema.parse(req.params);
    const body = validators.updateTicketSchema.parse(req.body);
    const data = await service.updateTicket(req.organizationId, id, body);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// Delete a ticket
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.ticketIdSchema.parse(req.params);
    await service.deleteTicket(req.organizationId, id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
