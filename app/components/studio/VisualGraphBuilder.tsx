"use client";

import type React from "react";
import { useMemo, useState } from "react";
import styles from "../../app.module.css";
import type { GraphEdge, GraphLog, GraphNode } from "./types";

type StreamEvent =
  | { type: "graph"; nodes: GraphNode[]; edges: GraphEdge[] }
  | { type: "node-start"; nodeId: string; input: string }
  | { type: "token"; nodeId: string; token: string }
  | { type: "node-complete"; nodeId: string; input: string; output: string }
  | { type: "edge"; from: string; to: string }
  | { type: "node-added"; node: GraphNode; from?: string; to?: string }
  | { type: "done"; final: string; logs: GraphLog[] }
  | { type: "error"; message: string };

const starterNodes: GraphNode[] = [
  {
    id: "mag",
    name: "Meta-Agent",
    systemPrompt:
      "Analyze the task, identify missing specialist agents, and coordinate the graph safely.",
    x: 40,
    y: 120,
  },
  {
    id: "planner",
    name: "Planner",
    systemPrompt: "Break the task into a concise execution plan.",
    x: 340,
    y: 80,
  },
  {
    id: "executor",
    name: "Executor",
    systemPrompt: "Execute the plan and produce a useful final answer.",
    x: 640,
    y: 160,
  },
];

const starterEdges: GraphEdge[] = [
  { from: "mag", to: "planner" },
  { from: "planner", to: "executor" },
];

function nodeCenter(node: GraphNode) {
  return {
    x: node.x + 110,
    y: node.y + 50,
  };
}

function createNodeId(name: string, nodes: GraphNode[]) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 28) || "agent";
  let id = base;
  let index = 2;

  while (nodes.some((node) => node.id === id)) {
    id = `${base}-${index}`;
    index += 1;
  }

  return id;
}

