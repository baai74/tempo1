export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "error";
  content: string;
  timestamp: Date;
  workflow?: {
    nodes: any[];
    connections: any[];
  };
}

export interface WorkflowGenerationRequest {
  prompt: string;
  provider: string;
  context?: {
    existingNodes?: any[];
    existingConnections?: any[];
  };
}

export interface WorkflowGenerationResponse {
  success: boolean;
  workflow?: {
    nodes: any[];
    connections: any[];
  };
  message: string;
  error?: string;
}
