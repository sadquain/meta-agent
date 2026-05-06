import { runGraphStream, type AgentNode, type Edge } from "../../../lib/graph";

export const maxDuration = 60;

type StreamRequestBody = {
  input?: unknown;
  nodes?: unknown;
  edges?: unknown;
  allowEvolution?: unknown;
};

function isAgentNode(node: unknown): node is AgentNode {
  if (!node || typeof node !== "object") {
    return false;
  }

  const candidate = node as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.systemPrompt === "string"
  );
}

function isEdge(edge: unknown): edge is Edge {
  if (!edge || typeof edge !== "object") {
    return false;
  }

  const candidate = edge as Record<string, unknown>;

  return typeof candidate.from === "string" && typeof candidate.to === "string";
}

function encodeEvent(payload: unknown) {
  return `data: ${JSON.stringify(payload)}\n\n`;
}

export async function POST(req: Request) {
  const body = (await req.json()) as StreamRequestBody;

  if (typeof body.input !== "string" || !body.input.trim()) {
    return Response.json({ error: "A non-empty input is required." }, { status: 400 });
  }

  if (!Array.isArray(body.nodes) || !body.nodes.every(isAgentNode)) {
    return Response.json({ error: "Valid graph nodes are required." }, { status: 400 });
  }

  if (!Array.isArray(body.edges) || !body.edges.every(isEdge)) {
    return Response.json({ error: "Valid graph edges are required." }, { status: 400 });
  }

  const input = body.input.trim();
  const nodes = body.nodes;
  const edges = body.edges;

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      try {
        for await (const event of runGraphStream(
          nodes,
          edges,
          input,
          {
            allowEvolution: body.allowEvolution === true,
            maxSteps: 10,
            maxGeneratedAgents: 3,
          },
        )) {
          controller.enqueue(encoder.encode(encodeEvent(event)));
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Graph execution failed.";

        controller.enqueue(encoder.encode(encodeEvent({ type: "error", message })));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
