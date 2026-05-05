"use client";

import styles from "../../app.module.css";

export function LoadingState() {
  return (
    <section className={`${styles.loadingState} ${styles.fadeInDown}`}>
      <div className={styles.loadingCard}>
        <div className={styles.pulseRing} aria-hidden="true" />
        <div className={styles.loadingContent}>
          <div className={styles.loadingDots} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div className={styles.thinkingText}>
            <span>Agent is thinking...</span>
          </div>
          <div className={styles.loadingSteps}>
            <div className={styles.step}>Analyzing task</div>
            <div className={styles.step}>Generating response</div>
          </div>
        </div>
      </div>
    </section>
  );
}
