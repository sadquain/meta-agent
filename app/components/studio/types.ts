export type AgentConfig = {
  id?: string;
  name?: string;
  role?: string;
  systemPrompt?: string;
  system_prompt?: string;
  constraints?: string[];
  error?: string;
  raw?: string;
};

export type GraphLog = {
  agent?: string;
  node?: string;
  input?: string;
  output?: string;
};
