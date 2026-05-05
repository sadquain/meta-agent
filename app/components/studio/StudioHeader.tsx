import styles from "../../app.module.css";

export function StudioHeader() {
  return (
    <header className={`${styles.header} ${styles.fadeInDown}`}>
      <div className={styles.logoBadge}>
        <div className={styles.logoIcon} aria-hidden="true">
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
    </header>
  );
}
