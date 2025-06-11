import React, { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import WorkflowCanvas from "./workflow/WorkflowCanvas";
import NodeLibrary from "./workflow/NodeLibrary";
import BottomPanel from "./workflow/BottomPanel";
import ScraperKnowledgeBase from "./workflow/ScraperKnowledgeBase";
import ScraperConfigPanel from "./workflow/ScraperConfigPanel";
import SecretsManager from "./workflow/SecretsManager";
import TestDashboard from "./workflow/TestDashboard";

const Home = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [errors, setErrors] = useState<
    { id: string; message: string; node?: string }[]
  >([]);

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
  };

  const handleExecuteWorkflow = () => {
    setIsExecuting(true);
    setLogs([...logs, "> Starting data pipeline execution..."]);
    setLogs([...logs, "> Initializing scraper connections..."]);
    setLogs([...logs, "> Processing scraped data..."]);
    setLogs([...logs, "> Storing data in databases..."]);

    // Simulate workflow execution
    setTimeout(() => {
      setLogs([...logs, "> Data pipeline execution completed successfully"]);
      setIsExecuting(false);
    }, 3000);
  };

  const handleClearCanvas = () => {
    // This would be implemented with actual canvas clearing logic
    setLogs([...logs, "> Scraper playground canvas cleared"]);
    setSelectedNode(null);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-background">
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h1 className="text-2xl font-bold">Advanced Scraper Playground</h1>
          <p className="text-sm text-muted-foreground">
            Professional scraping tools with AI-powered configuration and
            knowledge base
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            onClick={handleExecuteWorkflow}
            disabled={isExecuting}
          >
            {isExecuting ? "Running Pipeline..." : "Run Data Pipeline"}
          </button>
          <button
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90"
            onClick={handleClearCanvas}
          >
            Clear Canvas
          </button>
        </div>
      </div>

      <Tabs defaultValue="workflow" className="flex-grow flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="workflow">Workflow Builder</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="secrets">Secrets Manager</TabsTrigger>
            <TabsTrigger value="tests">Test Tools</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="workflow" className="flex-grow m-0">
          <ResizablePanelGroup direction="vertical" className="h-full">
            <ResizablePanel defaultSize={75} minSize={30}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
                  <NodeLibrary onNodeSelect={handleNodeSelect} />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={60}>
                  <WorkflowCanvas
                    selectedNode={selectedNode}
                    isExecuting={isExecuting}
                    onNodeSelect={handleNodeSelect}
                    onExecute={handleExecuteWorkflow}
                  />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
                  <ScraperConfigPanel
                    selectedNode={selectedNode}
                    onConfigSave={(config) =>
                      console.log("Config saved:", config)
                    }
                    onTestConnection={async (config) => {
                      // Simulate connection test
                      await new Promise((resolve) => setTimeout(resolve, 2000));
                      return Math.random() > 0.3; // 70% success rate
                    }}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={25} minSize={15}>
              <BottomPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </TabsContent>

        <TabsContent value="knowledge" className="flex-grow m-0">
          <ScraperKnowledgeBase />
        </TabsContent>

        <TabsContent value="secrets" className="flex-grow m-0">
          <SecretsManager />
        </TabsContent>

        <TabsContent value="tests" className="flex-grow m-0">
          <TestDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Home;