export function VisualGraphBuilder() {
  const [nodes, setNodes] = useState<GraphNode[]>(starterNodes);
  const [edges, setEdges] = useState<GraphEdge[]>(starterEdges);
  const [input, setInput] = useState("");
  const [selectedNodeId, setSelectedNodeId] = useState("mag");
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
  const [activeEdge, setActiveEdge] = useState<GraphEdge | null>(null);
  const [nodeOutputs, setNodeOutputs] = useState<Record<string, string>>({});
  const [logs, setLogs] = useState<GraphLog[]>([]);
  const [finalOutput, setFinalOutput] = useState("");
  const [status, setStatus] = useState("Idle");
  const [running, setRunning] = useState(false);
  const [allowEvolution, setAllowEvolution] = useState(true);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) || nodes[0],
    [nodes, selectedNodeId],
  );

  const updateNode = (nodeId: string, patch: Partial<GraphNode>) => {
    setNodes((current) =>
      current.map((node) => (node.id === nodeId ? { ...node, ...patch } : node)),
    );
  };

  const addNodeAt = (x: number, y: number) => {
    setNodes((current) => {
      const name = `Specialist ${current.length + 1}`;
      const id = createNodeId(name, current);

      return [
        ...current,
        {
          id,
          name,
          systemPrompt: "Solve one focused part of the task and return concise output.",
          x,
          y,
        },
      ];
    });
  };

  const deleteSelectedNode = () => {
    if (!selectedNode || selectedNode.id === "mag") {
      return;
    }

    setNodes((current) => current.filter((node) => node.id !== selectedNode.id));
    setEdges((current) =>
      current.filter(
        (edge) => edge.from !== selectedNode.id && edge.to !== selectedNode.id,
      ),
    );
    setSelectedNodeId("mag");
  };

  const connectTo = (targetId: string) => {
    if (!connectFrom || connectFrom === targetId) {
      setConnectFrom(null);
      return;
    }

    setEdges((current) => {
      if (current.some((edge) => edge.from === connectFrom && edge.to === targetId)) {
        return current;
      }

      return [...current, { from: connectFrom, to: targetId }];
    });
    setConnectFrom(null);
  };

  const removeEdge = (edgeToRemove: GraphEdge) => {
    setEdges((current) =>
      current.filter(
        (edge) => edge.from !== edgeToRemove.from || edge.to !== edgeToRemove.to,
      ),
    );
  };

  const handleCanvasDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const nodeId = event.dataTransfer.getData("application/x-node-id");
    const paletteType = event.dataTransfer.getData("application/x-palette");
    const x = event.clientX - rect.left - 110;
    const y = event.clientY - rect.top - 50;

    if (paletteType === "agent") {
      addNodeAt(Math.max(16, x), Math.max(16, y));
      return;
    }

    if (nodeId) {
      updateNode(nodeId, {
        x: Math.max(16, x),
        y: Math.max(16, y),
      });
    }
  };

  const handleStreamEvent = (event: StreamEvent) => {
    if (event.type === "graph") {
      setNodes(event.nodes);
      setEdges(event.edges);
      return;
    }

    if (event.type === "node-added") {
      setStatus(`MAG injected ${event.node.name}`);
      return;
    }

    if (event.type === "node-start") {
      setActiveNodeId(event.nodeId);
      setActiveEdge(null);
      setStatus(`Running ${event.nodeId}`);
      setNodeOutputs((current) => ({ ...current, [event.nodeId]: "" }));
      return;
    }

    if (event.type === "token") {
      setNodeOutputs((current) => ({
        ...current,
        [event.nodeId]: `${current[event.nodeId] || ""}${event.token}`,
      }));
      return;
    }

    if (event.type === "node-complete") {
      setLogs((current) => [...current, event]);
      return;
    }

    if (event.type === "edge") {
      setActiveEdge({ from: event.from, to: event.to });
      return;
    }

    if (event.type === "done") {
      setFinalOutput(event.final);
      setLogs(event.logs);
      setActiveNodeId(null);
      setActiveEdge(null);
      setStatus("Completed");
      return;
    }

    if (event.type === "error") {
      setStatus(event.message);
      setActiveNodeId(null);
      setActiveEdge(null);
    }
  };

  const runGraph = async () => {
    if (!input.trim() || running) {
      return;
    }

    setRunning(true);
    setStatus("Starting stream");
    setNodeOutputs({});
    setLogs([]);
    setFinalOutput("");
    setActiveNodeId(null);
    setActiveEdge(null);

    try {
      const response = await fetch("/api/graph/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          nodes,
          edges,
          allowEvolution,
        }),
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(data?.error || "Graph stream failed to start.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const frames = buffer.split("\n\n");
        buffer = frames.pop() || "";

        for (const frame of frames) {
          const line = frame
            .split("\n")
            .find((entry) => entry.startsWith("data:"));

          if (!line) {
            continue;
          }

          handleStreamEvent(JSON.parse(line.slice(5).trim()) as StreamEvent);
        }
      }
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Graph execution failed.");
    } finally {
      setRunning(false);
    }
  };

  return (
    <section className={styles.graphBuilderShell}>
      <div className={styles.graphToolbar}>
        <div>
          <h2>Visual Graph Builder</h2>
          <p>{status}</p>
        </div>
        <div className={styles.graphControls}>
          <label className={styles.toggleControl}>
            <input
              type="checkbox"
              checked={allowEvolution}
              onChange={(event) => setAllowEvolution(event.target.checked)}
            />
            <span>Self-evolve</span>
          </label>
          <button
            type="button"
            className={styles.btnSecondary}
            draggable
            onDragStart={(event) =>
              event.dataTransfer.setData("application/x-palette", "agent")
            }
          >
            Drag Agent
          </button>
          <button
            type="button"
            className={`${styles.btnPrimary} ${running ? styles.loading : ""}`}
            disabled={!input.trim() || running || nodes.length === 0}
            onClick={runGraph}
          >
            {running ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Streaming</span>
              </>
            ) : (
              <span>Run Graph</span>
            )}
          </button>
        </div>
      </div>

      <div className={styles.graphInputRow}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          className={styles.graphInput}
          placeholder="Describe the task the graph should solve..."
          disabled={running}
        />
      </div>

      <div className={styles.graphWorkbench}>
        <div
          className={styles.graphCanvas}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleCanvasDrop}
        >
          <svg className={styles.edgeLayer} aria-hidden="true">
            <defs>
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="10"
                refY="3.5"
                orient="auto"
              >
                <polygon points="0 0, 10 3.5, 0 7" />
              </marker>
            </defs>
            {edges.map((edge) => {
              const from = nodes.find((node) => node.id === edge.from);
              const to = nodes.find((node) => node.id === edge.to);

              if (!from || !to) {
                return null;
              }

              const start = nodeCenter(from);
              const end = nodeCenter(to);
              const isActive =
                activeEdge?.from === edge.from && activeEdge?.to === edge.to;

              return (
                <line
                  key={`${edge.from}-${edge.to}`}
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  className={isActive ? styles.activeEdge : styles.graphEdge}
                  markerEnd="url(#arrowhead)"
                />
              );
            })}
          </svg>

          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isActive = activeNodeId === node.id;
            const output = nodeOutputs[node.id];

            return (
              <div
                key={node.id}
                className={`${styles.graphNode} ${
                  isSelected ? styles.selectedNode : ""
                } ${isActive ? styles.activeNode : ""}`}
                style={{ left: node.x, top: node.y }}
                draggable={!running}
                onDragStart={(event) => {
                  event.dataTransfer.setData("application/x-node-id", node.id);
                }}
                onClick={() => {
                  setSelectedNodeId(node.id);
                  connectTo(node.id);
                }}
              >
                <div className={styles.nodeHeader}>
                  <span>{node.id}</span>
                  <button
                    type="button"
                    title="Start connection"
                    onClick={(event) => {
                      event.stopPropagation();
                      setConnectFrom(node.id);
                    }}
                  >
                    +
                  </button>
                </div>
                <strong>{node.name}</strong>
                <p>{node.systemPrompt}</p>
                {output && <pre>{output}</pre>}
              </div>
            );
          })}
        </div>

        <aside className={styles.graphInspector}>
          {selectedNode && (
            <>
              <div className={styles.inspectorHeader}>
                <h3>Node</h3>
                <button
                  type="button"
                  className={styles.copyBtn}
                  onClick={deleteSelectedNode}
                  disabled={selectedNode.id === "mag" || running}
                >
                  Delete
                </button>
              </div>
              <label>
                ID
                <input value={selectedNode.id} readOnly />
              </label>
              <label>
                Name
                <input
                  value={selectedNode.name}
                  onChange={(event) =>
                    updateNode(selectedNode.id, { name: event.target.value })
                  }
                  disabled={running}
                />
              </label>
              <label>
                System Prompt
                <textarea
                  value={selectedNode.systemPrompt}
                  onChange={(event) =>
                    updateNode(selectedNode.id, {
                      systemPrompt: event.target.value,
                    })
                  }
                  disabled={running}
                />
              </label>
            </>
          )}

          <div className={styles.edgeList}>
            <h3>Edges</h3>
            {edges.map((edge) => (
              <button
                key={`${edge.from}-${edge.to}`}
                type="button"
                onClick={() => removeEdge(edge)}
                disabled={running}
              >
                {edge.from} &rarr; {edge.to}
              </button>
            ))}
            {connectFrom && <p>Choose a target for {connectFrom}</p>}
          </div>
        </aside>
      </div>

      <div className={styles.graphResults}>
        <section>
          <h3>Node Logs</h3>
          {logs.length === 0 ? (
            <p>No node output yet.</p>
          ) : (
            logs.map((log) => (
              <article key={`${log.node}-${log.output?.slice(0, 12)}`}>
                <strong>{log.node}</strong>
                <pre>{log.output}</pre>
              </article>
            ))
          )}
        </section>
        <section>
          <h3>Final Output</h3>
          <pre>{finalOutput || "Awaiting execution."}</pre>
        </section>
      </div>
    </section>
  );
}
