import { connection } from "next/server";
import styles from "../../app.module.css";

export async function RuntimePanel() {
  await connection();

  return (
    <aside className={styles.runtimePanel} aria-label="Runtime status">
      <h2>Runtime</h2>
      <dl>
        <div>
          <dt>Provider</dt>
          <dd>Groq</dd>
        </div>
        <div>
          <dt>Rendering</dt>
          <dd>PPR shell with streamed runtime island</dd>
        </div>
      </dl>
    </aside>
  );
}
