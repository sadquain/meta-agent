"use client";

import { useState } from "react";
import styles from "./app.module.css"; // Adjust path as needed

export default function Home() {
  const [task, setTask] = useState("");
  const [agent, setAgent] = useState<any>(null);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [agentLoading, setAgentLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  const [orchLoading, setOrchLoading] = useState(false);
  const [orchLogs, setOrchLogs] = useState<any>(null);

  const [graphLoading, setGraphLoading] = useState(false);
  const [graphLogs, setGraphLogs] = useState<any[]>([]);
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

    const data = await res.json();

    setAgent(data);
    setAgentLoading(false);
    setLoading(false);
  };

  const run = async () => {
    setRunLoading(true);
    setLoading(true);
    setOutput("Agent is thinking...");

    const res = await fetch("/api/run", {
      method: "POST",
      body: JSON.stringify({ agent, input }),
    });

    const data = await res.json();

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

      const data = await res.json();

      setOrchLogs(data.logs);
      setOutput(data.final);
    } catch (err) {
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

      const data = await res.json();

      setGraphLogs(data.logs);
      setOutput(data.final);

      setGraphStep("Completed successfully");
    } catch (err) {
      setGraphStep("Graph execution failed");
      setOutput("Error running graph system");
    }

    setGraphLoading(false);
  };

  return (
    <div className={styles.appContainer}>
      {/* Animated Background Gradient */}
      <div className={styles.animatedBg}></div>

      <div className={styles.contentWrapper}>
        {/* Header Section */}
        <div className={`${styles.header} ${styles.fadeInDown}`}>
          <div className={styles.logoBadge}>
            <div className={styles.logoIcon}>
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 4L4 12L16 20L28 12L16 4Z"
                  stroke="url(#grad)"
                  strokeWidth="1.5"
                  fill="url(#gradFill)"
                  fillOpacity="0.2"
                />
                <path
                  d="M4 12L16 20L16 28L4 20L4 12Z"
                  stroke="url(#grad)"
                  strokeWidth="1.5"
                  fill="url(#gradFill)"
                  fillOpacity="0.15"
                />
                <path
                  d="M28 12L16 20L16 28L28 20L28 12Z"
                  stroke="url(#grad)"
                  strokeWidth="1.5"
                  fill="url(#gradFill)"
                  fillOpacity="0.15"
                />
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="100%" stopColor="#A78BFA" />
                  </linearGradient>
                  <linearGradient
                    id="gradFill"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#8B5CF6" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h1 className={styles.gradientText}>MetaAgent Studio</h1>
              <p className={styles.subtitle}>
                Orchestrate intelligent agents with precision
              </p>
            </div>
          </div>
        </div>

        {/* Create Agent Section */}
        <div className={`${styles.card} ${styles.slideUp}`}>
          <div className={styles.cardHeader}>
            <i className="fas fa-robot"></i>
            <h2>Agent Creator</h2>
          </div>
          <div className={styles.cardBody}>
            <div className={styles.inputGroup}>
              <label htmlFor="task">Agent Description</label>
              <div className={styles.inputWrapper}>
                <i className="fas fa-pen-fancy input-icon"></i>
                <input
                  id="task"
                  type="text"
                  placeholder="e.g., A helpful assistant that answers questions about space..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className={styles.modernInput}
                  disabled={agentLoading}
                />
              </div>
            </div>
            <button
              onClick={createAgent}
              className={`${styles.btnPrimary} ${agentLoading ? styles.loading : ""}`}
              disabled={!task.trim() || agentLoading}
            >
              {agentLoading ? (
                <>
                  <div className={styles.spinner}></div>
                  <span>Creating Agent...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-magic"></i>
                  <span>Create Agent</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Animation */}
        {loading && !agent && !output && (
          <div className={`${styles.loadingState} ${styles.fadeInDown}`}>
            <div className={styles.loadingCard}>
              <div className={styles.pulseRing}></div>
              <div className={styles.loadingContent}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className={styles.thinkingText}>
                  <i className="fas fa-brain"></i>
                  <span>Agent is thinking...</span>
                </div>
                <div className={styles.loadingSteps}>
                  <div className={styles.step}>
                    <i className="fas fa-chart-line"></i> analyzing task...
                  </div>
                  <div className={styles.step}>
                    <i className="fas fa-cogs"></i> generating response...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Display */}
        {agent && (
          <div className={`${styles.card} ${styles.slideUp} agent-card`}>
            <div className={`${styles.cardHeader} ${styles.cardHeaderSuccess}`}>
              <i className="fas fa-check-circle"></i>
              <h2>Agent Created</h2>
              <i className={`fas fa-microchip ${styles.chipIcon}`}></i>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.agentPreview}>
                <div className={styles.previewHeader}>
                  <i className="fas fa-code"></i>
                  <span>Agent Configuration</span>
                </div>
                <pre className={styles.codeBlock}>
                  {JSON.stringify(agent, null, 2)}
                </pre>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="runInput">Execution Input</label>
                <div className={styles.inputWrapper}>
                  <i className="fas fa-terminal input-icon"></i>
                  <input
                    id="runInput"
                    type="text"
                    placeholder="Enter command or query for the agent..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={styles.modernInput}
                    disabled={runLoading}
                  />
                </div>
              </div>
              <button
                onClick={run}
                className={`${styles.btnSecondary} ${runLoading ? styles.loading : ""}`}
                disabled={!input.trim() || runLoading}
              >
                {runLoading ? (
                  <>
                    <div className={styles.spinnerLight}></div>
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-play"></i>
                    <span>Run Agent</span>
                  </>
                )}
              </button>
              <button
                onClick={runOrchestrator}
                className={styles.btnPrimary}
                disabled={!input.trim() || orchLoading}
              >
                {orchLoading ? (
                  <>
                    <div className={styles.spinner}></div>
                    <span>Running Agents...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-project-diagram"></i>
                    <span>Run Multi-Agent System</span>
                  </>
                )}
              </button>
              <button
                onClick={runGraphSystem}
                disabled={graphLoading || !input.trim()}
                className={`${styles.btnSecondary} ${graphLoading ? styles.running : ""}`}
              >
                {graphLoading ? (
                  <>
                    <div className="orb-loader"></div>
                    <span>Running Graph...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-project-diagram"></i>
                    <span>Run Graph Engine</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
{graphLoading && (
  <div className="status-panel">
    <div className="pulse-core"></div>

    <div className="status-text">
      <i className="fas fa-brain"></i>
      {graphStep}
    </div>

    <div className="status-sub">
      Multi-agent graph executing in real-time...
    </div>
  </div>
)}
        {/* Output Section */}
        {output && (
          <div className={`${styles.card} ${styles.fadeInUp}`}>
            <div className={`${styles.cardHeader} ${styles.cardHeaderOutput}`}>
              <i className="fas fa-reply-all"></i>
              <h2>Agent Response</h2>
              <button
                className={styles.copyBtn}
                onClick={() => navigator.clipboard.writeText(output)}
                title="Copy to clipboard"
              >
                <i className="far fa-copy"></i>
              </button>
            </div>
            <div className={styles.cardBody}>
              <div className={styles.outputContent}>
                {runLoading ? (
                  <div className={styles.typingAnimation}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <pre className={styles.outputText}>{output}</pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
