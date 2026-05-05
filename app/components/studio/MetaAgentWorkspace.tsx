"use client";

import { useState } from "react";
import { AgentCreator } from "./AgentCreator";
import { AgentRunner } from "./AgentRunner";
import { GraphStatus } from "./GraphStatus";
import { LoadingState } from "./LoadingState";
import { OutputPanel } from "./OutputPanel";
import type { AgentConfig, GraphLog } from "./types";

export function MetaAgentWorkspace() {
  const [task, setTask] = useState("");
  const [agent, setAgent] = useState<AgentConfig | null>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);
  const [orchLoading, setOrchLoading] = useState(false);
  const [, setOrchLogs] = useState<GraphLog[] | null>(null);
  const [graphLoading, setGraphLoading] = useState(false);
  const [, setGraphLogs] = useState<GraphLog[]>([]);
  const [graphStep, setGraphStep] = useState("");

  const createAgent = async () => {
    setAgentLoading(true);
    setLoading(true);
    setOutput("");
    setAgent(null);

    const res = await fetch("/api/mag", {
      method: "POST",
      body: JSON.stringify({ task }),
    });
    const data = (await res.json()) as AgentConfig;

    setAgent(data);
    setAgentLoading(false);
    setLoading(false);
  };

  const run = async () => {
    if (!agent) return;

    setRunLoading(true);
    setLoading(true);
    setOutput("Agent is thinking...");

    const res = await fetch("/api/run", {
      method: "POST",
      body: JSON.stringify({ agent, input }),
    });
    const data = (await res.json()) as { output: string };

    setOutput(data.output);
    setRunLoading(false);
    setLoading(false);
  };

  const runOrchestrator = async () => {
    if (!input.trim()) return;

    setOrchLoading(true);
    setOutput("Multi-agent system starting...");

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input,
          agents: [
            {
              name: "Planner",
              systemPrompt: "Break the task into structured steps.",
            },
            {
              name: "Executor",
              systemPrompt: "Execute each step carefully.",
            },
            {
              name: "Critic",
              systemPrompt: "Review output and improve quality.",
            },
          ],
        }),
      });
      const data = (await res.json()) as { logs: GraphLog[]; final: string };

      setOrchLogs(data.logs);
      setOutput(data.final);
    } catch {
      setOutput("Orchestration failed.");
    }

    setOrchLoading(false);
  };

  const runGraphSystem = async () => {
    if (!input.trim()) return;

    setGraphLoading(true);
    setOutput("");
    setGraphLogs([]);
    setGraphStep("Initializing graph...");

    try {
      setGraphStep("Connecting nodes...");
      const res = await fetch("/api/graph", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input }),
      });

      setGraphStep("Executing agents...");
      const data = (await res.json()) as { logs: GraphLog[]; final: string };

      setGraphLogs(data.logs);
      setOutput(data.final);
      setGraphStep("Completed successfully");
    } catch {
      setGraphStep("Graph execution failed");
      setOutput("Error running graph system");
    }

    setGraphLoading(false);
  };

  return (
    <>
      <AgentCreator
        task={task}
        isLoading={agentLoading}
        onTaskChange={setTask}
        onCreate={createAgent}
      />

      {loading && !agent && !output && <LoadingState />}

      {agent && (
        <AgentRunner
          agent={agent}
          input={input}
          runLoading={runLoading}
          orchLoading={orchLoading}
          graphLoading={graphLoading}
          onInputChange={setInput}
          onRun={run}
          onRunOrchestrator={runOrchestrator}
          onRunGraph={runGraphSystem}
        />
      )}

      {graphLoading && <GraphStatus step={graphStep} />}

      {output && <OutputPanel output={output} isLoading={runLoading} />}
    </>
  );
}
