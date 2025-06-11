import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  FileText,
  Wrench,
  Zap,
} from "lucide-react";
import TestRunner from "./TestRunner";
import TestFixGenerator from "./TestFixGenerator";

interface TestResult {
  id: string;
  toolName: string;
  category: string;
  status: "success" | "error" | "pending" | "running";
  message?: string;
  duration?: number;
  logs?: string[];
  errorDetails?: string;
  timestamp?: Date;
}

const TestDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [activeTab, setActiveTab] = useState<string>("runner");

  const handleTestComplete = (results: TestResult[]) => {
    setTestResults(results);
    // If there are failed tests, switch to the fix tab
    if (results.some((r) => r.status === "error")) {
      setActiveTab("fix");
    }
  };

  const handleFixApply = (fix: any) => {
    console.log("Fix applied:", fix);
    // In a real app, this would apply the fix and potentially re-run tests
  };

  // Calculate test statistics
  const totalTests = testResults.length;
  const passedTests = testResults.filter((r) => r.status === "success").length;
  const failedTests = testResults.filter((r) => r.status === "error").length;
  const successRate =
    totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;

  // Group tests by category
  const testsByCategory = testResults.reduce(
    (acc, test) => {
      if (!acc[test.category]) {
        acc[test.category] = { total: 0, passed: 0, failed: 0 };
      }
      acc[test.category].total += 1;
      if (test.status === "success") acc[test.category].passed += 1;
      if (test.status === "error") acc[test.category].failed += 1;
      return acc;
    },
    {} as Record<string, { total: number; passed: number; failed: number }>,
  );

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-bold">Scraper Tool Testing Dashboard</h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setActiveTab("runner")}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Run New Tests
          </Button>
        </div>
        <p className="text-muted-foreground">
          Test, analyze, and fix issues with scraper tools
        </p>
      </div>

      {testResults.length > 0 && (
        <div className="grid grid-cols-4 gap-4 p-4 border-b">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Total Tests
                  </p>
                  <p className="text-2xl font-bold">{totalTests}</p>
                </div>
                <FileText className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Success Rate
                  </p>
                  <p className="text-2xl font-bold">{successRate}%</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <BarChart className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <Progress
                value={successRate}
                className="h-2 mt-2"
                indicatorClassName={
                  successRate > 70
                    ? "bg-green-500"
                    : successRate > 40
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }
              />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Passed Tests
                  </p>
                  <p className="text-2xl font-bold">{passedTests}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Failed Tests
                  </p>
                  <p className="text-2xl font-bold">{failedTests}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="border-b px-4">
          <TabsList>
            <TabsTrigger value="runner">Test Runner</TabsTrigger>
            <TabsTrigger value="fix">
              Fix Generator
              {failedTests > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
                >
                  {failedTests}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="results">Test Results</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="runner" className="flex-1 p-0">
          <TestRunner onTestComplete={handleTestComplete} />
        </TabsContent>

        <TabsContent value="fix" className="flex-1 p-0">
          <TestFixGenerator
            testResults={testResults}
            onFixApply={handleFixApply}
          />
        </TabsContent>

        <TabsContent value="results" className="flex-1 p-4 overflow-auto">
          {testResults.length > 0 ? (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Test Results Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(testsByCategory).map(([category, stats]) => (
                    <Card key={category}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{category}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">
                            Success Rate
                          </span>
                          <span className="font-medium">
                            {stats.total > 0
                              ? Math.round((stats.passed / stats.total) * 100)
                              : 0}
                            %
                          </span>
                        </div>
                        <Progress
                          value={
                            stats.total > 0
                              ? (stats.passed / stats.total) * 100
                              : 0
                          }
                          className="h-2 mb-4"
                        />
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span>{stats.passed} passed</span>
                          </div>
                          <div className="flex items-center">
                            <XCircle className="h-4 w-4 text-red-500 mr-2" />
                            <span>{stats.failed} failed</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">
                  Detailed Test Results
                </h3>
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="text-left p-3 text-sm font-medium">
                          Tool
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Category
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Status
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Duration
                        </th>
                        <th className="text-left p-3 text-sm font-medium">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {testResults.map((result) => (
                        <tr key={result.id} className="border-b">
                          <td className="p-3">{result.toolName}</td>
                          <td className="p-3">
                            <Badge variant="outline">{result.category}</Badge>
                          </td>
                          <td className="p-3">
                            {result.status === "success" ? (
                              <div className="flex items-center">
                                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                                <span>Passed</span>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                                <span>Failed</span>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            {result.duration ? `${result.duration}ms` : "-"}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <FileText className="h-3 w-3 mr-1" />
                                Logs
                              </Button>
                              {result.status === "error" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setActiveTab("fix");
                                  }}
                                >
                                  <Wrench className="h-3 w-3 mr-1" />
                                  Fix
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-2 opacity-50" />
              <p>No test results available</p>
              <p className="text-sm">Run tests to see results here</p>
              <Button className="mt-4" onClick={() => setActiveTab("runner")}>
                Go to Test Runner
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestDashboard;
