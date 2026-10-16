import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

// Endpoints
router.get('/endpoints', async (req, res, next) => {
  try {
    const endpoints = await service.listEndpoints(req.organizationId);
    res.json({ data: endpoints });
  } catch (error) {
    next(error);
  }
});

router.post('/endpoints', async (req, res, next) => {
  try {
    const data = validators.createEndpointSchema.parse(req.body);
    const endpoint = await service.createEndpoint(req.organizationId, data);
    res.status(201).json({ data: endpoint });
  } catch (error) {
    next(error);
  }
});

router.get('/endpoints/:id', async (req, res, next) => {
  try {
    const { id } = validators.endpointIdSchema.parse(req.params);
    const endpoint = await service.getEndpoint(id, req.organizationId);
    res.json({ data: endpoint });
  } catch (error) {
    next(error);
  }
});

router.patch('/endpoints/:id', async (req, res, next) => {
  try {
    const { id } = validators.endpointIdSchema.parse(req.params);
    const data = validators.updateEndpointSchema.parse(req.body);
    const endpoint = await service.updateEndpoint(id, req.organizationId, data);
    res.json({ data: endpoint });
  } catch (error) {
    next(error);
  }
});

router.delete('/endpoints/:id', async (req, res, next) => {
  try {
    const { id } = validators.endpointIdSchema.parse(req.params);
    await service.deleteEndpoint(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Deliveries
router.get('/deliveries', async (req, res, next) => {
  try {
    const params = validators.listDeliveriesQuerySchema.parse(req.query);
    const deliveries = await service.listDeliveries(req.organizationId, params);
    res.json({ data: deliveries });
  } catch (error) {
    next(error);
  }
});

router.post('/deliveries/:id/retry', async (req, res, next) => {
  try {
    const { id } = validators.deliveryIdSchema.parse(req.params);
    const delivery = await service.retryDelivery(id, req.organizationId);
    res.json({ data: delivery });
  } catch (error) {
    next(error);
  }
});

export default router;
