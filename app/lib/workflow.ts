import { runAgent } from "./agent";

export async function runWorkflow(agents: any[], input: string) {
  let current = input;

  for (const agent of agents) {
    current = await runAgent(agent, current);
  }

  return current;
}