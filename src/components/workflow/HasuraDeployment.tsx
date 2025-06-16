import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Cloud,
  Server,
  Database,
  Shield,
  Zap,
  CheckCircle,
  Copy,
  Download,
  ExternalLink,
  AlertTriangle,
  Info,
  Play,
  Settings,
} from "lucide-react";

interface DeploymentStep {
  id: string;
  title: string;
  description: string;
  commands?: string[];
  files?: { name: string; content: string }[];
  notes?: string[];
  completed: boolean;
}

const HasuraDeployment: React.FC = () => {
  const [selectedEnvironment, setSelectedEnvironment] =
    useState<string>("docker");
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  const toggleStepCompletion = (stepId: string) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const dockerSteps: DeploymentStep[] = [
    {
      id: "docker-setup",
      title: "Docker Compose Setup",
      description:
        "Create Docker Compose configuration for Hasura and PostgreSQL",
      files: [
        {
          name: "docker-compose.yml",
          content: `version: '3.6'
services:
  postgres:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_PASSWORD: postgrespassword
      POSTGRES_DB: workflow_builder
    volumes:
      - db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  hasura:
    image: hasura/graphql-engine:v2.36.0
    ports:
      - "8080:8080"
    depends_on:
      - "postgres"
    restart: always
    environment:
      HASURA_GRAPHQL_METADATA_DATABASE_URL: postgres://postgres:postgrespassword@postgres:5432/workflow_builder
      PG_DATABASE_URL: postgres://postgres:postgrespassword@postgres:5432/workflow_builder
      HASURA_GRAPHQL_ENABLE_CONSOLE: "true"
      HASURA_GRAPHQL_DEV_MODE: "true"
      HASURA_GRAPHQL_ENABLED_LOG_TYPES: startup, http-log, webhook-log, websocket-log, query-log
      HASURA_GRAPHQL_ADMIN_SECRET: myadminsecretkey
      HASURA_GRAPHQL_JWT_SECRET: '{"type":"HS256","key":"your-256-bit-secret-key-here-make-it-long-enough"}'
      HASURA_GRAPHQL_CORS_DOMAIN: "http://localhost:3000,http://localhost:5173"

volumes:
  db_data:`,
        },
      ],
      commands: ["docker-compose up -d", "docker-compose logs -f hasura"],
      notes: [
        "Change HASURA_GRAPHQL_ADMIN_SECRET to a secure value",
        "Update JWT secret with your own 256-bit key",
        "Hasura Console will be available at http://localhost:8080",
      ],
      completed: false,
    },
    {
      id: "database-schema",
      title: "Database Schema Setup",
      description: "Create initial database schema for workflow builder",
      files: [
        {
          name: "init-schema.sql",
          content: `-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflows table
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'draft',
  config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow nodes table
CREATE TABLE workflow_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  name VARCHAR(255) NOT NULL,
  config JSONB DEFAULT '{}',
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow connections table
CREATE TABLE workflow_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  source_node_id UUID NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES workflow_nodes(id) ON DELETE CASCADE,
  source_handle VARCHAR(100),
  target_handle VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workflow executions table
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id UUID NOT NULL REFERENCES workflows(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'running',
  progress INTEGER DEFAULT 0,
  logs JSONB DEFAULT '[]',
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Secrets table
CREATE TABLE user_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(100) NOT NULL,
  encrypted_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create indexes
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflow_nodes_workflow_id ON workflow_nodes(workflow_id);
CREATE INDEX idx_workflow_connections_workflow_id ON workflow_connections(workflow_id);
CREATE INDEX idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX idx_user_secrets_user_id ON user_secrets(user_id);`,
        },
      ],
      commands: [
        "docker exec -i $(docker-compose ps -q postgres) psql -U postgres -d workflow_builder < init-schema.sql",
      ],
      notes: [
        "Run this after PostgreSQL container is running",
        "You can also execute this SQL directly in Hasura Console",
      ],
      completed: false,
    },
    {
      id: "hasura-metadata",
      title: "Hasura Metadata Configuration",
      description: "Configure Hasura permissions and relationships",
      commands: [
        "hasura init hasura-project",
        "cd hasura-project",
        "hasura metadata apply",
        "hasura migrate apply",
      ],
      notes: [
        "Install Hasura CLI first: npm install -g hasura-cli",
        "Set HASURA_GRAPHQL_ENDPOINT=http://localhost:8080",
        "Set HASURA_GRAPHQL_ADMIN_SECRET=myadminsecretkey",
      ],
      completed: false,
    },
  ];

  const cloudSteps: DeploymentStep[] = [
    {
      id: "hasura-cloud",
      title: "Hasura Cloud Setup",
      description: "Deploy Hasura to Hasura Cloud for production",
      commands: [
        "# Visit https://cloud.hasura.io",
        "# Create new project",
        "# Connect to your PostgreSQL database",
      ],
      notes: [
        "Hasura Cloud provides managed GraphQL API",
        "Includes monitoring, caching, and security features",
        "Free tier available for development",
      ],
      completed: false,
    },
    {
      id: "database-cloud",
      title: "Cloud Database Setup",
      description: "Set up managed PostgreSQL database",
      commands: [
        "# Option 1: Neon (recommended)",
        "# Visit https://neon.tech",
        "# Option 2: Supabase",
        "# Visit https://supabase.com",
        "# Option 3: AWS RDS",
        "# Use AWS Console or CLI",
      ],
      notes: [
        "Neon offers generous free tier with branching",
        "Supabase includes auth and real-time features",
        "AWS RDS for enterprise deployments",
      ],
      completed: false,
    },
    {
      id: "environment-config",
      title: "Environment Configuration",
      description: "Configure environment variables for production",
      files: [
        {
          name: ".env.production",
          content: `# Hasura Configuration
HASURA_GRAPHQL_ENDPOINT=https://your-project.hasura.app/v1/graphql
HASURA_GRAPHQL_ADMIN_SECRET=your-admin-secret
HASURA_GRAPHQL_JWT_SECRET=your-jwt-secret

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# Application Configuration
NEXT_PUBLIC_HASURA_ENDPOINT=https://your-project.hasura.app/v1/graphql
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain

# External Services
OPENAI_API_KEY=your-openai-key
STRIPE_SECRET_KEY=your-stripe-key`,
        },
      ],
      notes: [
        "Never commit secrets to version control",
        "Use environment-specific configuration",
        "Consider using secret management services",
      ],
      completed: false,
    },
  ];

  const getCurrentSteps = () => {
    switch (selectedEnvironment) {
      case "docker":
        return dockerSteps;
      case "cloud":
        return cloudSteps;
      default:
        return dockerSteps;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const downloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Hasura Deployment Guide</h2>
            <p className="text-muted-foreground">
              Step-by-step deployment instructions for different environments
            </p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {completedSteps.size} / {getCurrentSteps().length} Completed
          </Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant={selectedEnvironment === "docker" ? "default" : "outline"}
            onClick={() => setSelectedEnvironment("docker")}
            className="flex items-center gap-2"
          >
            <Server className="h-4 w-4" />
            Docker Local
          </Button>
          <Button
            variant={selectedEnvironment === "cloud" ? "default" : "outline"}
            onClick={() => setSelectedEnvironment("cloud")}
            className="flex items-center gap-2"
          >
            <Cloud className="h-4 w-4" />
            Cloud Deployment
          </Button>
        </div>
      </div>

      <Tabs defaultValue="steps" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="steps">Deployment Steps</TabsTrigger>
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="steps" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {getCurrentSteps().map((step, index) => {
                const isCompleted = completedSteps.has(step.id);
                return (
                  <Card
                    key={step.id}
                    className={`${isCompleted ? "border-green-200 bg-green-50" : ""}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                              isCompleted
                                ? "bg-green-500 text-white"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              index + 1
                            )}
                          </div>
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {step.title}
                              {isCompleted && (
                                <Badge className="bg-green-100 text-green-800">
                                  Completed
                                </Badge>
                              )}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {step.description}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStepCompletion(step.id)}
                        >
                          {isCompleted ? "Mark Incomplete" : "Mark Complete"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {step.commands && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium mb-2 block">
                            Commands:
                          </Label>
                          <div className="bg-muted rounded-md p-3">
                            {step.commands.map((command, cmdIndex) => (
                              <div
                                key={cmdIndex}
                                className="flex items-center justify-between mb-2 last:mb-0"
                              >
                                <code className="text-sm font-mono flex-1">
                                  {command}
                                </code>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => copyToClipboard(command)}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {step.files && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium mb-2 block">
                            Files:
                          </Label>
                          {step.files.map((file, fileIndex) => (
                            <div key={fileIndex} className="mb-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">
                                  {file.name}
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      copyToClipboard(file.content)
                                    }
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      downloadFile(file.name, file.content)
                                    }
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    Download
                                  </Button>
                                </div>
                              </div>
                              <div className="bg-muted rounded-md">
                                <ScrollArea className="h-48">
                                  <pre className="p-3 text-xs font-mono">
                                    <code>{file.content}</code>
                                  </pre>
                                </ScrollArea>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {step.notes && (
                        <Alert>
                          <Info className="h-4 w-4" />
                          <AlertDescription>
                            <div className="space-y-1">
                              {step.notes.map((note, noteIndex) => (
                                <div key={noteIndex} className="text-sm">
                                  {note}
                                </div>
                              ))}
                            </div>
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="config" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Essential configuration settings for your Hasura deployment
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Environment Variables</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Hasura GraphQL Endpoint</Label>
                    <Input placeholder="http://localhost:8080/v1/graphql" />
                  </div>
                  <div>
                    <Label>Admin Secret</Label>
                    <Input type="password" placeholder="your-admin-secret" />
                  </div>
                  <div>
                    <Label>JWT Secret</Label>
                    <Textarea placeholder='{"type":"HS256","key":"your-secret-key"}' />
                  </div>
                  <div>
                    <Label>Database URL</Label>
                    <Input placeholder="postgresql://user:password@host:port/database" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Security Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        <li>Always use HTTPS in production</li>
                        <li>Set strong admin secrets (32+ characters)</li>
                        <li>Configure CORS domains properly</li>
                        <li>Enable rate limiting</li>
                        <li>Use environment-specific JWT secrets</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="troubleshooting" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Common issues and solutions for Hasura deployment
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Connection Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Problem:</strong> Cannot connect to Hasura Console
                      <br />
                      <strong>Solution:</strong> Check if Docker containers are
                      running: <code>docker-compose ps</code>
                    </div>
                    <div>
                      <strong>Problem:</strong> Database connection failed
                      <br />
                      <strong>Solution:</strong> Verify PostgreSQL is running
                      and credentials are correct
                    </div>
                    <div>
                      <strong>Problem:</strong> CORS errors in browser
                      <br />
                      <strong>Solution:</strong> Add your frontend URL to
                      HASURA_GRAPHQL_CORS_DOMAIN
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Issues</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <strong>Problem:</strong> Slow GraphQL queries
                      <br />
                      <strong>Solution:</strong> Add database indexes, enable
                      query caching
                    </div>
                    <div>
                      <strong>Problem:</strong> High memory usage
                      <br />
                      <strong>Solution:</strong> Tune PostgreSQL settings, limit
                      query depth
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Useful Commands</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-md p-3">
                    <div className="space-y-2 text-sm font-mono">
                      <div># Check Hasura logs</div>
                      <div>docker-compose logs -f hasura</div>
                      <div></div>
                      <div># Reset database</div>
                      <div>docker-compose down -v</div>
                      <div>docker-compose up -d</div>
                      <div></div>
                      <div># Export metadata</div>
                      <div>hasura metadata export</div>
                      <div></div>
                      <div># Apply migrations</div>
                      <div>hasura migrate apply</div>
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

export default HasuraDeployment;
