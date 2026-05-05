import { callGroq } from "./groq";

export type AgentPrompt = {
  system_prompt?: string;
  systemPrompt?: string;
};

export async function runAgent(agent: AgentPrompt, input: string) {
  const prompt = `${agent.system_prompt || agent.systemPrompt}

User: ${input}`;

  return await callGroq(prompt);
}
