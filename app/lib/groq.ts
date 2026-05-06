type GroqChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
};

const GROQ_CHAT_COMPLETIONS_URL =
  "https://api.groq.com/openai/v1/chat/completions";

type CallGroqOptions = {
  jsonMode?: boolean;
};

export async function callGroq(prompt: string, options: CallGroqOptions = {}) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    console.error("Groq error: GROQ_API_KEY is not configured");
    return "LLM request failed (missing Groq API key)";
  }

  try {
    const res = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        ...(options.jsonMode
          ? {
              response_format: {
                type: "json_object",
              },
            }
          : {}),
      }),
    });

    const data = (await res.json()) as GroqChatResponse;

    if (!res.ok) {
      throw new Error(data.error?.message || "Groq API failed");
    }

    return data.choices?.[0]?.message?.content || "";
  } catch (err) {
    const message = err instanceof Error ? err.message : "Groq API error";

    console.error("Groq error:", err);
    return `LLM request failed (${message})`;
  }
}

export async function* streamGroq(prompt: string): AsyncGenerator<string> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!apiKey) {
    throw new Error("LLM request failed (missing Groq API key)");
  }

  const res = await fetch(GROQ_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.2,
      stream: true,
    }),
  });

  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as GroqChatResponse | null;
    throw new Error(data?.error?.message || "LLM request failed (Groq API error)");
  }

  if (!res.body) {
    throw new Error("LLM request failed (empty stream)");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed.startsWith("data:")) {
        continue;
      }

      const payload = trimmed.slice(5).trim();

      if (payload === "[DONE]") {
        return;
      }

      try {
        const chunk = JSON.parse(payload) as {
          choices?: Array<{ delta?: { content?: string } }>;
        };
        const token = chunk.choices?.[0]?.delta?.content;

        if (token) {
          yield token;
        }
      } catch {
        // Ignore malformed stream frames and keep reading later frames.
      }
    }
  }
}
