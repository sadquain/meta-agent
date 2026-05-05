import { type AgentPrompt, runAgent } from "./agent";

type OrchestrationAgent = AgentPrompt & {
  name?: string;
};

type OrchestrationLog = {
  agent: string;
  input: string;
  output: string;
};

export async function runOrchestration(
  agents: OrchestrationAgent[],
  input: string,
) {
  let context = input;

  const logs: OrchestrationLog[] = [];

  for (const agent of agents) {
    const output = await runAgent(agent, context);

    logs.push({
      agent: agent.name || "agent",
      input: context,
      output
    });

    // 🔁 feed output into next agent
    context = output;
  }

  return {
    final: context,
    logs
  };
}
