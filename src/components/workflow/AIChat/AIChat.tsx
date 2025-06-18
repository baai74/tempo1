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
  Settings,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Server,
  Key,
  Sliders,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { useAIChat } from "./useAIChat";
import { AIProvider, ChatMessage, MCPServer, AIConfiguration } from "./types";

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowGenerated: (workflow: { nodes: any[]; connections: any[] }) => void;
  onWorkflowAction: (action: {
    type: string;
    target?: string;
    parameters?: any;
  }) => void;
  className?: string;
}

const aiProviders: AIProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT models",
    icon: <Sparkles className="w-4 h-4" />,
    requiresApiKey: true,
    models: ["gpt-4", "gpt-4-turbo", "gpt-3.5-turbo"],
  },
  {
    id: "gemini",
    name: "Google Gemini",
    description: "Google's AI models",
    icon: <Bot className="w-4 h-4" />,
    requiresApiKey: true,
    models: ["gemini-pro", "gemini-pro-vision"],
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "Access to multiple AI models",
    icon: <Zap className="w-4 h-4" />,
    requiresApiKey: true,
    models: ["openai/gpt-4", "anthropic/claude-3", "meta-llama/llama-2-70b"],
  },
  {
    id: "chutes.ai",
    name: "Chutes.ai",
    description: "Specialized workflow AI",
    icon: <Server className="w-4 h-4" />,
    requiresApiKey: true,
    models: ["chutes-workflow-v1", "chutes-automation-v2"],
  },
];

const AIChat: React.FC<AIChatProps> = ({
  isOpen,
  onClose,
  onWorkflowGenerated,
  onWorkflowAction,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [newMCPServer, setNewMCPServer] = useState<Partial<MCPServer>>({});
  const chatScrollRef = useRef<HTMLDivElement>(null);

  const initialConfiguration: AIConfiguration = {
    provider: "openai",
    apiKey: "",
    model: "gpt-4",
    temperature: 0.7,
    maxTokens: 2000,
    mcpServers: [],
  };

  const {
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
  } = useAIChat({
    configuration: initialConfiguration,
    onWorkflowGenerated,
    onWorkflowAction,
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
      if (message.action) {
        onWorkflowAction(message.action);
      }
    },
    [onWorkflowGenerated, onWorkflowAction],
  );

  const handleAddMCPServer = useCallback(() => {
    if (newMCPServer.name && newMCPServer.url) {
      const server: MCPServer = {
        id: `mcp-${Date.now()}`,
        name: newMCPServer.name,
        url: newMCPServer.url,
        description: newMCPServer.description || "",
        enabled: true,
        capabilities: newMCPServer.capabilities || ["workflow_analysis"],
      };
      addMCPServer(server);
      setNewMCPServer({});
    }
  }, [newMCPServer, addMCPServer]);

  const selectedProvider = aiProviders.find(
    (p) => p.id === configuration.provider,
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {selectedProvider?.icon}
                    <div>
                      <div className="font-medium text-sm">
                        {selectedProvider?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {configuration.model || "Default model"}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfiguration(!showConfiguration)}
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                {messages.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearMessages}
                    className="w-full mt-2"
                  >
                    Clear Chat
                  </Button>
                )}
              </>
            )}
          </CardHeader>

          {isExpanded && (
            <>
              {showConfiguration ? (
                /* Configuration Panel */
                <CardContent className="flex-1 p-4">
                  <Tabs defaultValue="provider" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="provider">Provider</TabsTrigger>
                      <TabsTrigger value="mcp">MCP Servers</TabsTrigger>
                    </TabsList>

                    <TabsContent value="provider" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          AI Provider
                        </Label>
                        <Select
                          value={configuration.provider}
                          onValueChange={(value) =>
                            updateConfiguration({ provider: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {aiProviders.map((provider) => (
                              <SelectItem key={provider.id} value={provider.id}>
                                <div className="flex items-center gap-2">
                                  {provider.icon}
                                  <div>
                                    <div className="font-medium">
                                      {provider.name}
                                    </div>
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

                      {selectedProvider?.requiresApiKey && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <Key className="h-3 w-3" />
                            API Key
                          </Label>
                          <Input
                            type="password"
                            value={configuration.apiKey || ""}
                            onChange={(e) =>
                              updateConfiguration({ apiKey: e.target.value })
                            }
                            placeholder="Enter your API key"
                          />
                        </div>
                      )}

                      {selectedProvider?.models && (
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Model</Label>
                          <Select
                            value={
                              configuration.model || selectedProvider.models[0]
                            }
                            onValueChange={(value) =>
                              updateConfiguration({ model: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {selectedProvider.models.map((model) => (
                                <SelectItem key={model} value={model}>
                                  {model}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <Sliders className="h-3 w-3" />
                          Temperature: {configuration.temperature}
                        </Label>
                        <Slider
                          value={[configuration.temperature || 0.7]}
                          onValueChange={([value]) =>
                            updateConfiguration({ temperature: value })
                          }
                          max={1}
                          min={0}
                          step={0.1}
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Max Tokens
                        </Label>
                        <Input
                          type="number"
                          value={configuration.maxTokens || 2000}
                          onChange={(e) =>
                            updateConfiguration({
                              maxTokens: parseInt(e.target.value),
                            })
                          }
                          placeholder="2000"
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="mcp" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-1">
                          <Server className="h-3 w-3" />
                          MCP Servers
                        </Label>
                        <div className="space-y-2">
                          {configuration.mcpServers.map((server) => (
                            <div
                              key={server.id}
                              className="flex items-center justify-between p-2 border rounded"
                            >
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={server.enabled}
                                  onCheckedChange={() =>
                                    toggleMCPServer(server.id)
                                  }
                                />
                                <div>
                                  <div className="font-medium text-sm">
                                    {server.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {server.url}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeMCPServer(server.id)}
                                className="h-6 w-6 p-0"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Add New MCP Server
                        </Label>
                        <Input
                          value={newMCPServer.name || ""}
                          onChange={(e) =>
                            setNewMCPServer((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Server name"
                        />
                        <Input
                          value={newMCPServer.url || ""}
                          onChange={(e) =>
                            setNewMCPServer((prev) => ({
                              ...prev,
                              url: e.target.value,
                            }))
                          }
                          placeholder="Server URL"
                        />
                        <Textarea
                          value={newMCPServer.description || ""}
                          onChange={(e) =>
                            setNewMCPServer((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Description (optional)"
                          rows={2}
                        />
                        <Button
                          onClick={handleAddMCPServer}
                          disabled={!newMCPServer.name || !newMCPServer.url}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Server
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              ) : (
                /* Messages */
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
                            build it for you autonomously.
                          </p>
                          <div className="space-y-2">
                            <Badge variant="outline" className="text-xs block">
                              "Create and test a data scraping workflow"
                            </Badge>
                            <Badge variant="outline" className="text-xs block">
                              "Build and run an AI content analyzer"
                            </Badge>
                            <Badge variant="outline" className="text-xs block">
                              "Set up and execute a webhook processor"
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

                            {(message.workflow || message.action) && (
                              <div className="mt-2 pt-2 border-t border-border/50 flex gap-1">
                                {message.workflow && (
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
                                )}
                                {message.action && (
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Action: {message.action.type}
                                  </Badge>
                                )}
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
              )}

              {/* Input */}
              {!showConfiguration && (
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
              )}
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AIChat;
