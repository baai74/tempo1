export interface AIProvider {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requiresApiKey: boolean;
  models?: string[];
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  description: string;
  enabled: boolean;
  capabilities: string[];
}

export interface AIConfiguration {
  provider: string;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  mcpServers: MCPServer[];
}

export interface ChatMessage {
  id: string;
  type: "user" | "assistant" | "error" | "system";
  content: string;
  timestamp: Date;
  workflow?: {
    nodes: any[];
    connections: any[];
  };
  action?: {
    type: "build" | "edit" | "test" | "run" | "save";
    target?: string;
    parameters?: any;
  };
}

export interface WorkflowGenerationRequest {
  prompt: string;
  provider: string;
  configuration: AIConfiguration;
  context?: {
    existingNodes?: any[];
    existingConnections?: any[];
    workflowHistory?: any[];
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
  actions?: {
    type: "build" | "edit" | "test" | "run" | "save";
    target?: string;
    parameters?: any;
  }[];
}

export interface AgentCapabilities {
  canBuild: boolean;
  canEdit: boolean;
  canTest: boolean;
  canRun: boolean;
  canSave: boolean;
  canAnalyze: boolean;
}
