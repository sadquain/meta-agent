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

export async function callGroq(prompt: string) {
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
      }),
    });

    const data = (await res.json()) as GroqChatResponse;

    if (!res.ok) {
      throw new Error(data.error?.message || "Groq API failed");
    }

    return data.choices?.[0]?.message?.content || "";
  } catch (err) {
    console.error("Groq error:", err);
    return "LLM request failed (Groq API error)";
  }
}
