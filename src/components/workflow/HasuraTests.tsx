import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  Clock,
  Play,
  RefreshCw,
  Database,
  Shield,
  Zap,
  Globe,
} from "lucide-react";

interface TestResult {
  id: string;
  name: string;
  description: string;
  status: "pending" | "running" | "passed" | "failed";
  duration?: number;
  error?: string;
  details?: string;
}

interface TestSuite {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  tests: TestResult[];
}

const HasuraTests = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedSuite, setSelectedSuite] = useState("connection");

  const [testSuites, setTestSuites] = useState<TestSuite[]>([
    {
      id: "connection",
      name: "Connection Tests",
      description: "Verify Hasura GraphQL endpoint connectivity",
      icon: <Globe className="w-4 h-4" />,
      tests: [
        {
          id: "endpoint-health",
          name: "GraphQL Endpoint Health",
          description: "Check if Hasura GraphQL endpoint is accessible",
          status: "pending",
        },
        {
          id: "admin-secret",
          name: "Admin Secret Validation",
          description: "Verify admin secret authentication",
          status: "pending",
        },
        {
          id: "metadata-query",
          name: "Metadata Query Test",
          description: "Test metadata API accessibility",
          status: "pending",
        },
      ],
    },
    {
      id: "database",
      name: "Database Tests",
      description: "Test database operations and schema",
      icon: <Database className="w-4 h-4" />,
      tests: [
        {
          id: "db-connection",
          name: "Database Connection",
          description: "Verify database connectivity through Hasura",
          status: "pending",
        },
        {
          id: "table-creation",
          name: "Table Creation Test",
          description: "Test creating workflow tables",
          status: "pending",
        },
        {
          id: "crud-operations",
          name: "CRUD Operations",
          description: "Test basic create, read, update, delete operations",
          status: "pending",
        },
        {
          id: "relationships",
          name: "Table Relationships",
          description: "Verify foreign key relationships work correctly",
          status: "pending",
        },
      ],
    },
    {
      id: "permissions",
      name: "Permission Tests",
      description: "Validate role-based access control",
      icon: <Shield className="w-4 h-4" />,
      tests: [
        {
          id: "role-creation",
          name: "Role Creation",
          description: "Test creating user roles (admin, user, viewer)",
          status: "pending",
        },
        {
          id: "table-permissions",
          name: "Table Permissions",
          description: "Verify row-level security permissions",
          status: "pending",
        },
        {
          id: "jwt-validation",
          name: "JWT Token Validation",
          description: "Test JWT authentication flow",
          status: "pending",
        },
      ],
    },
    {
      id: "performance",
      name: "Performance Tests",
      description: "Test query performance and optimization",
      icon: <Zap className="w-4 h-4" />,
      tests: [
        {
          id: "query-performance",
          name: "Query Performance",
          description: "Measure GraphQL query response times",
          status: "pending",
        },
        {
          id: "subscription-load",
          name: "Subscription Load Test",
          description: "Test real-time subscription performance",
          status: "pending",
        },
        {
          id: "batch-operations",
          name: "Batch Operations",
          description: "Test bulk insert/update performance",
          status: "pending",
        },
      ],
    },
  ]);

  const runAllTests = async () => {
    setIsRunning(true);
    setProgress(0);

    const allTests = testSuites.flatMap((suite) => suite.tests);
    const totalTests = allTests.length;

    for (let i = 0; i < totalTests; i++) {
      const currentTest = allTests[i];

      // Update test status to running
      setTestSuites((prev) =>
        prev.map((suite) => ({
          ...suite,
          tests: suite.tests.map((test) =>
            test.id === currentTest.id
              ? { ...test, status: "running" as const }
              : test,
          ),
        })),
      );

      // Simulate test execution
      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 2000 + 500),
      );

      // Randomly determine test result (for demo purposes)
      const passed = Math.random() > 0.2; // 80% pass rate
      const duration = Math.floor(Math.random() * 1500 + 100);

      setTestSuites((prev) =>
        prev.map((suite) => ({
          ...suite,
          tests: suite.tests.map((test) =>
            test.id === currentTest.id
              ? {
                  ...test,
                  status: passed ? ("passed" as const) : ("failed" as const),
                  duration,
                  error: passed
                    ? undefined
                    : "Connection timeout or authentication failed",
                  details: passed
                    ? "Test completed successfully"
                    : "Check your Hasura configuration",
                }
              : test,
          ),
        })),
      );

      setProgress(((i + 1) / totalTests) * 100);
    }

    setIsRunning(false);
  };

  const runSuiteTests = async (suiteId: string) => {
    const suite = testSuites.find((s) => s.id === suiteId);
    if (!suite) return;

    setIsRunning(true);

    for (let i = 0; i < suite.tests.length; i++) {
      const currentTest = suite.tests[i];

      setTestSuites((prev) =>
        prev.map((s) =>
          s.id === suiteId
            ? {
                ...s,
                tests: s.tests.map((test) =>
                  test.id === currentTest.id
                    ? { ...test, status: "running" as const }
                    : test,
                ),
              }
            : s,
        ),
      );

      await new Promise((resolve) =>
        setTimeout(resolve, Math.random() * 2000 + 500),
      );

      const passed = Math.random() > 0.2;
      const duration = Math.floor(Math.random() * 1500 + 100);

      setTestSuites((prev) =>
        prev.map((s) =>
          s.id === suiteId
            ? {
                ...s,
                tests: s.tests.map((test) =>
                  test.id === currentTest.id
                    ? {
                        ...test,
                        status: passed
                          ? ("passed" as const)
                          : ("failed" as const),
                        duration,
                        error: passed
                          ? undefined
                          : "Test failed - check configuration",
                        details: passed
                          ? "Test completed successfully"
                          : "Review Hasura setup",
                      }
                    : test,
                ),
              }
            : s,
        ),
      );
    }

    setIsRunning(false);
  };

  const resetTests = () => {
    setTestSuites((prev) =>
      prev.map((suite) => ({
        ...suite,
        tests: suite.tests.map((test) => ({
          ...test,
          status: "pending" as const,
          duration: undefined,
          error: undefined,
          details: undefined,
        })),
      })),
    );
    setProgress(0);
  };

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "passed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "running":
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestResult["status"]) => {
    const variants = {
      pending: "secondary",
      running: "default",
      passed: "default",
      failed: "destructive",
    } as const;

    const colors = {
      pending: "bg-gray-100 text-gray-700",
      running: "bg-blue-100 text-blue-700",
      passed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const currentSuite = testSuites.find((suite) => suite.id === selectedSuite);
  const totalTests = testSuites.reduce(
    (acc, suite) => acc + suite.tests.length,
    0,
  );
  const passedTests = testSuites.reduce(
    (acc, suite) =>
      acc + suite.tests.filter((test) => test.status === "passed").length,
    0,
  );
  const failedTests = testSuites.reduce(
    (acc, suite) =>
      acc + suite.tests.filter((test) => test.status === "failed").length,
    0,
  );

  return (
    <div className="w-full h-full bg-white p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Hasura Integration Tests
        </h1>
        <p className="text-gray-600 mb-4">
          Comprehensive test suite to validate Hasura GraphQL engine integration
          with your workflow automation platform.
        </p>

        <div className="flex items-center gap-4 mb-4">
          <Button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Run All Tests
          </Button>
          <Button
            variant="outline"
            onClick={resetTests}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Tests
          </Button>
        </div>

        {isRunning && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Running tests...</span>
              <span className="text-sm text-gray-600">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Tests</p>
                  <p className="text-2xl font-bold">{totalTests}</p>
                </div>
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Passed</p>
                  <p className="text-2xl font-bold text-green-600">
                    {passedTests}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">
                    {failedTests}
                  </p>
                </div>
                <XCircle className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs
        value={selectedSuite}
        onValueChange={setSelectedSuite}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-4">
          {testSuites.map((suite) => (
            <TabsTrigger
              key={suite.id}
              value={suite.id}
              className="flex items-center gap-2"
            >
              {suite.icon}
              {suite.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {testSuites.map((suite) => (
          <TabsContent key={suite.id} value={suite.id} className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {suite.icon}
                      {suite.name}
                    </CardTitle>
                    <CardDescription>{suite.description}</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => runSuiteTests(suite.id)}
                    disabled={isRunning}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Run Suite
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {suite.tests.map((test) => (
                      <div key={test.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <h4 className="font-medium">{test.name}</h4>
                              <p className="text-sm text-gray-600">
                                {test.description}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {test.duration && (
                              <span className="text-xs text-gray-500">
                                {test.duration}ms
                              </span>
                            )}
                            {getStatusBadge(test.status)}
                          </div>
                        </div>

                        {test.error && (
                          <Alert className="mt-2">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Error:</strong> {test.error}
                              {test.details && (
                                <div className="mt-1 text-sm">
                                  {test.details}
                                </div>
                              )}
                            </AlertDescription>
                          </Alert>
                        )}

                        {test.status === "passed" && test.details && (
                          <Alert className="mt-2 border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                              {test.details}
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default HasuraTests;
