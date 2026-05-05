import styles from "../../app.module.css";

export function RuntimeFallback() {
  return (
    <aside className={styles.runtimePanel} aria-busy="true">
      <h2>Runtime</h2>
      <div className={styles.skeletonLineShort} />
    </aside>
  );
}
