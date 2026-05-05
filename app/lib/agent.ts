import { callOllama } from "./ollama";

export async function runAgent(agent: any, input: string) {
  const prompt = `${agent.system_prompt || agent.systemPrompt}

User: ${input}`;

  return await callOllama(prompt);
}