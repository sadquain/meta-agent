export function validate(output: string) {
  if (!output || output.length < 20) return false;
  if (output.includes("I don't know")) return false;
  return true;
}