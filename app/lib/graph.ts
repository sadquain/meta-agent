import { runAgent } from "./agent";
import { callGroq, streamGroq } from "./groq";

export type AgentNode = {
  id: string;
  name: string;
  systemPrompt: string;
  x?: number;
  y?: number;
};

export type Edge = {
  from: string;
  to: string;
  condition?: (state: State) => boolean;
};

type State = {
  input: string;
  memory: string[];
  current: string;
  done: boolean;
};

export type GraphLog = {
  node: string;
  input: string;
  output: string;
};

export type GraphStreamEvent =
  | { type: "graph"; nodes: AgentNode[]; edges: Edge[] }
  | { type: "node-start"; nodeId: string; input: string }
  | { type: "token"; nodeId: string; token: string }
  | { type: "node-complete"; nodeId: string; input: string; output: string }
  | { type: "edge"; from: string; to: string }
  | { type: "node-added"; node: AgentNode; from?: string; to?: string }
  | { type: "done"; final: string; logs: GraphLog[] }
  | { type: "error"; message: string };

type GraphExpansion = {
  agents?: Array<{
    id?: string;
    name?: string;
    systemPrompt?: string;
  }>;
};

export async function runGraph(nodes: AgentNode[], edges: Edge[], input: string) {
  // Add early validation
  if (!nodes.length) {
    throw new Error("Nodes array cannot be empty");
  }

  const state: State = {
    input,
    memory: [],
    current: input,
    done: false
  };

  let currentNode: AgentNode | undefined = nodes[0]; // Now guaranteed to exist

  const logs: GraphLog[] = [];

  while (!state.done && currentNode) {
    const activeNode: AgentNode = currentNode;
    // Ensure currentNode is defined and pass it properly
    const output = await runAgent(activeNode, state.current);

    logs.push({
      node: activeNode.id,
      input: state.current,
      output
    });

    state.memory.push(output);
    state.current = output;

    const nextEdge = edges.find(e =>
      e.from === activeNode.id &&
      (!e.condition || e.condition(state))
    );

    if (!nextEdge) {
      state.done = true;
      break;
    }

    const nextNode = nodes.find(n => n.id === nextEdge.to);
    
    if (!nextNode) {
      throw new Error(`Node with id "${nextEdge.to}" not found`);
    }
    
    currentNode = nextNode;
  }

  return {
    final: state.current,
    logs
  };
}

function slugifyId(value: string, fallback: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36);

  return slug || fallback;
}

