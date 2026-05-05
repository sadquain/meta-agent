"use client";

import { useState } from "react";

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

  return (
    <div className="app-container">
      {/* Animated Background Gradient */}
      <div className="animated-bg"></div>

      <div className="content-wrapper">
        {/* Header Section */}
        <div className="header fade-in-down">
          <div className="logo-badge">
            <div className="logo-icon">
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
              <h1 className="gradient-text">MetaAgent Studio</h1>
              <p className="subtitle">
                Orchestrate intelligent agents with precision
              </p>
            </div>
          </div>
        </div>

        {/* Create Agent Section */}
        <div className="card slide-up">
          <div className="card-header">
            <i className="fas fa-robot"></i>
            <h2>Agent Creator</h2>
          </div>
          <div className="card-body">
            <div className="input-group">
              <label htmlFor="task">Agent Description</label>
              <div className="input-wrapper">
                <i className="fas fa-pen-fancy input-icon"></i>
                <input
                  id="task"
                  type="text"
                  placeholder="e.g., A helpful assistant that answers questions about space..."
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  className="modern-input"
                  disabled={agentLoading}
                />
              </div>
            </div>
            <button
              onClick={createAgent}
              className={`btn-primary ${agentLoading ? "loading" : ""}`}
              disabled={!task.trim() || agentLoading}
            >
              {agentLoading ? (
                <>
                  <div className="spinner"></div>
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
          <div className="loading-state fade-in">
            <div className="loading-card">
              <div className="pulse-ring"></div>
              <div className="loading-content">
                <div className="loading-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="thinking-text">
                  <i className="fas fa-brain"></i>
                  <span>Agent is thinking...</span>
                </div>
                <div className="loading-steps">
                  <div className="step">
                    <i className="fas fa-chart-line"></i> analyzing task...
                  </div>
                  <div className="step">
                    <i className="fas fa-cogs"></i> generating response...
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Agent Display */}
        {agent && (
          <div className="card slide-up agent-card">
            <div className="card-header success">
              <i className="fas fa-check-circle"></i>
              <h2>Agent Created</h2>
              <i className="fas fa-microchip chip-icon"></i>
            </div>
            <div className="card-body">
              <div className="agent-preview">
                <div className="preview-header">
                  <i className="fas fa-code"></i>
                  <span>Agent Configuration</span>
                </div>
                <pre className="code-block">
                  {JSON.stringify(agent, null, 2)}
                </pre>
              </div>

              <div className="input-group">
                <label htmlFor="runInput">Execution Input</label>
                <div className="input-wrapper">
                  <i className="fas fa-terminal input-icon"></i>
                  <input
                    id="runInput"
                    type="text"
                    placeholder="Enter command or query for the agent..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="modern-input"
                    disabled={runLoading}
                  />
                </div>
              </div>
              <button
                onClick={run}
                className={`btn-secondary ${runLoading ? "loading" : ""}`}
                disabled={!input.trim() || runLoading}
              >
                {runLoading ? (
                  <>
                    <div className="spinner-light"></div>
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
                className="btn-primary"
                disabled={!input.trim() || orchLoading}
              >
                {orchLoading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Running Agents...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-project-diagram"></i>
                    <span>Run Multi-Agent System</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Output Section */}
        {output && (
          <div className="card output-card fade-in-up">
            <div className="card-header output">
              <i className="fas fa-reply-all"></i>
              <h2>Agent Response</h2>
              <button
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(output)}
                title="Copy to clipboard"
              >
                <i className="far fa-copy"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="output-content">
                {runLoading ? (
                  <div className="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <pre className="output-text">{output}</pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .app-container {
          min-height: 100vh;
          position: relative;
          background: radial-gradient(
            ellipse at 20% 30%,
            rgba(15, 25, 45, 1) 0%,
            rgba(5, 10, 25, 1) 100%
          );
          font-family:
            "Inter",
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .animated-bg {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background:
            radial-gradient(
              circle at 10% 20%,
              rgba(59, 130, 246, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 90% 80%,
              rgba(139, 92, 246, 0.08) 0%,
              transparent 50%
            );
          pointer-events: none;
          z-index: 0;
          animation: bgPulse 12s ease-in-out infinite;
        }

        @keyframes bgPulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }

        .content-wrapper {
          position: relative;
          z-index: 2;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1.5rem 4rem;
        }

        /* Header Styles */
        .header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .logo-badge {
          display: inline-flex;
          align-items: center;
          gap: 1rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          padding: 1rem 2rem;
          border-radius: 100px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gradient-text {
          font-size: 2rem;
          font-weight: 700;
          background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: #94a3b8;
          font-size: 0.875rem;
          margin-top: 0.25rem;
        }

        /* Card Component */
        .card {
          background: rgba(18, 25, 45, 0.7);
          backdrop-filter: blur(12px);
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow:
            0 25px 50px -12px rgba(0, 0, 0, 0.5),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 1.75rem;
          overflow: hidden;
        }

        .card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 30px 60px -15px rgba(0, 0, 0, 0.6),
            0 0 0 1px rgba(255, 255, 255, 0.15);
          border-color: rgba(96, 165, 250, 0.3);
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1.75rem;
          background: rgba(255, 255, 255, 0.03);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-header i {
          font-size: 1.25rem;
          color: #60a5fa;
        }

        .card-header h2 {
          font-size: 1.125rem;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
          flex: 1;
        }

        .card-header.success i {
          color: #34d399;
        }

        .card-header.output i {
          color: #f472b6;
        }

        .chip-icon {
          font-size: 1.25rem;
          color: #8b5cf6;
        }

        .card-body {
          padding: 1.75rem;
        }

        /* Input Styles */
        .input-group {
          margin-bottom: 1.5rem;
        }

        .input-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #cbd5e1;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
          font-size: 1rem;
          pointer-events: none;
        }

        .modern-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 2.75rem;
          background: rgba(15, 23, 42, 0.8);
          border: 1.5px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          font-size: 0.9375rem;
          color: #f1f5f9;
          font-family: "Inter", sans-serif;
          transition: all 0.2s ease;
        }

        .modern-input:focus {
          outline: none;
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.2);
          background: rgba(20, 30, 50, 0.9);
        }

        .modern-input::placeholder {
          color: #475569;
        }

        .modern-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Buttons */
        .btn-primary,
        .btn-secondary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 0.875rem 1.75rem;
          border-radius: 40px;
          font-weight: 600;
          font-size: 0.9375rem;
          font-family: "Inter", sans-serif;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          border: none;
          width: 100%;
        }

        .btn-primary {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          color: white;
          box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
        }

        .btn-primary:hover:not(:disabled) {
          transform: scale(1.02);
          box-shadow: 0 8px 25px 0 rgba(59, 130, 246, 0.5);
        }

        .btn-primary:active:not(:disabled) {
          transform: scale(0.98);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.08);
          color: #e2e8f0;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.15);
          transform: scale(1.02);
          border-color: rgba(96, 165, 250, 0.5);
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Loading States */
        .spinner,
        .spinner-light {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        .spinner-light {
          border-top-color: #e2e8f0;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .loading-state {
          margin: 1rem 0;
        }

        .loading-card {
          background: rgba(18, 25, 45, 0.8);
          backdrop-filter: blur(12px);
          border-radius: 28px;
          padding: 2rem;
          text-align: center;
          border: 1px solid rgba(96, 165, 250, 0.3);
          position: relative;
          overflow: hidden;
        }

        .pulse-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100px;
          height: 100px;
          margin: -50px 0 0 -50px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(96, 165, 250, 0.2),
            transparent
          );
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 0.8;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .loading-content {
          position: relative;
          z-index: 1;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .loading-dots span {
          width: 10px;
          height: 10px;
          background: #60a5fa;
          border-radius: 50%;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .loading-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }
        .loading-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }

        .thinking-text {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-weight: 500;
          color: #cbd5e1;
        }

        .loading-steps {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .step {
          font-size: 0.8125rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Agent Preview */
        .agent-preview {
          background: rgba(0, 0, 0, 0.4);
          border-radius: 20px;
          margin-bottom: 1.5rem;
          overflow: hidden;
        }

        .preview-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          font-size: 0.8125rem;
          font-weight: 500;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .code-block {
          padding: 1rem;
          font-size: 0.8125rem;
          font-family: "Monaco", "Menlo", monospace;
          color: #a5f3c3;
          overflow-x: auto;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.5;
        }

        /* Output Styles */
        .output-content {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 20px;
          padding: 1rem;
          min-height: 100px;
        }

        .output-text {
          font-family: "Monaco", "Menlo", monospace;
          font-size: 0.875rem;
          color: #e2e8f0;
          white-space: pre-wrap;
          word-wrap: break-word;
          line-height: 1.6;
        }

        .typing-animation {
          display: flex;
          gap: 0.5rem;
          padding: 0.5rem;
        }

        .typing-animation span {
          width: 8px;
          height: 8px;
          background: #f472b6;
          border-radius: 50%;
          animation: typing 1.4s infinite;
        }

        .typing-animation span:nth-child(2) {
          animation-delay: 0.2s;
        }
        .typing-animation span:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-10px);
            opacity: 1;
          }
        }

        .copy-btn {
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 12px;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          color: #60a5fa;
          transform: scale(1.05);
        }

        /* Animations */
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fade-in-down {
          animation: fadeInDown 0.6s ease-out;
        }

        .slide-up {
          animation: slideUp 0.5s cubic-bezier(0.2, 0.9, 0.4, 1.1);
        }

        .fade-in-up {
          animation: fadeInUp 0.5s ease-out;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .content-wrapper {
            padding: 1rem;
          }
          .gradient-text {
            font-size: 1.5rem;
          }
          .card-header {
            padding: 1rem 1.25rem;
          }
          .card-body {
            padding: 1.25rem;
          }
          .loading-steps {
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
          }
        }

        @media (min-width: 1024px) {
          .card {
            margin-bottom: 2rem;
          }
          .btn-primary,
          .btn-secondary {
            width: auto;
            min-width: 200px;
          }
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(96, 165, 250, 0.5);
          border-radius: 10px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(96, 165, 250, 0.8);
        }
      `}</style>
    </div>
  );
}
