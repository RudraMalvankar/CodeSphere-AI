import { executeAgenticPlan } from '../services/agentic-executor.service.js';
import Ajv from 'ajv';
import fs from 'fs';
const planSchema = JSON.parse(fs.readFileSync(new URL('../schemas/plan.schema.json', import.meta.url)));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(planSchema);

// POST /ai/execute-plan { plan, projectRoot }
export const executeAgenticPlanController = async (req, res) => {
  try {
    const { plan, projectRoot } = req.body;
    if (!plan || typeof plan !== 'object') {
      return res.status(400).json({ message: 'Missing or invalid plan' });
    }
    if (!projectRoot || typeof projectRoot !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid projectRoot' });
    }
    const valid = validate(plan);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid plan', errors: validate.errors, plan });
    }
    const results = await executeAgenticPlan(plan, projectRoot);
    res.json({ results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
