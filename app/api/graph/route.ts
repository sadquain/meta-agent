import { runGraph } from "../../lib/graph";

export async function POST(req: Request) {
  const { input } = await req.json();

  const nodes = [
    {
      id: "planner",
      name: "Planner",
      systemPrompt: "Break task into steps."
    },
    {
      id: "executor",
      name: "Executor",
      systemPrompt: "Execute steps carefully."
    }
  ];

  const edges = [
    { from: "planner", to: "executor" },
    // critic ends flow
  ];

  const result = await runGraph(nodes, edges, input);

  return Response.json(result);
}