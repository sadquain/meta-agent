import { runWorkflow } from "../../lib/workflow";

export async function POST(req: Request) {
  const { agents, input } = await req.json();

  const output = await runWorkflow(agents, input);

  return Response.json({ output });
}