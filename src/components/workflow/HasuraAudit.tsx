import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Database,
  Zap,
  Shield,
  Code,
  Clock,
  DollarSign,
  Users,
  BarChart3,
} from "lucide-react";

interface AuditItem {
  id: string;
  category: string;
  feature: string;
  currentState: "missing" | "partial" | "implemented" | "optimal";
  hasuraCapability: "excellent" | "good" | "limited" | "not-applicable";
  impact: "high" | "medium" | "low";
  effort: "low" | "medium" | "high";
  description: string;
  recommendation: string;
  benefits: string[];
}

const HasuraAudit: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const auditItems: AuditItem[] = [
    {
      id: "data-persistence",
      category: "database",
      feature: "Data Persistence",
      currentState: "missing",
      hasuraCapability: "excellent",
      impact: "high",
      effort: "low",
      description: "Currently workflows and configurations are not persisted",
      recommendation:
        "Implement PostgreSQL with Hasura for automatic GraphQL API",
      benefits: [
        "Persistent workflow storage",
        "Version history",
        "Backup and recovery",
      ],
    },
    {
      id: "real-time-collaboration",
      category: "real-time",
      feature: "Real-time Collaboration",
      currentState: "missing",
      hasuraCapability: "excellent",
      impact: "high",
      effort: "medium",
      description: "No real-time updates when multiple users edit workflows",
      recommendation: "Use Hasura subscriptions for live collaborative editing",
      benefits: [
        "Live cursor tracking",
        "Conflict resolution",
        "Multi-user editing",
      ],
    },
    {
      id: "user-authentication",
      category: "security",
      feature: "User Authentication",
      currentState: "missing",
      hasuraCapability: "excellent",
      impact: "high",
      effort: "medium",
      description: "No user authentication or authorization system",
      recommendation: "Implement JWT-based auth with Hasura permissions",
      benefits: [
        "Secure access control",
        "Role-based permissions",
        "Multi-tenant support",
      ],
    },
    {
      id: "workflow-execution",
      category: "automation",
      feature: "Workflow Execution Engine",
      currentState: "partial",
      hasuraCapability: "good",
      impact: "high",
      effort: "high",
      description: "Basic execution simulation without actual processing",
      recommendation: "Use Hasura Actions for custom execution logic",
      benefits: ["Scalable execution", "Error handling", "Execution history"],
    },
    {
      id: "api-integrations",
      category: "integration",
      feature: "External API Integrations",
      currentState: "missing",
      hasuraCapability: "excellent",
      impact: "high",
      effort: "medium",
      description: "No integration with external APIs or services",
      recommendation: "Use Remote Schemas to integrate external GraphQL APIs",
      benefits: ["Unified API layer", "Schema stitching", "Type safety"],
    },
    {
      id: "monitoring-logging",
      category: "observability",
      feature: "Monitoring & Logging",
      currentState: "partial",
      hasuraCapability: "good",
      impact: "medium",
      effort: "medium",
      description: "Basic console logging without structured monitoring",
      recommendation: "Implement structured logging with Hasura observability",
      benefits: ["Query analytics", "Performance monitoring", "Error tracking"],
    },
    {
      id: "caching-performance",
      category: "performance",
      feature: "Caching & Performance",
      currentState: "missing",
      hasuraCapability: "excellent",
      impact: "medium",
      effort: "low",
      description: "No caching mechanism for improved performance",
      recommendation: "Enable Hasura query caching with Redis",
      benefits: ["Faster response times", "Reduced database load", "Better UX"],
    },
    {
      id: "data-validation",
      category: "quality",
      feature: "Data Validation",
      currentState: "partial",
      hasuraCapability: "good",
      impact: "medium",
      effort: "low",
      description: "Basic client-side validation without server-side checks",
      recommendation: "Use Hasura permissions and constraints for validation",
      benefits: ["Data integrity", "Consistent validation", "Security"],
    },
    {
      id: "backup-recovery",
      category: "reliability",
      feature: "Backup & Recovery",
      currentState: "missing",
      hasuraCapability: "good",
      impact: "high",
      effort: "low",
      description: "No backup strategy for workflow data",
      recommendation: "Implement automated PostgreSQL backups",
      benefits: [
        "Data protection",
        "Disaster recovery",
        "Point-in-time restore",
      ],
    },
    {
      id: "scalability",
      category: "performance",
      feature: "Horizontal Scalability",
      currentState: "limited",
      hasuraCapability: "excellent",
      impact: "medium",
      effort: "medium",
      description: "Current architecture doesn't support horizontal scaling",
      recommendation: "Deploy Hasura with load balancing and read replicas",
      benefits: [
        "Handle more users",
        "Better performance",
        "High availability",
      ],
    },
  ];

  const categories = [
    { id: "all", name: "All Categories", icon: BarChart3 },
    { id: "database", name: "Database", icon: Database },
    { id: "real-time", name: "Real-time", icon: Zap },
    { id: "security", name: "Security", icon: Shield },
    { id: "automation", name: "Automation", icon: Code },
    { id: "integration", name: "Integration", icon: Code },
    { id: "observability", name: "Observability", icon: BarChart3 },
    { id: "performance", name: "Performance", icon: TrendingUp },
    { id: "quality", name: "Quality", icon: CheckCircle },
    { id: "reliability", name: "Reliability", icon: Shield },
  ];

  const filteredItems =
    selectedCategory === "all"
      ? auditItems
      : auditItems.filter((item) => item.category === selectedCategory);

  const getStateColor = (state: string) => {
    switch (state) {
      case "missing":
        return "bg-red-100 text-red-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "implemented":
        return "bg-blue-100 text-blue-800";
      case "optimal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCapabilityColor = (capability: string) => {
    switch (capability) {
      case "excellent":
        return "bg-green-100 text-green-800";
      case "good":
        return "bg-blue-100 text-blue-800";
      case "limited":
        return "bg-yellow-100 text-yellow-800";
      case "not-applicable":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case "high":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getEffortIcon = (effort: string) => {
    switch (effort) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "medium":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "low":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const calculateOverallScore = () => {
    const scores = {
      missing: 0,
      partial: 25,
      implemented: 75,
      optimal: 100,
    };
    const total = auditItems.reduce(
      (sum, item) => sum + scores[item.currentState as keyof typeof scores],
      0,
    );
    return Math.round(total / auditItems.length);
  };

  const getRecommendationsByPriority = () => {
    return auditItems
      .filter(
        (item) =>
          item.currentState === "missing" || item.currentState === "partial",
      )
      .sort((a, b) => {
        const impactOrder = { high: 3, medium: 2, low: 1 };
        const effortOrder = { low: 3, medium: 2, high: 1 };
        const aScore =
          impactOrder[a.impact as keyof typeof impactOrder] +
          effortOrder[a.effort as keyof typeof effortOrder];
        const bScore =
          impactOrder[b.impact as keyof typeof impactOrder] +
          effortOrder[b.effort as keyof typeof effortOrder];
        return bScore - aScore;
      })
      .slice(0, 5);
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Hasura Integration Audit</h2>
            <p className="text-muted-foreground">
              Comprehensive analysis of current application vs Hasura
              capabilities
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {calculateOverallScore()}%
              </div>
              <div className="text-xs text-muted-foreground">Overall Score</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
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

        <Progress value={calculateOverallScore()} className="h-2" />
      </div>

      <Tabs defaultValue="audit" className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="audit">Detailed Audit</TabsTrigger>
            <TabsTrigger value="recommendations">
              Top Recommendations
            </TabsTrigger>
            <TabsTrigger value="roadmap">Implementation Roadmap</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="audit" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {item.feature}
                          <Badge className={getStateColor(item.currentState)}>
                            {item.currentState}
                          </Badge>
                          <Badge
                            className={getCapabilityColor(
                              item.hasuraCapability,
                            )}
                          >
                            Hasura: {item.hasuraCapability}
                          </Badge>
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                          {item.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex items-center gap-1">
                          {getImpactIcon(item.impact)}
                          <span className="text-xs">{item.impact} impact</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {getEffortIcon(item.effort)}
                          <span className="text-xs">{item.effort} effort</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Alert className="mb-4">
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Recommendation:</strong> {item.recommendation}
                      </AlertDescription>
                    </Alert>

                    <div>
                      <h4 className="font-medium mb-2">Benefits:</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                        {item.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="recommendations" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-4">
              <Alert>
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Top 5 recommendations based on impact vs effort analysis
                </AlertDescription>
              </Alert>

              {getRecommendationsByPriority().map((item, index) => (
                <Card key={item.id} className="border-l-4 border-l-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge variant="outline">#{index + 1}</Badge>
                      {item.feature}
                      <div className="flex items-center gap-2 ml-auto">
                        {getImpactIcon(item.impact)}
                        {getEffortIcon(item.effort)}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-3">{item.recommendation}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">{item.impact} impact</Badge>
                      <Badge variant="outline">{item.effort} effort</Badge>
                      <Badge
                        className={getCapabilityColor(item.hasuraCapability)}
                      >
                        Hasura: {item.hasuraCapability}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="roadmap" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <div className="p-4 space-y-6">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  Suggested implementation phases for Hasura integration
                </AlertDescription>
              </Alert>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Phase 1
                      </Badge>
                      Foundation (Week 1-2)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Set up PostgreSQL database</li>
                      <li>• Deploy Hasura GraphQL Engine</li>
                      <li>• Create basic schema for workflows and nodes</li>
                      <li>• Implement data persistence</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-800">
                        Phase 2
                      </Badge>
                      Authentication & Security (Week 3-4)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Implement JWT authentication</li>
                      <li>• Set up role-based permissions</li>
                      <li>• Add user management</li>
                      <li>• Secure API endpoints</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Phase 3
                      </Badge>
                      Real-time Features (Week 5-6)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Implement GraphQL subscriptions</li>
                      <li>• Add real-time collaboration</li>
                      <li>• Live workflow execution monitoring</li>
                      <li>• Event-driven notifications</li>
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Badge className="bg-purple-100 text-purple-800">
                        Phase 4
                      </Badge>
                      Advanced Features (Week 7-8)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li>• Custom Actions for workflow execution</li>
                      <li>• External API integrations via Remote Schemas</li>
                      <li>• Event triggers for automation</li>
                      <li>• Performance optimization and caching</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HasuraAudit;
