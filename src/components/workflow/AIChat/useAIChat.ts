import { useState, useCallback, useRef } from "react";
import {
  ChatMessage,
  WorkflowGenerationRequest,
  WorkflowGenerationResponse,
} from "./types";
import { generateWorkflowFromPrompt } from "./workflowGenerator";

interface UseAIChatProps {
  provider: string;
  onWorkflowGenerated: (workflow: { nodes: any[]; connections: any[] }) => void;
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
}

export const useAIChat = ({
  provider,
  onWorkflowGenerated,
  maxMessages = 50,
}: UseAIChatProps): UseAIChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          provider,
        };

        const response: WorkflowGenerationResponse =
          await generateWorkflowFromPrompt(
            request,
            abortControllerRef.current.signal,
          );

        if (response.success && response.workflow) {
          // Add assistant message with workflow
          addMessage({
            type: "assistant",
            content: response.message,
            workflow: response.workflow,
          });

          // Apply workflow to canvas
          onWorkflowGenerated(response.workflow);
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
    [isGenerating, provider, addMessage, onWorkflowGenerated],
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

  return {
    messages,
    currentMessage,
    setCurrentMessage,
    isGenerating,
    sendMessage,
    clearMessages,
    error,
  };
};
