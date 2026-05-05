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
    },
    {
      id: "critic",
      name: "Critic",
      systemPrompt: "Improve and refine output."
    }
  ];

  const edges = [
    { from: "planner", to: "executor" },
    { from: "executor", to: "critic" }
    // critic ends flow
  ];

  const result = await runGraph(nodes, edges, input);

  return Response.json(result);
}