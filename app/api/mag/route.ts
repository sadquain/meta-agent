import { generateAgent } from "../../lib/mag";
import { getSupabase } from "../../lib/supabase";

export const maxDuration = 30;

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unexpected server error.";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { task?: unknown };

    if (typeof body.task !== "string" || !body.task.trim()) {
      return Response.json(
        { error: "A non-empty task is required." },
        { status: 400 },
      );
    }

    const supabase = getSupabase();
    const agent = await generateAgent(body.task.trim());

    const { data, error } = await supabase
      .from("agents")
      .insert({
        name: agent.name,
        role: agent.role,
        system_prompt: agent.systemPrompt,
        constraints: agent.constraints,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert failed:", error);
      return Response.json(
        { error: "Failed to save generated agent." },
        { status: 502 },
      );
    }

    return Response.json(data);
  } catch (error) {
    console.error("MAG route failed:", error);
    return Response.json({ error: toErrorMessage(error) }, { status: 500 });
  }
}
