"use client";

import styles from "../../app.module.css";

type GraphStatusProps = {
  step: string;
};

export function GraphStatus({ step }: GraphStatusProps) {
  return (
    <section className={styles.statusPanel} aria-live="polite">
      <div className={styles.pulseCore} aria-hidden="true" />
      <div className={styles.statusText}>{step}</div>
      <div className={styles.statusSub}>Multi-agent graph executing in real time...</div>
    </section>
  );
}
