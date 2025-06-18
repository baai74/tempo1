import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  Play,
  Save,
  Database,
  Cpu,
  Globe,
  Zap,
  Bot,
  Filter,
  Settings,
  X,
  RotateCcw,
  Check,
  Move,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AIChat } from "./AIChat";

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  inputs: string[];
  outputs: string[];
  config?: {
    [key: string]: any;
  };
}

interface Connection {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  animated?: boolean;
}

interface SettingsPanel {
  nodeId: string;
  position: { x: number; y: number };
  isMinimized: boolean;
  isDragging: boolean;
}

interface WorkflowCanvasProps {
  onExecute?: (nodes: Node[], connections: Connection[]) => void;
  onSave?: (nodes: Node[], connections: Connection[]) => void;
  nodes?: Node[];
  connections?: Connection[];
  selectedNode?: string | null;
  isExecuting?: boolean;
  onNodeSelect?: (nodeId: string) => void;
}

const WorkflowCanvas = ({
  onExecute = () => {},
  onSave = () => {},
  nodes: initialNodes = [],
  connections: initialConnections = [],
  selectedNode: externalSelectedNode = null,
  isExecuting = false,
  onNodeSelect = () => {},
}: WorkflowCanvasProps) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [connections, setConnections] =
    useState<Connection[]>(initialConnections);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<string | null>(
    externalSelectedNode,
  );
  const [draggingConnection, setDraggingConnection] = useState<{
    source: string;
    sourceHandle: string;
    position: { x: number; y: number };
  } | null>(null);
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel | null>(
    null,
  );
  const [tempConfig, setTempConfig] = useState<{ [key: string]: any }>({});
  const [isDraggingNode, setIsDraggingNode] = useState<string | null>(null);

  // AI Chat state
  const [showAIChat, setShowAIChat] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);

  // Handle node selection
  const handleNodeSelect = (nodeId: string) => {
    const newSelection = nodeId === selectedNode ? null : nodeId;
    setSelectedNode(newSelection);
    onNodeSelect(newSelection || "");
  };

  // Handle drop from NodeLibrary
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    try {
      const nodeData = JSON.parse(
        event.dataTransfer.getData("application/json"),
      );
      const position = {
        x: (event.clientX - rect.left) / zoom - pan.x,
        y: (event.clientY - rect.top) / zoom - pan.y,
      };

      const newNode: Node = {
        id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: nodeData.name,
        position,
        data: nodeData,
        inputs: ["input"],
        outputs: ["output"],
      };

      setNodes([...nodes, newNode]);
    } catch (error) {
      console.error("Failed to parse dropped node data:", error);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  // Handle node movement with improved drag system
  const handleNodeDrag = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) =>
          node.id === nodeId ? { ...node, position: { ...position } } : node,
        ),
      );
    },
    [],
  );

  const handleNodeDragStart = useCallback((nodeId: string) => {
    setIsDraggingNode(nodeId);
  }, []);

  const handleNodeDragEnd = useCallback(() => {
    setIsDraggingNode(null);
  }, []);

  // Handle zoom in/out
  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const newZoom = direction === "in" ? prev * 1.1 : prev / 1.1;
      return Math.min(Math.max(newZoom, 0.5), 2); // Limit zoom between 0.5 and 2
    });
  };

  // Start creating a connection with improved handling
  const startConnection = useCallback(
    (nodeId: string, handleId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const position = {
        x: (event.clientX - rect.left) / zoom - pan.x,
        y: (event.clientY - rect.top) / zoom - pan.y,
      };

      setDraggingConnection({
        source: nodeId,
        sourceHandle: handleId,
        position,
      });
    },
    [zoom, pan],
  );

  // Update dragging connection position with improved performance
  const updateConnectionPosition = useCallback(
    (event: MouseEvent) => {
      if (!draggingConnection || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: (event.clientX - rect.left) / zoom - pan.x,
        y: (event.clientY - rect.top) / zoom - pan.y,
      };

      setDraggingConnection((prev) => {
        if (!prev) return null;
        return { ...prev, position: { ...position } };
      });
    },
    [draggingConnection, zoom, pan],
  );

  // Complete connection creation with validation
  const completeConnection = useCallback(
    (targetNodeId: string, targetHandleId: string) => {
      if (!draggingConnection || draggingConnection.source === targetNodeId) {
        setDraggingConnection(null);
        return;
      }

      // Check if connection already exists
      const connectionExists = connections.some(
        (conn) =>
          conn.source === draggingConnection.source &&
          conn.target === targetNodeId &&
          conn.sourceHandle === draggingConnection.sourceHandle &&
          conn.targetHandle === targetHandleId,
      );

      if (!connectionExists) {
        const newConnection: Connection = {
          id: `${draggingConnection.source}-${draggingConnection.sourceHandle}-${targetNodeId}-${targetHandleId}`,
          source: draggingConnection.source,
          sourceHandle: draggingConnection.sourceHandle,
          target: targetNodeId,
          targetHandle: targetHandleId,
        };

        setConnections((prev) => [...prev, newConnection]);
      }

      setDraggingConnection(null);
    },
    [draggingConnection, connections],
  );

  // Cancel connection creation
  const cancelConnection = useCallback(() => {
    setDraggingConnection(null);
  }, []);

  // Settings panel functions
  const openSettingsPanel = useCallback(
    (nodeId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      setSettingsPanel({
        nodeId,
        position: {
          x: node.position.x + 200,
          y: node.position.y,
        },
        isMinimized: false,
        isDragging: false,
      });

      setTempConfig(node.config || {});
    },
    [nodes],
  );

  const closeSettingsPanel = useCallback(() => {
    setSettingsPanel(null);
    setTempConfig({});
  }, []);

  const minimizeSettingsPanel = useCallback(() => {
    setSettingsPanel((prev) =>
      prev ? { ...prev, isMinimized: !prev.isMinimized } : null,
    );
  }, []);

  const saveNodeConfig = useCallback(() => {
    if (!settingsPanel) return;

    setNodes((prevNodes) =>
      prevNodes.map((node) =>
        node.id === settingsPanel.nodeId
          ? { ...node, config: { ...tempConfig } }
          : node,
      ),
    );

    closeSettingsPanel();
  }, [settingsPanel, tempConfig, closeSettingsPanel]);

  const resetNodeConfig = useCallback(() => {
    if (!settingsPanel) return;

    const node = nodes.find((n) => n.id === settingsPanel.nodeId);
    setTempConfig(node?.config || {});
  }, [settingsPanel, nodes]);

  const handleSettingsPanelDrag = useCallback(
    (position: { x: number; y: number }) => {
      setSettingsPanel((prev) => {
        if (!prev) return null;
        return { ...prev, position: { ...position } };
      });
    },
    [],
  );

  // Handle canvas mouse events with improved performance
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingConnection) {
        updateConnectionPosition(e);
      }
    };

    const handleMouseUp = () => {
      if (draggingConnection) {
        cancelConnection();
      }
    };

    if (draggingConnection) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingConnection, updateConnectionPosition, cancelConnection]);

  // Handle AI-generated workflows
  const handleWorkflowGenerated = useCallback(
    (workflow: { nodes: Node[]; connections: Connection[] }) => {
      setNodes(workflow.nodes);
      setConnections(workflow.connections);
    },
    [],
  );

  // Sync with external selected node
  useEffect(() => {
    if (externalSelectedNode !== selectedNode) {
      setSelectedNode(externalSelectedNode);
    }
  }, [externalSelectedNode]);

  // Handle workflow execution
  const executeWorkflow = () => {
    // Animate connections during execution
    const animatedConnections = connections.map((conn) => ({
      ...conn,
      animated: true,
    }));
    setConnections(animatedConnections);

    // Call the execution handler
    onExecute(nodes, connections);

    // Reset animation after execution
    setTimeout(() => {
      setConnections(connections.map((conn) => ({ ...conn, animated: false })));
    }, 3000);
  };

  // Handle workflow save
  const saveWorkflow = () => {
    onSave(nodes, connections);
  };

  // Get node color based on type
  const getNodeColor = (nodeType: string) => {
    if (nodeType.includes("Scraper")) return "border-l-4 border-orange-500";
    if (nodeType.includes("Database") || nodeType.includes("Sheets"))
      return "border-l-4 border-indigo-500";
    if (
      nodeType.includes("Parser") ||
      nodeType.includes("Filter") ||
      nodeType.includes("Transform") ||
      nodeType.includes("Extract") ||
      nodeType.includes("Validator") ||
      nodeType.includes("Aggregator")
    )
      return "border-l-4 border-cyan-500";
    if (
      nodeType.includes("GPT") ||
      nodeType.includes("Claude") ||
      nodeType.includes("Diffusion")
    )
      return "border-l-4 border-purple-500";
    return "border-l-4 border-gray-400";
  };

  // Get node icon based on type
  const getNodeIcon = (nodeType: string) => {
    if (nodeType.includes("Scraper"))
      return <Globe className="w-4 h-4 text-orange-500" />;
    if (nodeType.includes("Database") || nodeType.includes("Sheets"))
      return <Database className="w-4 h-4 text-indigo-500" />;
    if (
      nodeType.includes("Parser") ||
      nodeType.includes("Filter") ||
      nodeType.includes("Transform") ||
      nodeType.includes("Extract") ||
      nodeType.includes("Validator") ||
      nodeType.includes("Aggregator")
    )
      return <Filter className="w-4 h-4 text-cyan-500" />;
    if (
      nodeType.includes("GPT") ||
      nodeType.includes("Claude") ||
      nodeType.includes("Diffusion")
    )
      return <Bot className="w-4 h-4 text-purple-500" />;
    return <Cpu className="w-4 h-4 text-gray-500" />;
  };

  // Get node description based on type
  const getNodeDescription = (nodeType: string) => {
    const descriptions: { [key: string]: string } = {
      "RapidAPI Scraper": "Scrape data via RapidAPI",
      "AmzChart Scraper": "Amazon product data",
      "AsinData Scraper": "ASIN product details",
      "ScrapeBot Scraper": "Web scraping service",
      "Custom Scraper": "Custom endpoint",
      "JSON Parser": "Parse JSON data",
      "Field Extractor": "Extract fields",
      "Data Filter": "Filter by conditions",
      "Data Transformer": "Transform structure",
      "Data Validator": "Validate schema",
      "Data Aggregator": "Aggregate data",
      "MySQL Database": "MySQL storage",
      "PostgreSQL Database": "PostgreSQL storage",
      "MongoDB Database": "MongoDB storage",
      "Firebase Database": "Firebase storage",
      "Supabase Database": "Supabase storage",
      "Airtable Database": "Airtable storage",
      "Google Sheets": "Sheets storage",
    };
    return descriptions[nodeType] || "Processing node";
  };

  // Calculate connection path with smooth curves
  const getConnectionPath = useCallback(
    (source: { x: number; y: number }, target: { x: number; y: number }) => {
      const dx = target.x - source.x;
      const dy = target.y - source.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const curvature = Math.min(distance * 0.3, 100);

      const controlPoint1 = {
        x: source.x + curvature,
        y: source.y,
      };
      const controlPoint2 = {
        x: target.x - curvature,
        y: target.y,
      };

      return `M${source.x},${source.y} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${target.x},${target.y}`;
    },
    [],
  );

  // Get node position by ID with improved calculations
  const getNodePosition = useCallback(
    (nodeId: string, handleId: string, isOutput: boolean) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return { x: 0, y: 0 };

      const nodeWidth = 180;
      const nodeHeight = 120;
      const handleSize = 12;

      return {
        x: node.position.x + (isOutput ? nodeWidth : -handleSize / 2),
        y: node.position.y + nodeHeight / 2,
      };
    },
    [nodes],
  );

  // Render connection lines
  const renderConnections = () => {
    return connections.map((connection) => {
      const sourcePos = getNodePosition(
        connection.source,
        connection.sourceHandle,
        true,
      );
      const targetPos = getNodePosition(
        connection.target,
        connection.targetHandle,
        false,
      );
      const path = getConnectionPath(sourcePos, targetPos);

      return (
        <svg
          key={connection.id}
          className="absolute top-0 left-0 w-full h-full pointer-events-none"
        >
          <path
            d={path}
            stroke="#6366f1"
            strokeWidth="2"
            fill="none"
            className={connection.animated ? "animate-pulse" : ""}
          />
          {connection.animated && (
            <circle r="4" fill="#6366f1" className="animate-ping">
              <animateMotion dur="1s" repeatCount="indefinite" path={path} />
            </circle>
          )}
        </svg>
      );
    });
  };

  // Render dragging connection
  const renderDraggingConnection = () => {
    if (!draggingConnection) return null;

    const sourcePos = getNodePosition(
      draggingConnection.source,
      draggingConnection.sourceHandle,
      true,
    );
    const path = getConnectionPath(sourcePos, draggingConnection.position);

    return (
      <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <path
          d={path}
          stroke="#6366f1"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
        />
      </svg>
    );
  };

  // Render nodes
  const renderNodes = () => {
    return nodes.map((node) => (
      <motion.div
        key={node.id}
        className={`absolute ${selectedNode === node.id ? "ring-2 ring-primary" : ""}`}
        style={{
          left: node.position.x,
          top: node.position.y,
          touchAction: "none",
        }}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={false}
        onDragStart={() => handleNodeDragStart(node.id)}
        onDragEnd={(e, info) => {
          e.stopPropagation();
          handleNodeDragEnd();
          const newPosition = {
            x: node.position.x + info.offset.x / zoom,
            y: node.position.y + info.offset.y / zoom,
          };
          handleNodeDrag(node.id, newPosition);
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDraggingNode) {
            handleNodeSelect(node.id);
          }
        }}
        whileDrag={{ scale: 1.05, zIndex: 1000 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <Card
          className={`w-[180px] p-3 bg-background shadow-md ${getNodeColor(node.type)}`}
        >
          <div className="flex items-center mb-2">
            {getNodeIcon(node.type)}
            <div className="font-medium text-sm ml-2">{node.type}</div>
          </div>

          {/* Node description */}
          <div className="text-xs text-muted-foreground mb-2">
            {getNodeDescription(node.type)}
          </div>

          {/* Settings button */}
          <div className="flex justify-between items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => openSettingsPanel(node.id, e)}
              className="h-6 w-6 p-0"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>

          {/* Input handles */}
          <div className="mb-2">
            {node.inputs.map((input, index) => (
              <div
                key={input}
                className="flex items-center mb-1 relative"
                onMouseUp={(e) => {
                  e.stopPropagation();
                  if (draggingConnection) {
                    completeConnection(node.id, input);
                  }
                }}
              >
                <div
                  className="w-3 h-3 rounded-full bg-blue-500 mr-2 cursor-pointer hover:bg-blue-600 transition-colors border-2 border-white shadow-sm"
                  style={{
                    position: "absolute",
                    left: "-6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <span className="text-xs ml-2">{input}</span>
              </div>
            ))}
          </div>

          {/* Output handles */}
          <div>
            {node.outputs.map((output, index) => (
              <div
                key={output}
                className="flex items-center justify-end mb-1 relative"
              >
                <span className="text-xs mr-2">{output}</span>
                <div
                  className="w-3 h-3 rounded-full bg-green-500 ml-2 cursor-pointer hover:bg-green-600 transition-colors border-2 border-white shadow-sm"
                  style={{
                    position: "absolute",
                    right: "-6px",
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    startConnection(node.id, output, e);
                  }}
                />
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    ));
  };

  return (
    <div className="relative w-full h-full bg-slate-50 overflow-hidden flex flex-col">
      {/* Toolbar */}
      <div className="bg-background border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleZoom("in")}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleZoom("out")}>
            <Minus className="h-4 w-4" />
          </Button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={showAIChat ? "default" : "outline"}
            size="sm"
            onClick={() => setShowAIChat(!showAIChat)}
          >
            <MessageCircle className="h-4 w-4 mr-1" />
            AI Assistant
          </Button>
          <Button variant="outline" size="sm" onClick={executeWorkflow}>
            <Play className="h-4 w-4 mr-1" />
            Run
          </Button>
          <Button variant="outline" size="sm" onClick={saveWorkflow}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="flex-1 relative overflow-hidden"
        onClick={() => setSelectedNode(null)}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div
          className="absolute w-full h-full"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
            transformOrigin: "0 0",
          }}
        >
          {/* Grid background */}
          <div className="absolute inset-0 bg-grid-pattern" />

          {/* Connections */}
          {renderConnections()}
          {renderDraggingConnection()}

          {/* Nodes */}
          {renderNodes()}
        </div>
      </div>

      {/* Settings Panel */}
      {settingsPanel && (
        <motion.div
          ref={settingsPanelRef}
          className={`fixed z-50 bg-background border rounded-lg shadow-lg ${
            settingsPanel.isMinimized ? "w-12 h-12" : "w-80 h-96"
          }`}
          style={{
            left: settingsPanel.position.x,
            top: settingsPanel.position.y,
          }}
          drag
          dragMomentum={false}
          onDrag={(e, info) => {
            e.stopPropagation();
            const newPosition = {
              x: settingsPanel.position.x + info.offset.x,
              y: settingsPanel.position.y + info.offset.y,
            };
            handleSettingsPanelDrag(newPosition);
          }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          {settingsPanel.isMinimized ? (
            <div
              className="w-full h-full flex items-center justify-center cursor-pointer"
              onClick={minimizeSettingsPanel}
            >
              {getNodeIcon(
                nodes.find((n) => n.id === settingsPanel.nodeId)?.type || "",
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-3 border-b bg-muted/50 rounded-t-lg cursor-move">
                <div className="flex items-center gap-2">
                  <Move className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {nodes.find((n) => n.id === settingsPanel.nodeId)?.type ||
                      "Node"}{" "}
                    Settings
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={minimizeSettingsPanel}
                    className="h-6 w-6 p-0"
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeSettingsPanel}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="general" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={tempConfig.name || ""}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="Enter node name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={tempConfig.description || ""}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeout">Timeout (seconds)</Label>
                      <Input
                        id="timeout"
                        type="number"
                        value={tempConfig.timeout || ""}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            timeout: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="30"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="advanced" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="retries">Retry Count</Label>
                      <Input
                        id="retries"
                        type="number"
                        value={tempConfig.retries || ""}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            retries: parseInt(e.target.value) || 0,
                          }))
                        }
                        placeholder="3"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={tempConfig.priority || "normal"}
                        onValueChange={(value) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            priority: value,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="config">Custom Configuration</Label>
                      <Textarea
                        id="config"
                        value={tempConfig.customConfig || ""}
                        onChange={(e) =>
                          setTempConfig((prev) => ({
                            ...prev,
                            customConfig: e.target.value,
                          }))
                        }
                        placeholder="Enter JSON configuration"
                        rows={4}
                      />
                    </div>
                  </TabsContent>
                </Tabs>
              </ScrollArea>

              {/* Footer */}
              <div className="flex items-center justify-between p-3 border-t bg-muted/50 rounded-b-lg">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetNodeConfig}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={closeSettingsPanel}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveNodeConfig}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* AI Chat Panel */}
      <AIChat
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        onWorkflowGenerated={handleWorkflowGenerated}
      />
    </div>
  );
};

export default WorkflowCanvas;
