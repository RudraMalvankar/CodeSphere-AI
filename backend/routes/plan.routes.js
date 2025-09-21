import { Router } from 'express';
import { executePlan } from '../controllers/plan.controller.js';
const router = Router();

router.post('/execute', executePlan);

export default router;
