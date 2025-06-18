import { WorkflowGenerationRequest, WorkflowGenerationResponse } from "./types";

// Node templates for different workflow types
const NODE_TEMPLATES = {
  scraping: {
    nodes: [
      {
        type: "HTTP Request",
        name: "Data Source",
        description: "Fetch data from API or website",
        config: { method: "GET", timeout: 30 },
      },
      {
        type: "JSON Parser",
        name: "Parse Response",
        description: "Extract and parse JSON data",
        config: { validateSchema: true },
      },
      {
        type: "Data Filter",
        name: "Filter Data",
        description: "Filter relevant information",
        config: { conditions: [] },
      },
      {
        type: "Database Storage",
        name: "Store Results",
        description: "Save processed data",
        config: { table: "scraped_data" },
      },
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
    ],
  },
  ai_processing: {
    nodes: [
      {
        type: "HTTP Request",
        name: "Input Handler",
        description: "Receive input data",
        config: { method: "POST" },
      },
      {
        type: "Text Preprocessor",
        name: "Prepare Text",
        description: "Clean and prepare text for AI",
        config: { removeHtml: true, normalize: true },
      },
      {
        type: "AI Model",
        name: "AI Analysis",
        description: "Process with AI model",
        config: { model: "gpt-4", temperature: 0.7 },
      },
      {
        type: "Response Formatter",
        name: "Format Output",
        description: "Format AI response",
        config: { format: "json" },
      },
      {
        type: "Webhook",
        name: "Send Results",
        description: "Send processed results",
        config: { method: "POST" },
      },
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
    ],
  },
  data_pipeline: {
    nodes: [
      {
        type: "Data Source",
        name: "Input Data",
        description: "Source of raw data",
        config: { source: "api" },
      },
      {
        type: "Data Validator",
        name: "Validate Schema",
        description: "Validate data structure",
        config: { strict: true },
      },
      {
        type: "Data Transformer",
        name: "Transform Data",
        description: "Apply transformations",
        config: { operations: [] },
      },
      {
        type: "Data Aggregator",
        name: "Aggregate Results",
        description: "Combine and summarize data",
        config: { groupBy: [] },
      },
      {
        type: "Output Handler",
        name: "Export Data",
        description: "Export processed data",
        config: { format: "json" },
      },
    ],
    connections: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
    ],
  },
};

// Analyze prompt to determine workflow type
function analyzePrompt(prompt: string): keyof typeof NODE_TEMPLATES {
  const lowerPrompt = prompt.toLowerCase();

  if (
    lowerPrompt.includes("scrape") ||
    lowerPrompt.includes("extract") ||
    lowerPrompt.includes("crawl") ||
    lowerPrompt.includes("fetch data")
  ) {
    return "scraping";
  }

  if (
    lowerPrompt.includes("ai") ||
    lowerPrompt.includes("gpt") ||
    lowerPrompt.includes("analyze") ||
    lowerPrompt.includes("process text") ||
    lowerPrompt.includes("nlp")
  ) {
    return "ai_processing";
  }

  if (
    lowerPrompt.includes("pipeline") ||
    lowerPrompt.includes("transform") ||
    lowerPrompt.includes("aggregate") ||
    lowerPrompt.includes("process data")
  ) {
    return "data_pipeline";
  }

  // Default to data pipeline for generic requests
  return "data_pipeline";
}

// Generate workflow nodes with proper positioning
function generateWorkflowNodes(
  template: (typeof NODE_TEMPLATES)[keyof typeof NODE_TEMPLATES],
) {
  const nodes = template.nodes.map((nodeTemplate, index) => {
    const xSpacing = 280;
    const yOffset = 100;

    return {
      id: `node-${Date.now()}-${index}`,
      type: nodeTemplate.type,
      position: {
        x: 100 + index * xSpacing,
        y: yOffset + Math.floor(index / 4) * 200, // Wrap to new row every 4 nodes
      },
      data: {
        name: nodeTemplate.name,
        description: nodeTemplate.description,
      },
      inputs: ["input"],
      outputs: ["output"],
      config: nodeTemplate.config,
    };
  });

  return nodes;
}

// Generate connections between nodes
function generateConnections(
  nodes: any[],
  connectionTemplate: { from: number; to: number }[],
) {
  return connectionTemplate.map((conn, index) => {
    const sourceNode = nodes[conn.from];
    const targetNode = nodes[conn.to];

    if (!sourceNode || !targetNode) {
      throw new Error(`Invalid connection: node ${conn.from} -> ${conn.to}`);
    }

    return {
      id: `conn-${Date.now()}-${index}`,
      source: sourceNode.id,
      sourceHandle: "output",
      target: targetNode.id,
      targetHandle: "input",
    };
  });
}

// Main workflow generation function
export async function generateWorkflowFromPrompt(
  request: WorkflowGenerationRequest,
  signal?: AbortSignal,
): Promise<WorkflowGenerationResponse> {
  try {
    // Check if request was cancelled
    if (signal?.aborted) {
      throw new Error("Request cancelled");
    }

    // Simulate API delay (replace with real API call)
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, 1500 + Math.random() * 1000);

      if (signal) {
        signal.addEventListener("abort", () => {
          clearTimeout(timeout);
          reject(new Error("Request cancelled"));
        });
      }
    });

    // Analyze prompt to determine workflow type
    const workflowType = analyzePrompt(request.prompt);
    const template = NODE_TEMPLATES[workflowType];

    // Generate nodes and connections
    const nodes = generateWorkflowNodes(template);
    const connections = generateConnections(nodes, template.connections);

    // Create response message
    const nodeTypes = [...new Set(nodes.map((n) => n.type))];
    const message = `I've created a ${workflowType.replace("_", " ")} workflow based on your request: "${request.prompt}". The workflow includes ${nodes.length} nodes with the following components: ${nodeTypes.join(", ")}. You can customize each node by clicking the settings icon.`;

    return {
      success: true,
      workflow: { nodes, connections },
      message,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "Request cancelled") {
      throw error; // Re-throw cancellation errors
    }

    return {
      success: false,
      message: "Failed to generate workflow",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
