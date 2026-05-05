import { callGroq } from "./groq";

export async function generateAgent(task: string) {
  const prompt = `
You are a Meta-Agent Generator.

Return JSON:
{
  "name": "",
  "role": "",
  "systemPrompt": "",
  "constraints": []
}

Task: ${task}
`;

  const res = await callGroq(prompt);

  try {
    return JSON.parse(res);
  } catch {
    return { error: "Invalid JSON", raw: res };
  }
}
