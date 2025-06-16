import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Database,
  Zap,
  Shield,
  Globe,
  Code,
  Search,
  BookOpen,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";

interface HasuraFeature {
  id: string;
  title: string;
  description: string;
  category: string;
  complexity: "beginner" | "intermediate" | "advanced";
  useCase: string;
  codeExample?: string;
  documentation?: string;
}

const HasuraKnowledgeBase: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const hasuraFeatures: HasuraFeature[] = [
    {
      id: "graphql-api",
      title: "Auto-Generated GraphQL API",
      description:
        "Hasura automatically generates a GraphQL API from your database schema with queries, mutations, and subscriptions.",
      category: "core",
      complexity: "beginner",
      useCase: "Perfect for rapid API development without writing backend code",
      codeExample: `query GetWorkflows {
  workflows {
    id
    name
    status
    created_at
    nodes {
      id
      type
      config
    }
  }
}`,
      documentation: "https://hasura.io/docs/latest/graphql/core/",
    },
    {
      id: "real-time-subscriptions",
      title: "Real-time Subscriptions",
      description:
        "Live queries that automatically update when data changes in your database.",
      category: "real-time",
      complexity: "intermediate",
      useCase:
        "Essential for live workflow execution monitoring and collaborative editing",
      codeExample: `subscription WorkflowExecution($workflowId: uuid!) {
  workflow_executions(
    where: { workflow_id: { _eq: $workflowId } }
    order_by: { created_at: desc }
  ) {
    id
    status
    progress
    logs
    error_message
  }
}`,
      documentation:
        "https://hasura.io/docs/latest/graphql/core/subscriptions/",
    },
    {
      id: "permissions",
      title: "Row-Level Security",
      description:
        "Fine-grained access control with role-based permissions at the row and column level.",
      category: "security",
      complexity: "advanced",
      useCase:
        "Secure multi-tenant workflow builder where users only see their own workflows",
      codeExample: `{
  "filter": {
    "user_id": {
      "_eq": "X-Hasura-User-Id"
    }
  }
}`,
      documentation: "https://hasura.io/docs/latest/graphql/core/auth/",
    },
    {
      id: "actions",
      title: "Custom Business Logic",
      description:
        "Extend GraphQL schema with custom resolvers and business logic through Actions.",
      category: "extensibility",
      complexity: "intermediate",
      useCase:
        "Execute workflow nodes, validate configurations, integrate with external APIs",
      codeExample: `type Mutation {
  executeWorkflow(
    workflowId: uuid!
    input: WorkflowInput!
  ): WorkflowExecutionResponse
}`,
      documentation: "https://hasura.io/docs/latest/graphql/core/actions/",
    },
    {
      id: "events",
      title: "Event Triggers",
      description:
        "Automatically trigger webhooks when data changes in your database.",
      category: "automation",
      complexity: "intermediate",
      useCase:
        "Trigger workflow executions, send notifications, sync data with external systems",
      codeExample: `{
  "name": "workflow_created",
  "table": "workflows",
  "webhook": "https://api.example.com/webhook/workflow-created",
  "insert": {
    "columns": "*"
  }
}`,
      documentation:
        "https://hasura.io/docs/latest/graphql/core/event-triggers/",
    },
    {
      id: "remote-schemas",
      title: "Schema Stitching",
      description:
        "Combine multiple GraphQL APIs into a single unified schema.",
      category: "integration",
      complexity: "advanced",
      useCase:
        "Integrate with external APIs like OpenAI, Stripe, or custom microservices",
      codeExample: `{
  "name": "openai-api",
  "definition": {
    "url": "https://api.openai.com/graphql",
    "headers": [
      {
        "name": "Authorization",
        "value": "Bearer {{OPENAI_API_KEY}}"
      }
    ]
  }
}`,
      documentation:
        "https://hasura.io/docs/latest/graphql/core/remote-schemas/",
    },
    {
      id: "migrations",
      title: "Database Migrations",
      description:
        "Version control for your database schema with automatic migration generation.",
      category: "deployment",
      complexity: "intermediate",
      useCase:
        "Manage database schema changes across development, staging, and production",
      codeExample: `hasura migrate create "add_workflow_nodes_table" --from-server
hasura migrate apply --version 1234567890123
hasura metadata apply`,
      documentation: "https://hasura.io/docs/latest/graphql/core/migrations/",
    },
    {
      id: "caching",
      title: "Query Caching",
      description:
        "Built-in query result caching with Redis for improved performance.",
      category: "performance",
      complexity: "intermediate",
      useCase:
        "Cache frequently accessed workflow templates and configuration data",
      codeExample: `query GetWorkflowTemplates @cached(ttl: 300) {
  workflow_templates {
    id
    name
    description
    nodes
    connections
  }
}`,
      documentation: "https://hasura.io/docs/latest/graphql/core/caching/",
    },
  ];

  const categories = [
    { id: "all", name: "All Features", icon: BookOpen },
    { id: "core", name: "Core Features", icon: Database },
    { id: "real-time", name: "Real-time", icon: Zap },
    { id: "security", name: "Security", icon: Shield },
    { id: "integration", name: "Integration", icon: Globe },
    { id: "extensibility", name: "Extensibility", icon: Code },
    { id: "automation", name: "Automation", icon: Zap },
    { id: "deployment", name: "Deployment", icon: Database },
    { id: "performance", name: "Performance", icon: Zap },
  ];

  const filteredFeatures = hasuraFeatures.filter((feature) => {
    const matchesSearch =
      feature.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feature.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || feature.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "beginner":
        return "bg-green-100 text-green-800";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getComplexityIcon = (complexity: string) => {
    switch (complexity) {
      case "beginner":
        return <CheckCircle className="h-4 w-4" />;
      case "intermediate":
        return <AlertCircle className="h-4 w-4" />;
      case "advanced":
        return <Info className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Hasura Knowledge Base</h2>
            <p className="text-muted-foreground">
              Complete guide to Hasura features for workflow automation
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {filteredFeatures.length} Features
          </Badge>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search Hasura features..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
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

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {filteredFeatures.map((feature) => (
            <Card
              key={feature.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {feature.title}
                      <Badge
                        className={`${getComplexityColor(feature.complexity)} flex items-center gap-1`}
                      >
                        {getComplexityIcon(feature.complexity)}
                        {feature.complexity}
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Use Case:</strong> {feature.useCase}
                  </AlertDescription>
                </Alert>

                {feature.codeExample && (
                  <Tabs defaultValue="code" className="w-full">
                    <TabsList>
                      <TabsTrigger value="code">Code Example</TabsTrigger>
                      <TabsTrigger value="docs">Documentation</TabsTrigger>
                    </TabsList>
                    <TabsContent value="code">
                      <div className="bg-muted rounded-md p-4">
                        <pre className="text-sm font-mono overflow-x-auto">
                          <code>{feature.codeExample}</code>
                        </pre>
                      </div>
                    </TabsContent>
                    <TabsContent value="docs">
                      <div className="flex items-center justify-between p-4 bg-muted rounded-md">
                        <span className="text-sm">
                          Official Hasura Documentation
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(feature.documentation, "_blank")
                          }
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Open Docs
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </CardContent>
            </Card>
          ))}

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No features found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search terms or category filter
              </p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default HasuraKnowledgeBase;
