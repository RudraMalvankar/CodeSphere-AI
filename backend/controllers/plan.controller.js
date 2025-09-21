import { generatePlan } from '../services/plan.service.js';
import Ajv from 'ajv';
import fs from 'fs';
const planSchema = JSON.parse(fs.readFileSync(new URL('../schemas/plan.schema.json', import.meta.url)));

const ajv = new Ajv({ allErrors: true });
const validate = ajv.compile(planSchema);

export const executePlan = async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal || typeof goal !== 'string') {
      return res.status(400).json({ message: 'Missing or invalid goal' });
    }
    const plan = await generatePlan(goal);
    const valid = validate(plan);
    if (!valid) {
      return res.status(400).json({ message: 'Invalid plan', errors: validate.errors, plan });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
