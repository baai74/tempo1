import { useState, useCallback, useRef } from "react";
import {
  ChatMessage,
  WorkflowGenerationRequest,
  WorkflowGenerationResponse,
  AIConfiguration,
  MCPServer,
} from "./types";
import { generateWorkflowFromPrompt } from "./workflowGenerator";

interface UseAIChatProps {
  configuration: AIConfiguration;
  onWorkflowGenerated: (workflow: { nodes: any[]; connections: any[] }) => void;
  onWorkflowAction: (action: {
    type: string;
    target?: string;
    parameters?: any;
  }) => void;
  maxMessages?: number;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  currentMessage: string;
  setCurrentMessage: (message: string) => void;
  isGenerating: boolean;
  sendMessage: (message: string) => Promise<void>;
  clearMessages: () => void;
  error: string | null;
  configuration: AIConfiguration;
  updateConfiguration: (config: Partial<AIConfiguration>) => void;
  addMCPServer: (server: MCPServer) => void;
  removeMCPServer: (serverId: string) => void;
  toggleMCPServer: (serverId: string) => void;
}

export const useAIChat = ({
  configuration: initialConfiguration,
  onWorkflowGenerated,
  onWorkflowAction,
  maxMessages = 50,
}: UseAIChatProps): UseAIChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configuration, setConfiguration] =
    useState<AIConfiguration>(initialConfiguration);
  const abortControllerRef = useRef<AbortController | null>(null);

  const addMessage = useCallback(
    (message: Omit<ChatMessage, "id" | "timestamp">) => {
      const newMessage: ChatMessage = {
        ...message,
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
      };

      setMessages((prev) => {
        const updated = [...prev, newMessage];
        // Limit messages to prevent memory issues
        if (updated.length > maxMessages) {
          return updated.slice(-maxMessages);
        }
        return updated;
      });

      return newMessage;
    },
    [maxMessages],
  );

  const sendMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isGenerating) return;

      // Clear any previous errors
      setError(null);

      // Add user message
      addMessage({
        type: "user",
        content: message.trim(),
      });

      setCurrentMessage("");
      setIsGenerating(true);

      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      try {
        const request: WorkflowGenerationRequest = {
          prompt: message.trim(),
          provider: configuration.provider,
          configuration,
        };

        const response: WorkflowGenerationResponse =
          await generateWorkflowFromPrompt(
            request,
            abortControllerRef.current.signal,
          );

        if (response.success) {
          // Add assistant message with workflow
          addMessage({
            type: "assistant",
            content: response.message,
            workflow: response.workflow,
            action: response.actions?.[0],
          });

          // Apply workflow to canvas if generated
          if (response.workflow) {
            onWorkflowGenerated(response.workflow);
          }

          // Execute actions if any
          if (response.actions) {
            response.actions.forEach((action) => {
              onWorkflowAction(action);
            });
          }
        } else {
          // Add error message
          addMessage({
            type: "error",
            content: response.error || "Failed to generate workflow",
          });
          setError(response.error || "Failed to generate workflow");
        }
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          // Request was cancelled, don't show error
          return;
        }

        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        addMessage({
          type: "error",
          content: `Error: ${errorMessage}`,
        });
        setError(errorMessage);
      } finally {
        setIsGenerating(false);
        abortControllerRef.current = null;
      }
    },
    [
      isGenerating,
      configuration,
      addMessage,
      onWorkflowGenerated,
      onWorkflowAction,
    ],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  const updateConfiguration = useCallback(
    (config: Partial<AIConfiguration>) => {
      setConfiguration((prev) => ({ ...prev, ...config }));
    },
    [],
  );

  const addMCPServer = useCallback((server: MCPServer) => {
    setConfiguration((prev) => ({
      ...prev,
      mcpServers: [...prev.mcpServers, server],
    }));
  }, []);

  const removeMCPServer = useCallback((serverId: string) => {
    setConfiguration((prev) => ({
      ...prev,
      mcpServers: prev.mcpServers.filter((server) => server.id !== serverId),
    }));
  }, []);

  const toggleMCPServer = useCallback((serverId: string) => {
    setConfiguration((prev) => ({
      ...prev,
      mcpServers: prev.mcpServers.map((server) =>
        server.id === serverId
          ? { ...server, enabled: !server.enabled }
          : server,
      ),
    }));
  }, []);

  return {
    messages,
    currentMessage,
    setCurrentMessage,
    isGenerating,
    sendMessage,
    clearMessages,
    error,
    configuration,
    updateConfiguration,
    addMCPServer,
    removeMCPServer,
    toggleMCPServer,
  };
};
