import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import {
  ChevronUp,
  ChevronDown,
  Terminal,
  AlertCircle,
  X,
  RefreshCw,
  Copy,
  CheckCircle,
} from "lucide-react";

interface BottomPanelProps {
  isOpen?: boolean;
  onToggle?: () => void;
}

const BottomPanel: React.FC<BottomPanelProps> = ({
  isOpen = true,
  onToggle = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<string>("terminal");
  const [terminalInput, setTerminalInput] = useState<string>("");
  const [terminalHistory, setTerminalHistory] = useState<
    Array<{ type: string; content: string }>
  >([
    {
      type: "system",
      content:
        "Scraper Playground initialized at " + new Date().toLocaleTimeString(),
    },
    { type: "info", content: "Loading scraper providers..." },
    {
      type: "success",
      content: "RapidAPI, AmzChart, AsinData, ScrapeBot ready",
    },
    { type: "info", content: "Data processing nodes loaded" },
    { type: "success", content: "Database connections available" },
  ]);
  const [errors, setErrors] = useState<
    Array<{ id: string; title: string; description: string; severity: string }>
  >([
    {
      id: "err-001",
      title: "Scraper API Key Missing",
      description:
        "RapidAPI scraper requires a valid API key. Please configure your credentials in the node settings.",
      severity: "high",
    },
    {
      id: "err-002",
      title: "Data Processing Error",
      description:
        "JSON Parser failed to parse scraped data. Check data format and structure.",
      severity: "medium",
    },
    {
      id: "err-003",
      title: "Database Connection Failed",
      description:
        "Unable to connect to PostgreSQL database. Verify connection string and credentials.",
      severity: "high",
    },
  ]);

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    setTerminalHistory((prev) => [
      ...prev,
      { type: "command", content: `$ ${terminalInput}` },
    ]);

    // Mock response
    setTimeout(() => {
      setTerminalHistory((prev) => [
        ...prev,
        {
          type: "response",
          content: `Executed command: ${terminalInput}`,
        },
      ]);
    }, 300);

    setTerminalInput("");
  };

  const dismissError = (id: string) => {
    setErrors(errors.filter((error) => error.id !== id));
  };

  return (
    <div className="bg-background border-t border-border w-full">
      <div className="flex justify-between items-center px-4 py-1 border-b border-border">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={onToggle}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Button>
          <span className="text-sm font-medium">Console</span>
        </div>
        <div className="flex items-center space-x-1">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <RefreshCw size={14} />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="h-64">
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="border-b border-border px-4">
              <TabsList className="bg-transparent h-8">
                <TabsTrigger
                  value="terminal"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-8"
                >
                  <Terminal size={14} className="mr-2" />
                  Terminal
                </TabsTrigger>
                <TabsTrigger
                  value="errors"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-8"
                >
                  <AlertCircle size={14} className="mr-2" />
                  Errors {errors.length > 0 && `(${errors.length})`}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="terminal"
              className="p-0 m-0 h-[calc(100%-36px)]"
            >
              <div className="flex flex-col h-full">
                <ScrollArea className="flex-1 p-4 font-mono text-sm">
                  {terminalHistory.map((entry, index) => (
                    <div
                      key={index}
                      className={`mb-1 ${entry.type === "command" ? "text-blue-500" : entry.type === "error" ? "text-red-500" : entry.type === "success" ? "text-green-500" : entry.type === "info" ? "text-yellow-500" : "text-muted-foreground"}`}
                    >
                      {entry.content}
                    </div>
                  ))}
                </ScrollArea>
                <Separator />
                <form
                  onSubmit={handleTerminalSubmit}
                  className="p-2 flex items-center"
                >
                  <span className="text-muted-foreground mr-2">$</span>
                  <Input
                    value={terminalInput}
                    onChange={(e) => setTerminalInput(e.target.value)}
                    placeholder="Enter command..."
                    className="flex-1 border-none focus-visible:ring-0 bg-transparent"
                  />
                </form>
              </div>
            </TabsContent>

            <TabsContent value="errors" className="p-0 m-0 h-[calc(100%-36px)]">
              <ScrollArea className="h-full p-4">
                {errors.length > 0 ? (
                  <div className="space-y-3">
                    {errors.map((error) => (
                      <Alert
                        key={error.id}
                        variant={
                          error.severity === "high" ? "destructive" : "default"
                        }
                        className="relative"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-2 h-6 w-6 p-0"
                          onClick={() => dismissError(error.id)}
                        >
                          <X size={14} />
                        </Button>
                        <div className="flex items-start">
                          <div>
                            <AlertCircle className="h-4 w-4 mr-2" />
                          </div>
                          <div className="flex-1">
                            <AlertTitle className="flex items-center">
                              {error.title}
                              <span
                                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${error.severity === "high" ? "bg-red-200 text-red-800" : error.severity === "medium" ? "bg-yellow-200 text-yellow-800" : "bg-blue-200 text-blue-800"}`}
                              >
                                {error.severity}
                              </span>
                            </AlertTitle>
                            <AlertDescription className="mt-1">
                              {error.description}
                            </AlertDescription>
                            <div className="mt-2 flex space-x-2">
                              <Button size="sm" variant="outline">
                                <RefreshCw size={14} className="mr-1" />
                                Retry
                              </Button>
                              <Button size="sm" variant="outline">
                                <Copy size={14} className="mr-1" />
                                Copy Details
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-green-600"
                              >
                                <CheckCircle size={14} className="mr-1" />
                                Resolve
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <CheckCircle size={24} className="mb-2" />
                    <p>No errors to display</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default BottomPanel;
