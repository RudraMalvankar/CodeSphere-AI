import fs from 'fs/promises';
import path from 'path';

// Helper: ensure directory exists
async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

// Execute a single plan step
async function executeStep(step, projectRoot) {
  switch (step.action) {
    case 'createFile': {
      const filePath = path.join(projectRoot, step.path);
      await ensureDir(filePath);
      await fs.writeFile(filePath, step.contents || '', 'utf-8');
      return { status: 'ok', action: 'createFile', path: step.path };
    }
    case 'updateFile': {
      const filePath = path.join(projectRoot, step.path);
      await ensureDir(filePath);
      await fs.writeFile(filePath, step.contents || '', 'utf-8');
      return { status: 'ok', action: 'updateFile', path: step.path };
    }
    case 'updatePackageJson': {
      const filePath = path.join(projectRoot, 'package.json');
      await fs.writeFile(filePath, step.contents || '', 'utf-8');
      return { status: 'ok', action: 'updatePackageJson' };
    }
    case 'runCommand': {
      // For security, only allow npm/yarn/pnpm commands
      const allowed = /^(npm|yarn|pnpm)\s/;
      if (!step.command || !allowed.test(step.command)) {
        return { status: 'error', action: 'runCommand', error: 'Command not allowed' };
      }
      // Use child_process to run command
      const { exec } = await import('child_process');
      return new Promise((resolve) => {
        exec(step.command, { cwd: projectRoot }, (err, stdout, stderr) => {
          if (err) {
            resolve({ status: 'error', action: 'runCommand', error: stderr || err.message });
          } else {
            resolve({ status: 'ok', action: 'runCommand', output: stdout });
          }
        });
      });
    }
    default:
      return { status: 'skipped', action: step.action };
  }
}

// Main executor
export async function executeAgenticPlan(plan, projectRoot) {
  if (!plan || !Array.isArray(plan.steps)) {
    throw new Error('Invalid plan');
  }
  const results = [];
  for (const step of plan.steps) {
    try {
      const result = await executeStep(step, projectRoot);
      results.push(result);
    } catch (err) {
      results.push({ status: 'error', action: step.action, error: err.message });
    }
  }
  return results;
}
