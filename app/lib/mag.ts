import { callGroq } from "./groq";

export type GeneratedAgent = {
  name: string;
  role: string;
  systemPrompt: string;
  constraints: string[];
};

function parseAgentResponse(response: string): GeneratedAgent {
  const cleaned = response
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Groq returned invalid JSON.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("name" in parsed) ||
    !("role" in parsed) ||
    !("systemPrompt" in parsed) ||
    !("constraints" in parsed)
  ) {
    throw new Error("Groq returned an incomplete agent definition.");
  }

  const agent = parsed as Record<string, unknown>;

  if (
    typeof agent.name !== "string" ||
    typeof agent.role !== "string" ||
    typeof agent.systemPrompt !== "string" ||
    !Array.isArray(agent.constraints) ||
    !agent.constraints.every((constraint) => typeof constraint === "string")
  ) {
    throw new Error("Groq returned an invalid agent definition.");
  }

  return {
    name: agent.name,
    role: agent.role,
    systemPrompt: agent.systemPrompt,
    constraints: agent.constraints,
  };
}

export async function generateAgent(task: string): Promise<GeneratedAgent> {
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

  if (res.startsWith("LLM request failed")) {
    throw new Error(res);
  }

  return parseAgentResponse(res);
}
