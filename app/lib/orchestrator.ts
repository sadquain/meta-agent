import { runAgent } from "./agent";

export async function runOrchestration(agents: any[], input: string) {
  let context = input;

  const logs: any[] = [];

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