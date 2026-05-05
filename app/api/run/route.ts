import { runAgent } from "../../lib/agent";
import { getSupabase } from "../../lib/supabase";
import { validate } from "../../lib/rules";

export async function POST(req: Request) {
  const { agent, input } = await req.json();
  const supabase = getSupabase();

  let output = await runAgent(agent, input);

  if (!validate(output)) {
    output = await runAgent(agent, "Fix this:\n" + output);
  }

  const { data } = await supabase
    .from("runs")
    .insert({
      agent_id: agent.id,
      input,
      output,
      status: "pending"
    })
    .select()
    .single();

  return Response.json({ output, run: data });
}
