import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  X,
  ChevronUp,
  ChevronDown,
  Send,
  Loader2,
  Sparkles,
  MessageCircle,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAIChat } from "./useAIChat";
import { AIProvider, ChatMessage } from "./types";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (workflow: { nodes: any[]; connections: any[] }) => void;
  className?: string;
}

const aiProviders: AIProvider[] = [
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access to multiple AI models",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: "chutes",
    name: "Chutes.ai",
    description: "Specialized workflow AI",
    icon: <Bot className="w-4 h-4" />,
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT models",
    icon: <Sparkles className="w-4 h-4" />,
  },
];

const AIChat: React.FC<AIChatProps> = ({
  isOpen,
  onClose,
  onWorkflowGenerated,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState("openrouter");
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    currentMessage,
    setCurrentMessage,
    isGenerating,
    sendMessage,
    clearMessages,
    error,
  } = useAIChat({
    provider: selectedProvider,
    onWorkflowGenerated,
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = useCallback(() => {
    if (!currentMessage.trim() || isGenerating) return;
    sendMessage(currentMessage);
  }, [currentMessage, isGenerating, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage],
  );

  const applyWorkflowFromMessage = useCallback(
    (message: ChatMessage) => {
      if (message.workflow) {
        onWorkflowGenerated(message.workflow);
      }
    },
    [onWorkflowGenerated],
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed right-4 top-20 bottom-4 w-96 z-40 ${className}`}
        initial={{ opacity: 0, x: 400 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 400 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card className="h-full flex flex-col bg-background shadow-xl border">
          {/* Header */}
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">AI Workflow Builder</CardTitle>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-8 w-8 p-0"
                  aria-label={isExpanded ? "Collapse chat" : "Expand chat"}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                  aria-label="Close chat"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isExpanded && (
              <>
                <Separator className="my-2" />
                <div className="space-y-2">
                  <Label className="text-sm font-medium">AI Provider</Label>
                  <Select
                    value={selectedProvider}
                    onValueChange={setSelectedProvider}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aiProviders.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div className="flex items-center gap-2">
                            {provider.icon}
                            <div>
                              <div className="font-medium">{provider.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {provider.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearMessages}
                    className="w-full"
                  >
                    Clear Chat
                  </Button>
                )}
              </>
            )}
          </CardHeader>

          {isExpanded && (
            <>
              {/* Messages */}
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4" ref={chatScrollRef}>
                  <div className="space-y-4 pb-4">
                    {messages.length === 0 && (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground mb-2">
                          Welcome to AI Workflow Builder!
                        </p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Describe the workflow you want to create and I'll
                          build it for you.
                        </p>
                        <div className="space-y-2">
                          <Badge variant="outline" className="text-xs block">
                            "Create a data scraping workflow"
                          </Badge>
                          <Badge variant="outline" className="text-xs block">
                            "Build an AI content analyzer"
                          </Badge>
                          <Badge variant="outline" className="text-xs block">
                            "Set up a webhook processor"
                          </Badge>
                        </div>
                      </div>
                    )}

                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.type === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.type !== "user" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <Bot className="h-4 w-4 text-primary" />
                            </div>
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            message.type === "user"
                              ? "bg-primary text-primary-foreground"
                              : message.type === "error"
                                ? "bg-destructive/10 text-destructive border border-destructive/20"
                                : "bg-muted"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {message.content}
                          </p>
                          <p className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </p>

                          {message.workflow && (
                            <div className="mt-2 pt-2 border-t border-border/50">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  applyWorkflowFromMessage(message)
                                }
                                className="h-6 text-xs"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Apply Workflow
                              </Button>
                            </div>
                          )}
                        </div>

                        {message.type === "user" && (
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                              <span className="text-xs text-primary-foreground font-medium">
                                U
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {isGenerating && (
                      <div className="flex gap-3 justify-start">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Loader2 className="h-4 w-4 text-primary animate-spin" />
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg px-3 py-2">
                          <p className="text-sm">Generating workflow...</p>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                        <p className="text-sm text-destructive">{error}</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    placeholder="Describe the workflow you want to create..."
                    onKeyDown={handleKeyDown}
                    disabled={isGenerating}
                    className="flex-1"
                    aria-label="Chat message input"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim() || isGenerating}
                    size="sm"
                    aria-label="Send message"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChat;
