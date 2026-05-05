import { runAgent } from "./agent";

type AgentNode = {
  id: string;
  name: string;
  systemPrompt: string;
};

type Edge = {
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

type GraphLog = {
  node: string;
  input: string;
  output: string;
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
