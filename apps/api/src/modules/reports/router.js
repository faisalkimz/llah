import { Router } from 'express';
import { requireOrg } from '../../middleware/require-org.js';
import * as service from './service.js';
import * as validators from './validators.js';

const router = Router();

router.use(requireOrg);

router.get('/', async (req, res, next) => {
  try {
    const data = await service.listReports(req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const body = validators.createReportSchema.parse(req.body);
    const data = await service.createReport(req.organizationId, body);
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const { id } = validators.reportIdSchema.parse(req.params);
    const data = await service.getReport(id, req.organizationId);
    res.json({ data });
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = validators.reportIdSchema.parse(req.params);
    await service.deleteReport(id, req.organizationId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
