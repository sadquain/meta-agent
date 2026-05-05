"use client";

import styles from "../../app.module.css";

type AgentCreatorProps = {
  task: string;
  isLoading: boolean;
  onTaskChange: (task: string) => void;
  onCreate: () => void;
};

export function AgentCreator({
  task,
  isLoading,
  onTaskChange,
  onCreate,
}: AgentCreatorProps) {
  return (
    <section className={`${styles.card} ${styles.slideUp}`}>
      <div className={styles.cardHeader}>
        <span aria-hidden="true">AI</span>
        <h2>Agent Creator</h2>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.inputGroup}>
          <label htmlFor="task">Agent description</label>
          <div className={styles.inputWrapper}>
            <input
              id="task"
              type="text"
              placeholder="A helpful assistant that answers questions about space..."
              value={task}
              onChange={(event) => onTaskChange(event.target.value)}
              className={styles.modernInput}
              disabled={isLoading}
            />
          </div>
        </div>
        <button
          onClick={onCreate}
          className={`${styles.btnPrimary} ${isLoading ? styles.loading : ""}`}
          disabled={!task.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <span className={styles.spinner} aria-hidden="true" />
              <span>Creating Agent...</span>
            </>
          ) : (
            <span>Create Agent</span>
          )}
        </button>
      </div>
    </section>
  );
}
