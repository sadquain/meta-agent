"use client";

import styles from "../../app.module.css";

type OutputPanelProps = {
  output: string;
  isLoading: boolean;
};

export function OutputPanel({ output, isLoading }: OutputPanelProps) {
  return (
    <section className={`${styles.card} ${styles.fadeInUp}`}>
      <div className={`${styles.cardHeader} ${styles.cardHeaderOutput}`}>
        <h2>Agent Response</h2>
        <button
          className={styles.copyBtn}
          onClick={() => navigator.clipboard.writeText(output)}
          title="Copy to clipboard"
        >
          Copy
        </button>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.outputContent}>
          {isLoading ? (
            <div className={styles.typingAnimation} aria-label="Loading response">
              <span />
              <span />
              <span />
            </div>
          ) : (
            <pre className={styles.outputText}>{output}</pre>
          )}
        </div>
      </div>
    </section>
  );
}
