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

export type GraphNode = {
  id: string;
  name: string;
  systemPrompt: string;
  x: number;
  y: number;
};

export type GraphEdge = {
  from: string;
  to: string;
};
