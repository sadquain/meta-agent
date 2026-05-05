import { runAgent } from "./agent";

type Node = {
  id: string;
  name: string;
  systemPrompt: string;
};

type Edge = {
  from: string;
  to: string;
  condition?: (state: any) => boolean;
};

type State = {
  input: string;
  memory: any[];
  current: string;
  done: boolean;
};

export async function runGraph(nodes: Node[], edges: Edge[], input: string) {
  // Add early validation
  if (!nodes.length) {
    throw new Error("Nodes array cannot be empty");
  }

  let state: State = {
    input,
    memory: [],
    current: input,
    done: false
  };

  let currentNode: Node = nodes[0]; // Now guaranteed to exist

  const logs: any[] = [];

  while (!state.done && currentNode) {
    // Ensure currentNode is defined and pass it properly
    const output = await runAgent(currentNode, state.current);

    logs.push({
      node: currentNode.id,
      input: state.current,
      output
    });

    state.memory.push(output);
    state.current = output;

    const nextEdge = edges.find(e =>
      e.from === currentNode.id &&
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