import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Database,
  Zap,
  Code,
  CheckCircle,
  Copy,
  Play,
  Settings,
  FileCode,
  Globe,
  Shield,
  AlertCircle,
  Info,
} from "lucide-react";

interface CodeExample {
  id: string;
  title: string;
  description: string;
  category: string;
  language: string;
  code: string;
  dependencies?: string[];
}

const HasuraIntegration: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("client");
  const [testEndpoint, setTestEndpoint] = useState<string>(
    "http://localhost:8080/v1/graphql",
  );
  const [testSecret, setTestSecret] = useState<string>("");
  const [testResult, setTestResult] = useState<string>("");
  const [testing, setTesting] = useState<boolean>(false);

  const codeExamples: CodeExample[] = [
    {
      id: "graphql-client",
      title: "GraphQL Client Setup",
      description: "Configure Apollo Client or similar for React integration",
      category: "client",
      language: "typescript",
      code: `// src/lib/graphql-client.ts
import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_HASURA_ENDPOINT || 'http://localhost:8080/v1/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('auth-token');
  return {
    headers: {
      ...headers,
      authorization: token ? \`Bearer \${token}\` : "",
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET || '',
    }
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(\`GraphQL error: \${message}\`)
    );
  }
  if (networkError) {
    console.log(\`Network error: \${networkError}\`);
  }
});

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});`,
      dependencies: ["@apollo/client", "graphql"],
    },
    {
      id: "workflow-queries",
      title: "Workflow GraphQL Queries",
      description: "Essential queries for workflow management",
      category: "queries",
      language: "graphql",
      code: `# Get all workflows for a user
query GetUserWorkflows($userId: uuid!) {
  workflows(where: { user_id: { _eq: $userId } }, order_by: { updated_at: desc }) {
    id
    name
    description
    status
    config
    created_at
    updated_at
    nodes {
      id
      type
      name
      config
      position_x
      position_y
    }
    connections {
      id
      source_node_id
      target_node_id
      source_handle
      target_handle
    }
  }
}

# Create a new workflow
mutation CreateWorkflow($input: workflows_insert_input!) {
  insert_workflows_one(object: $input) {
    id
    name
    description
    status
    created_at
  }
}

# Update workflow configuration
mutation UpdateWorkflow($id: uuid!, $config: jsonb!) {
  update_workflows_by_pk(pk_columns: { id: $id }, _set: { config: $config, updated_at: "now()" }) {
    id
    name
    config
    updated_at
  }
}

# Subscribe to workflow execution updates
subscription WorkflowExecutionUpdates($workflowId: uuid!) {
  workflow_executions(
    where: { workflow_id: { _eq: $workflowId } }
    order_by: { started_at: desc }
    limit: 1
  ) {
    id
    status
    progress
    logs
    error_message
    started_at
    completed_at
  }
}`,
      dependencies: [],
    },
    {
      id: "react-hooks",
      title: "React Hooks for Workflows",
      description: "Custom hooks for workflow operations",
      category: "hooks",
      language: "typescript",
      code: `// src/hooks/useWorkflows.ts
import { useQuery, useMutation, useSubscription } from '@apollo/client';
import { GET_USER_WORKFLOWS, CREATE_WORKFLOW, UPDATE_WORKFLOW } from '../graphql/workflows';

export const useWorkflows = (userId: string) => {
  const { data, loading, error, refetch } = useQuery(GET_USER_WORKFLOWS, {
    variables: { userId },
    skip: !userId,
  });

  const [createWorkflow] = useMutation(CREATE_WORKFLOW, {
    refetchQueries: [{ query: GET_USER_WORKFLOWS, variables: { userId } }],
  });

  const [updateWorkflow] = useMutation(UPDATE_WORKFLOW);

  const handleCreateWorkflow = async (input: any) => {
    try {
      const result = await createWorkflow({
        variables: {
          input: {
            ...input,
            user_id: userId,
          },
        },
      });
      return result.data?.insert_workflows_one;
    } catch (error) {
      console.error('Error creating workflow:', error);
      throw error;
    }
  };

  const handleUpdateWorkflow = async (id: string, config: any) => {
    try {
      const result = await updateWorkflow({
        variables: { id, config },
      });
      return result.data?.update_workflows_by_pk;
    } catch (error) {
      console.error('Error updating workflow:', error);
      throw error;
    }
  };

  return {
    workflows: data?.workflows || [],
    loading,
    error,
    refetch,
    createWorkflow: handleCreateWorkflow,
    updateWorkflow: handleUpdateWorkflow,
  };
};

// src/hooks/useWorkflowExecution.ts
export const useWorkflowExecution = (workflowId: string) => {
  const { data, loading } = useSubscription(WORKFLOW_EXECUTION_UPDATES, {
    variables: { workflowId },
    skip: !workflowId,
  });

  const execution = data?.workflow_executions?.[0];

  return {
    execution,
    loading,
    isRunning: execution?.status === 'running',
    isCompleted: execution?.status === 'completed',
    hasError: execution?.status === 'error',
    progress: execution?.progress || 0,
    logs: execution?.logs || [],
    errorMessage: execution?.error_message,
  };
};`,
      dependencies: ["@apollo/client"],
    },
    {
      id: "permissions",
      title: "Hasura Permissions Setup",
      description: "Row-level security configuration",
      category: "security",
      language: "json",
      code: `{
  "role": "user",
  "permission": {
    "columns": [
      "id",
      "name",
      "description",
      "status",
      "config",
      "created_at",
      "updated_at"
    ],
    "filter": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    },
    "allow_aggregations": true
  }
}

// Insert permission for workflows table
{
  "role": "user",
  "permission": {
    "check": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    },
    "columns": [
      "name",
      "description",
      "status",
      "config",
      "user_id"
    ],
    "set": {
      "user_id": "X-Hasura-User-Id"
    }
  }
}

// Update permission for workflows table
{
  "role": "user",
  "permission": {
    "columns": [
      "name",
      "description",
      "status",
      "config"
    ],
    "filter": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    },
    "check": {
      "user_id": {
        "_eq": "X-Hasura-User-Id"
      }
    }
  }
}`,
      dependencies: [],
    },
    {
      id: "actions",
      title: "Custom Actions for Workflow Execution",
      description: "Server-side logic for workflow processing",
      category: "actions",
      language: "typescript",
      code: `// actions/execute-workflow.ts
import { Request, Response } from 'express';
import { WorkflowExecutor } from '../services/workflow-executor';

interface ExecuteWorkflowInput {
  workflowId: string;
  input?: any;
}

interface ExecuteWorkflowOutput {
  executionId: string;
  status: string;
  message: string;
}

export const executeWorkflow = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { workflowId, input }: ExecuteWorkflowInput = req.body.input;
    const userId = req.headers['x-hasura-user-id'] as string;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Validate workflow ownership
    const workflow = await getWorkflowById(workflowId, userId);
    if (!workflow) {
      res.status(404).json({ message: 'Workflow not found' });
      return;
    }

    // Create execution record
    const execution = await createExecution({
      workflow_id: workflowId,
      user_id: userId,
      status: 'running',
      started_at: new Date(),
    });

    // Start workflow execution asynchronously
    const executor = new WorkflowExecutor();
    executor.execute(workflow, execution.id, input).catch((error) => {
      console.error('Workflow execution failed:', error);
      updateExecution(execution.id, {
        status: 'error',
        error_message: error.message,
        completed_at: new Date(),
      });
    });

    const output: ExecuteWorkflowOutput = {
      executionId: execution.id,
      status: 'started',
      message: 'Workflow execution started successfully',
    };

    res.json(output);
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Hasura Action definition
const actionDefinition = {
  name: 'executeWorkflow',
  definition: {
    kind: 'synchronous',
    handler: 'http://localhost:3001/actions/execute-workflow',
    forward_client_headers: true,
    headers: [
      {
        name: 'x-hasura-admin-secret',
        value_from_env: 'HASURA_GRAPHQL_ADMIN_SECRET',
      },
    ],
  },
  permissions: [
    {
      role: 'user',
    },
  ],
};`,
      dependencies: ["express", "@types/express"],
    },
    {
      id: "event-triggers",
      title: "Event Triggers Configuration",
      description: "Automatic webhooks for data changes",
      category: "events",
      language: "json",
      code: `// Workflow created event trigger
{
  "name": "workflow_created",
  "table": {
    "name": "workflows",
    "schema": "public"
  },
  "webhook": "http://localhost:3001/webhooks/workflow-created",
  "insert": {
    "columns": "*"
  },
  "headers": [
    {
      "name": "x-webhook-secret",
      "value_from_env": "WEBHOOK_SECRET"
    }
  ],
  "retry_conf": {
    "num_retries": 3,
    "interval_sec": 10,
    "timeout_sec": 60
  }
}

// Workflow execution status change trigger
{
  "name": "workflow_execution_status_changed",
  "table": {
    "name": "workflow_executions",
    "schema": "public"
  },
  "webhook": "http://localhost:3001/webhooks/execution-status-changed",
  "update": {
    "columns": ["status", "progress", "error_message", "completed_at"]
  },
  "headers": [
    {
      "name": "x-webhook-secret",
      "value_from_env": "WEBHOOK_SECRET"
    }
  ]
}

// Webhook handler example
// webhooks/workflow-created.ts
export const workflowCreatedHandler = async (req: Request, res: Response) => {
  try {
    const { event } = req.body;
    const workflow = event.data.new;
    
    // Send welcome email
    await sendWorkflowCreatedEmail(workflow.user_id, workflow.name);
    
    // Initialize default nodes if template
    if (workflow.template_id) {
      await initializeWorkflowFromTemplate(workflow.id, workflow.template_id);
    }
    
    // Log analytics event
    await trackEvent('workflow_created', {
      user_id: workflow.user_id,
      workflow_id: workflow.id,
      template_id: workflow.template_id,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Workflow created webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};`,
      dependencies: [],
    },
  ];

  const categories = [
    { id: "client", name: "Client Setup", icon: Code },
    { id: "queries", name: "GraphQL Queries", icon: Database },
    { id: "hooks", name: "React Hooks", icon: Zap },
    { id: "security", name: "Security", icon: Shield },
    { id: "actions", name: "Custom Actions", icon: Settings },
    { id: "events", name: "Event Triggers", icon: Globe },
  ];

  const filteredExamples = codeExamples.filter(
    (example) => example.category === selectedCategory,
  );

  const testConnection = async () => {
    setTesting(true);
    setTestResult("");

    try {
      const query = `
        query {
          __schema {
            queryType {
              name
            }
          }
        }
      `;

      const response = await fetch(testEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(testSecret && { "x-hasura-admin-secret": testSecret }),
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setTestResult(
          "✅ Connection successful! Hasura GraphQL API is accessible.",
        );
      } else {
        setTestResult(
          `❌ Connection failed: ${result.errors?.[0]?.message || "Unknown error"}`,
        );
      }
    } catch (error) {
      setTestResult(
        `❌ Connection failed: ${error instanceof Error ? error.message : "Network error"}`,
      );
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Hasura Integration</h2>
            <p className="text-muted-foreground">
              Code examples and integration patterns for your workflow builder
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {filteredExamples.length} Examples
          </Badge>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.id}
                variant={
                  selectedCategory === category.id ? "default" : "outline"
                }
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className="flex items-center gap-2"
              >
                <Icon className="h-3 w-3" />
                {category.name}
              </Button>
            );
          })}
        </div>
      </div>

      <Tabs defaultValue="examples" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="examples">Code Examples</TabsTrigger>
            <TabsTrigger value="test">Connection Test</TabsTrigger>
            <TabsTrigger value="setup">Quick Setup</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="examples" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {filteredExamples.map((example) => (
                <Card
                  key={example.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {example.title}
                          <Badge variant="outline">{example.language}</Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          {example.description}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(example.code)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {example.dependencies &&
                      example.dependencies.length > 0 && (
                        <Alert className="mb-4">
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <strong>Dependencies:</strong>{" "}
                            {example.dependencies.join(", ")}
                          </AlertDescription>
                        </Alert>
                      )}

                    <div className="bg-muted rounded-md">
                      <ScrollArea className="h-64">
                        <pre className="p-4 text-sm font-mono overflow-x-auto">
                          <code>{example.code}</code>
                        </pre>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="test" className="flex-1 m-0">
          <div className="p-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Test Hasura Connection
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>GraphQL Endpoint</Label>
                  <Input
                    value={testEndpoint}
                    onChange={(e) => setTestEndpoint(e.target.value)}
                    placeholder="http://localhost:8080/v1/graphql"
                  />
                </div>

                <div>
                  <Label>Admin Secret (optional)</Label>
                  <Input
                    type="password"
                    value={testSecret}
                    onChange={(e) => setTestSecret(e.target.value)}
                    placeholder="your-admin-secret"
                  />
                </div>

                <Button
                  onClick={testConnection}
                  disabled={testing || !testEndpoint}
                  className="w-full"
                >
                  {testing ? (
                    <>
                      <Settings className="h-4 w-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>

                {testResult && (
                  <Alert
                    className={
                      testResult.includes("✅")
                        ? "border-green-200 bg-green-50"
                        : "border-red-200 bg-red-50"
                    }
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{testResult}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="setup" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Quick setup checklist for Hasura integration
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Installation Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Install GraphQL dependencies
                      </span>
                    </div>
                    <div className="bg-muted rounded-md p-3">
                      <code className="text-sm">
                        npm install @apollo/client graphql
                      </code>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Set up environment variables
                      </span>
                    </div>
                    <div className="bg-muted rounded-md p-3">
                      <code className="text-sm">
                        NEXT_PUBLIC_HASURA_ENDPOINT=http://localhost:8080/v1/graphql
                        <br />
                        HASURA_ADMIN_SECRET=your-admin-secret
                      </code>
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Configure Apollo Client</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Create GraphQL queries and mutations
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">
                        Set up permissions in Hasura Console
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HasuraIntegration;
