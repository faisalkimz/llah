import { Router } from 'express';
const router = Router();
router.get('/', (req,res)=>res.status(501).json({error:{code:'MODULE_NOT_IMPLEMENTED',message:'Event explorer & raw event logs is scaffolded and will be implemented in build order.'}}));
export default router;
