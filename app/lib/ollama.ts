export async function callOllama(prompt: string) {
  const res = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "llama3",
      prompt,
      stream: false
    })
  });

  const data = await res.json();
  return data.response;
}