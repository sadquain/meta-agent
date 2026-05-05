import { generateAgent } from "../../lib/mag";
import { getSupabase } from "../../lib/supabase";

export async function POST(req: Request) {
  const { task } = await req.json();
  const supabase = getSupabase();

  const agent = await generateAgent(task);

  const { data } = await supabase
    .from("agents")
    .insert({
      name: agent.name,
      role: agent.role,
      system_prompt: agent.systemPrompt,
      constraints: agent.constraints
    })
    .select()
    .single();

  return Response.json(data);
}
