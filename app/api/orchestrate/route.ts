import { runOrchestration } from "../../lib/orchestrator";

export async function POST(req: Request) {
  const { agents, input } = await req.json();

  const result = await runOrchestration(agents, input);

  return Response.json(result);
}