function uniqueNodeId(base: string, nodes: AgentNode[]) {
  let candidate = base;
  let index = 2;

  while (nodes.some((node) => node.id === candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

function stripJsonFence(response: string) {
  return response
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
}

async function generateGraphExpansion(
  task: string,
  nodes: AgentNode[],
  maxGeneratedAgents: number,
) {
  const prompt = `
You are the Meta-Agent inside a graph runtime.
Analyze the task and propose only the missing specialist agents needed next.
Return strict JSON only:
{
  "agents": [
    {
      "id": "short-kebab-id",
      "name": "Agent name",
      "systemPrompt": "One focused system prompt"
    }
  ]
}
Safety rules:
- Create at most ${maxGeneratedAgents} agents.
- Do not create agents that already exist.
- Do not create recursive meta-agents.
- Keep prompts bounded and task-specific.

Existing agents:
${nodes.map((node) => `- ${node.id}: ${node.name}`).join("\n")}

Task:
${task}
`;

  const response = await callGroq(prompt);

  if (response.startsWith("LLM request failed")) {
    throw new Error(response);
  }

  let parsed: GraphExpansion;

  try {
    parsed = JSON.parse(stripJsonFence(response)) as GraphExpansion;
  } catch {
    throw new Error("Meta-Agent returned invalid graph JSON.");
  }

  const agents = (parsed.agents || [])
    .filter(
      (agent) =>
        agent &&
        typeof agent.name === "string" &&
        typeof agent.systemPrompt === "string",
    )
    .slice(0, maxGeneratedAgents)
    .map((agent, index) => {
      const baseId = slugifyId(agent.id || agent.name || "", `generated-${index + 1}`);

      return {
        id: uniqueNodeId(baseId, nodes),
        name: agent.name!.slice(0, 80),
        systemPrompt: agent.systemPrompt!.slice(0, 1200),
      };
    });

  return agents;
}

function makeAgentPrompt(node: AgentNode, input: string) {
  return `${node.systemPrompt}

User: ${input}`;
}

function injectGeneratedAgents(
  activeNode: AgentNode,
  generatedNodes: AgentNode[],
  nodes: AgentNode[],
  edges: Edge[],
) {
  if (!generatedNodes.length) {
    return;
  }

  const originalNext = edges.find((edge) => edge.from === activeNode.id);
  const originalNextId = originalNext?.to;

  if (originalNext) {
    const originalIndex = edges.indexOf(originalNext);
    edges.splice(originalIndex, 1);
  }

  generatedNodes.forEach((node, index) => {
    nodes.push({
      ...node,
      x: activeNode.x ? activeNode.x + 260 + index * 240 : 260 + index * 240,
      y: activeNode.y ? activeNode.y + 110 : 260,
    });
  });

  edges.push({ from: activeNode.id, to: generatedNodes[0].id });

  for (let index = 0; index < generatedNodes.length - 1; index += 1) {
    edges.push({ from: generatedNodes[index].id, to: generatedNodes[index + 1].id });
  }

  if (originalNextId) {
    edges.push({ from: generatedNodes[generatedNodes.length - 1].id, to: originalNextId });
  }
}

export async function* runGraphStream(
  initialNodes: AgentNode[],
  initialEdges: Edge[],
  input: string,
  options: {
    allowEvolution?: boolean;
    maxSteps?: number;
    maxGeneratedAgents?: number;
  } = {},
): AsyncGenerator<GraphStreamEvent> {
  const nodes = initialNodes.map((node) => ({ ...node }));
  const edges = initialEdges.map((edge) => ({ from: edge.from, to: edge.to }));
  const maxSteps = options.maxSteps ?? 8;
  const maxGeneratedAgents = options.maxGeneratedAgents ?? 3;

  if (!nodes.length) {
    throw new Error("Nodes array cannot be empty");
  }

  let currentNode = nodes[0];
  let current = input;
  let evolved = false;
  const logs: GraphLog[] = [];

  yield { type: "graph", nodes, edges };

  for (let step = 0; step < maxSteps && currentNode; step += 1) {
    const activeNode = currentNode;

    yield { type: "node-start", nodeId: activeNode.id, input: current };

    if (options.allowEvolution && !evolved && activeNode.id === "mag") {
      const generatedNodes = await generateGraphExpansion(
        current,
        nodes,
        maxGeneratedAgents,
      );

      injectGeneratedAgents(activeNode, generatedNodes, nodes, edges);

      for (const node of generatedNodes) {
        yield { type: "node-added", node, from: activeNode.id };
      }

      if (generatedNodes.length) {
        yield { type: "graph", nodes, edges };
      }

      evolved = true;
    }

    let output = "";

    for await (const token of streamGroq(makeAgentPrompt(activeNode, current))) {
      output += token;
      yield { type: "token", nodeId: activeNode.id, token };
    }

    logs.push({
      node: activeNode.id,
      input: current,
      output,
    });

    yield { type: "node-complete", nodeId: activeNode.id, input: current, output };

    current = output;

    const nextEdge = edges.find((edge) => edge.from === activeNode.id);

    if (!nextEdge) {
      yield { type: "done", final: current, logs };
      return;
    }

    const nextNode = nodes.find((node) => node.id === nextEdge.to);

    if (!nextNode) {
      throw new Error(`Node with id "${nextEdge.to}" not found`);
    }

    yield { type: "edge", from: activeNode.id, to: nextNode.id };
    currentNode = nextNode;
  }

  yield { type: "done", final: current, logs };
}
