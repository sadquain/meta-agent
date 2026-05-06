import { callGroq } from "./groq";

export type GeneratedAgent = {
  name: string;
  role: string;
  systemPrompt: string;
  constraints: string[];
};

function parseAgentResponse(response: string): GeneratedAgent {
  const cleaned = extractJsonObject(response)
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

function extractJsonObject(response: string) {
  const trimmed = response.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const firstBrace = trimmed.indexOf("{");

  if (firstBrace === -1) {
    return trimmed;
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = firstBrace; index < trimmed.length; index += 1) {
    const char = trimmed[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\") {
      escaped = true;
      continue;
    }

    if (char === "\"") {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth += 1;
    }

    if (char === "}") {
      depth -= 1;

      if (depth === 0) {
        return trimmed.slice(firstBrace, index + 1);
      }
    }
  }

  return trimmed;
}

export async function generateAgent(task: string): Promise<GeneratedAgent> {
  const prompt = `
You are a Meta-Agent Generator.

Return only valid JSON. Do not include markdown, prose, or code fences.
The JSON object must match this exact shape:
{
  "name": "",
  "role": "",
  "systemPrompt": "",
  "constraints": []
}

Task: ${task}
`;

  const res = await callGroq(prompt, { jsonMode: true });

  if (res.startsWith("LLM request failed")) {
    throw new Error(res);
  }

  return parseAgentResponse(res);
}
