"use client";

import styles from "../../app.module.css";
import type { AgentConfig } from "./types";

type AgentRunnerProps = {
  agent: AgentConfig;
  input: string;
  runLoading: boolean;
  orchLoading: boolean;
  graphLoading: boolean;
  onInputChange: (input: string) => void;
  onRun: () => void;
  onRunOrchestrator: () => void;
  onRunGraph: () => void;
};

export function AgentRunner({
  agent,
  input,
  runLoading,
  orchLoading,
  graphLoading,
  onInputChange,
  onRun,
  onRunOrchestrator,
  onRunGraph,
}: AgentRunnerProps) {
  return (
    <section className={`${styles.card} ${styles.slideUp}`}>
      <div className={`${styles.cardHeader} ${styles.cardHeaderSuccess}`}>
        <span aria-hidden="true">OK</span>
        <h2>Agent Created</h2>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.agentPreview}>
          <div className={styles.previewHeader}>
            <span>Agent configuration</span>
          </div>
          <pre className={styles.codeBlock}>{JSON.stringify(agent, null, 2)}</pre>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="runInput">Execution input</label>
          <div className={styles.inputWrapper}>
            <input
              id="runInput"
              type="text"
              placeholder="Enter a command or query for the agent..."
              value={input}
              onChange={(event) => onInputChange(event.target.value)}
              className={styles.modernInput}
              disabled={runLoading}
            />
          </div>
        </div>

        <div className={styles.actionGrid}>
          <button
            onClick={onRun}
            className={`${styles.btnSecondary} ${runLoading ? styles.loading : ""}`}
            disabled={!input.trim() || runLoading}
          >
            {runLoading ? (
              <>
                <span className={styles.spinnerLight} aria-hidden="true" />
                <span>Executing...</span>
              </>
            ) : (
              <span>Run Agent</span>
            )}
          </button>
          <button
            onClick={onRunOrchestrator}
            className={styles.btnPrimary}
            disabled={!input.trim() || orchLoading}
          >
            {orchLoading ? (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Running Agents...</span>
              </>
            ) : (
              <span>Run Multi-Agent System</span>
            )}
          </button>
          <button
            onClick={onRunGraph}
            disabled={graphLoading || !input.trim()}
            className={`${styles.graphBtn} ${graphLoading ? styles.running : ""}`}
          >
            {graphLoading ? (
              <>
                <span className={styles.orbLoader} aria-hidden="true" />
                <span>Running Graph...</span>
              </>
            ) : (
              <span>Run Graph Engine</span>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
