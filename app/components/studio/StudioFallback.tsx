import styles from "../../app.module.css";

export function StudioFallback() {
  return (
    <section className={`${styles.card} ${styles.slideUp}`} aria-busy="true">
      <div className={styles.cardHeader}>
        <h2>Preparing Studio</h2>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.skeletonLine} />
        <div className={styles.skeletonLineShort} />
      </div>
    </section>
  );
}
