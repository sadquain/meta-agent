import { getSupabase } from "../../lib/supabase";

export async function POST(req: Request) {
  const { run_id, status, edited_output } = await req.json();
  const supabase = getSupabase();

  await supabase
    .from("runs")
    .update({
      status,
      output: edited_output
    })
    .eq("id", run_id);

  return Response.json({ success: true });
}
