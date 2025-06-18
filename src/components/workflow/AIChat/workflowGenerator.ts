import {
  WorkflowGenerationRequest,
  WorkflowGenerationResponse,
  AIConfiguration,
} from "./types";

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

// Simulate AI API call based on provider
async function callAIProvider(
  prompt: string,
  configuration: AIConfiguration,
  signal?: AbortSignal,
): Promise<{ response: string; actions?: any[] }> {
  // Check if request was cancelled
  if (signal?.aborted) {
    throw new Error("Request cancelled");
  }

  // Simulate API delay based on provider
  const delays = {
    openai: 1000 + Math.random() * 500,
    gemini: 800 + Math.random() * 400,
    openrouter: 1200 + Math.random() * 600,
    "chutes.ai": 900 + Math.random() * 300,
  };

  const delay = delays[configuration.provider as keyof typeof delays] || 1000;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(resolve, delay);

    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timeout);
        reject(new Error("Request cancelled"));
      });
    }
  });

  // Enhanced prompt analysis with MCP server capabilities
  const mcpCapabilities = configuration.mcpServers
    .filter((server) => server.enabled)
    .flatMap((server) => server.capabilities);

  // Simulate intelligent response based on provider and MCP capabilities
  const hasAdvancedCapabilities =
    mcpCapabilities.includes("workflow_analysis") ||
    mcpCapabilities.includes("code_generation");

  const actions = [];

  // Determine if the AI should take autonomous actions
  if (
    prompt.toLowerCase().includes("build") ||
    prompt.toLowerCase().includes("create")
  ) {
    actions.push({ type: "build", parameters: { auto: true } });
  }
  if (prompt.toLowerCase().includes("test")) {
    actions.push({ type: "test", parameters: { auto: true } });
  }
  if (
    prompt.toLowerCase().includes("run") ||
    prompt.toLowerCase().includes("execute")
  ) {
    actions.push({ type: "run", parameters: { auto: true } });
  }

  return {
    response: `Processing with ${configuration.provider} (${configuration.model || "default model"})${hasAdvancedCapabilities ? " with enhanced MCP capabilities" : ""}`,
    actions: actions.length > 0 ? actions : undefined,
  };
}

// Main workflow generation function
export async function generateWorkflowFromPrompt(
  request: WorkflowGenerationRequest,
  signal?: AbortSignal,
): Promise<WorkflowGenerationResponse> {
  try {
    // Call AI provider with configuration
    const aiResponse = await callAIProvider(
      request.prompt,
      request.configuration,
      signal,
    );

    // Analyze prompt to determine workflow type
    const workflowType = analyzePrompt(request.prompt);
    const template = NODE_TEMPLATES[workflowType];

    // Generate nodes and connections
    const nodes = generateWorkflowNodes(template);
    const connections = generateConnections(nodes, template.connections);

    // Create enhanced response message
    const nodeTypes = [...new Set(nodes.map((n) => n.type))];
    const mcpInfo =
      request.configuration.mcpServers.filter((s) => s.enabled).length > 0
        ? ` Enhanced with ${request.configuration.mcpServers.filter((s) => s.enabled).length} MCP server(s).`
        : "";

    const message = `${aiResponse.response}\n\nI've created a ${workflowType.replace("_", " ")} workflow based on your request: "${request.prompt}". The workflow includes ${nodes.length} nodes with the following components: ${nodeTypes.join(", ")}.${mcpInfo} You can customize each node by clicking the settings icon.`;

    return {
      success: true,
      workflow: { nodes, connections },
      message,
      actions: aiResponse.actions,
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
