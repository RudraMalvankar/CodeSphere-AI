import { Router } from 'express';
import { executeAgenticPlanController } from '../controllers/agentic-executor.controller.js';
const router = Router();

// POST /ai/execute-plan
router.post('/execute-plan', executeAgenticPlanController);

export default router;
