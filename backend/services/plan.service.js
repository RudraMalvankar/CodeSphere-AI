import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
  generationConfig: { responseMimeType: 'application/json' },
  systemInstruction: `You are an expert AI software agent. Given a user goal, break it down into a step-by-step JSON plan. Each step must be an object with an 'action' (createFile, updateFile, updatePackageJson, runCommand, etc), and relevant parameters. Do not execute, only plan. Example:
{
  "goal": "create a React app with a login page",
  "steps": [
    { "action": "createFile", "path": "src/App.jsx", "contents": "..." },
    { "action": "createFile", "path": "src/Login.jsx", "contents": "..." },
    { "action": "updatePackageJson", "contents": "..." },
    { "action": "runCommand", "command": "npm install" }
  ]
}`
});

export async function generatePlan(goal) {
  const prompt = `Goal: ${goal}\nReturn only the JSON plan.`;
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('AI did not return valid JSON: ' + text);
  }
}
