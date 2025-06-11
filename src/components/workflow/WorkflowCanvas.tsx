import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Node {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: any;
  inputs: string[];
  outputs: string[];
}

interface Connection {
  id: string;
  source: string;
  sourceHandle: string;
  target: string;
  targetHandle: string;
  animated?: boolean;
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
  const canvasRef = useRef<HTMLDivElement>(null);

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

  // Handle node movement
  const handleNodeDrag = (
    nodeId: string,
    position: { x: number; y: number },
  ) => {
    setNodes(
      nodes.map((node) => (node.id === nodeId ? { ...node, position } : node)),
    );
  };

  // Handle zoom in/out
  const handleZoom = (direction: "in" | "out") => {
    setZoom((prev) => {
      const newZoom = direction === "in" ? prev * 1.1 : prev / 1.1;
      return Math.min(Math.max(newZoom, 0.5), 2); // Limit zoom between 0.5 and 2
    });
  };

  // Start creating a connection
  const startConnection = (
    nodeId: string,
    handleId: string,
    event: React.MouseEvent,
  ) => {
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
  };

  // Update dragging connection position
  const updateConnectionPosition = (event: React.MouseEvent) => {
    if (!draggingConnection || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: (event.clientX - rect.left) / zoom - pan.x,
      y: (event.clientY - rect.top) / zoom - pan.y,
    };

    setDraggingConnection({
      ...draggingConnection,
      position,
    });
  };

  // Complete connection creation
  const completeConnection = (targetNodeId: string, targetHandleId: string) => {
    if (!draggingConnection) return;

    const newConnection: Connection = {
      id: `${draggingConnection.source}-${draggingConnection.sourceHandle}-${targetNodeId}-${targetHandleId}`,
      source: draggingConnection.source,
      sourceHandle: draggingConnection.sourceHandle,
      target: targetNodeId,
      targetHandle: targetHandleId,
    };

    setConnections([...connections, newConnection]);
    setDraggingConnection(null);
  };

  // Cancel connection creation
  const cancelConnection = () => {
    setDraggingConnection(null);
  };

  // Handle canvas mouse events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingConnection) {
        updateConnectionPosition(e as unknown as React.MouseEvent);
      }
    };

    const handleMouseUp = () => {
      if (draggingConnection) {
        cancelConnection();
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingConnection]);

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

  // Calculate connection path
  const getConnectionPath = (
    source: { x: number; y: number },
    target: { x: number; y: number },
  ) => {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const midX = source.x + dx / 2;

    return `M${source.x},${source.y} C${midX},${source.y} ${midX},${target.y} ${target.x},${target.y}`;
  };

  // Find node position by ID
  const getNodePosition = (
    nodeId: string,
    handleId: string,
    isOutput: boolean,
  ) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };

    // This is a simplified calculation - in a real app, you'd calculate exact handle positions
    const handleOffset = isOutput ? 20 : 0;
    return {
      x: node.position.x + (isOutput ? 150 : 0),
      y: node.position.y + 30 + handleOffset,
    };
  };

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
        onDragEnd={(_, info) => {
          handleNodeDrag(node.id, {
            x: node.position.x + info.offset.x,
            y: node.position.y + info.offset.y,
          });
        }}
        onClick={(e) => {
          e.stopPropagation();
          handleNodeSelect(node.id);
        }}
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

          {/* Input handles */}
          <div className="mb-2">
            {node.inputs.map((input) => (
              <div
                key={input}
                className="flex items-center mb-1"
                onMouseUp={() =>
                  draggingConnection && completeConnection(node.id, input)
                }
              >
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2 cursor-pointer" />
                <span className="text-xs">{input}</span>
              </div>
            ))}
          </div>

          {/* Output handles */}
          <div>
            {node.outputs.map((output) => (
              <div key={output} className="flex items-center justify-end mb-1">
                <span className="text-xs">{output}</span>
                <div
                  className="w-3 h-3 rounded-full bg-green-500 ml-2 cursor-pointer"
                  onMouseDown={(e) => startConnection(node.id, output, e)}
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
    </div>
  );
};

export default WorkflowCanvas;
