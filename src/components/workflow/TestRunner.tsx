import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Play,
  RotateCcw,
  Clock,
  FileText,
  Code,
  Terminal,
} from "lucide-react";

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

interface TestRunnerProps {
  onTestComplete?: (results: TestResult[]) => void;
}

const TestRunner: React.FC<TestRunnerProps> = ({
  onTestComplete = () => {},
}) => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedTest, setSelectedTest] = useState<TestResult | null>(null);

  // Define test cases for each tool
  const testCases = [
    {
      id: "test-scrapy",
      toolName: "Scrapy Framework",
      category: "Framework",
      description: "Tests basic Scrapy spider functionality",
    },
    {
      id: "test-playwright",
      toolName: "Playwright",
      category: "Browser Automation",
      description: "Tests Playwright browser automation capabilities",
    },
    {
      id: "test-puppeteer",
      toolName: "Puppeteer",
      category: "Browser Automation",
      description: "Tests Puppeteer headless browser functionality",
    },
    {
      id: "test-selenium",
      toolName: "Selenium WebDriver",
      category: "Browser Automation",
      description: "Tests Selenium cross-browser automation",
    },
    {
      id: "test-beautifulsoup",
      toolName: "BeautifulSoup",
      category: "Parser",
      description: "Tests BeautifulSoup HTML parsing capabilities",
    },
    {
      id: "test-apify",
      toolName: "Apify Platform",
      category: "Cloud Platform",
      description: "Tests Apify platform integration",
    },
    {
      id: "test-octoparse",
      toolName: "Octoparse",
      category: "Visual Tool",
      description: "Tests Octoparse visual scraping capabilities",
    },
    {
      id: "test-scrapingbee",
      toolName: "ScrapingBee API",
      category: "API Service",
      description: "Tests ScrapingBee API functionality",
    },
    {
      id: "test-brightdata",
      toolName: "Bright Data",
      category: "Proxy Network",
      description: "Tests Bright Data proxy network capabilities",
    },
    {
      id: "test-parsehub",
      toolName: "ParseHub",
      category: "Visual Tool",
      description: "Tests ParseHub visual scraping capabilities",
    },
    {
      id: "test-cheerio",
      toolName: "Cheerio",
      category: "Parser",
      description: "Tests Cheerio HTML parsing capabilities",
    },
    {
      id: "test-colly",
      toolName: "Colly",
      category: "Framework",
      description: "Tests Colly Go scraping framework",
    },
  ];

  // Mock function to simulate running tests
  const runTests = async (selectedCategory: string = "all") => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    setSelectedTest(null);

    const testsToRun =
      selectedCategory === "all"
        ? testCases
        : testCases.filter((test) => test.category === selectedCategory);

    const totalTests = testsToRun.length;
    let completedTests = 0;

    // Initialize all tests as pending
    const initialResults = testsToRun.map((test) => ({
      ...test,
      status: "pending" as const,
      timestamp: new Date(),
    }));
    setResults(initialResults);

    // Run each test with a delay to simulate processing
    for (const test of testsToRun) {
      // Update current test to running
      setResults((prev) =>
        prev.map((r) =>
          r.id === test.id ? { ...r, status: "running" as const } : r,
        ),
      );

      // Simulate test execution with random success/failure
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 1500),
      );

      const success = Math.random() > 0.3; // 70% success rate
      const duration = Math.floor(500 + Math.random() * 2000);
      const logs = [
        `[${new Date().toISOString()}] Starting test for ${test.toolName}`,
        `[${new Date().toISOString()}] Initializing test environment`,
        `[${new Date().toISOString()}] Loading test configuration`,
        `[${new Date().toISOString()}] Executing test case`,
        success
          ? `[${new Date().toISOString()}] Test completed successfully`
          : `[${new Date().toISOString()}] Test failed with errors`,
      ];

      // Generate mock errors for failed tests
      const errorDetails = !success
        ? generateMockError(test.toolName)
        : undefined;

      // Update test result
      setResults((prev) =>
        prev.map((r) =>
          r.id === test.id
            ? {
                ...r,
                status: success ? ("success" as const) : ("error" as const),
                duration,
                logs,
                message: success
                  ? "Test passed successfully"
                  : "Test failed with errors",
                errorDetails,
                timestamp: new Date(),
              }
            : r,
        ),
      );

      completedTests++;
      setProgress(Math.floor((completedTests / totalTests) * 100));
    }

    setIsRunning(false);
    const finalResults = testsToRun.map((test) => {
      const result = results.find((r) => r.id === test.id);
      return (
        result || {
          ...test,
          status: "error" as const,
          message: "Test execution failed",
          timestamp: new Date(),
        }
      );
    });

    onTestComplete(finalResults);
  };

  // Generate mock errors based on tool type
  const generateMockError = (toolName: string): string => {
    const errors = {
      "Scrapy Framework":
        "ImportError: No module named 'scrapy' - Please install Scrapy using pip install scrapy",
      Playwright:
        "Error: browserType.launch: Executable doesn't exist at /path/to/browser - Please run 'npx playwright install'",
      Puppeteer:
        "Error: Failed to launch the browser process! - Missing Chromium dependencies",
      "Selenium WebDriver":
        "SessionNotCreatedException: Message: session not created: This version of ChromeDriver only supports Chrome version XX",
      BeautifulSoup:
        "ModuleNotFoundError: No module named 'bs4' - Please install BeautifulSoup using pip install beautifulsoup4",
      "Apify Platform":
        "Error: Apify SDK: Cannot find Apify API token - Set the APIFY_TOKEN environment variable",
      Octoparse:
        "Authentication Error: Invalid API credentials - Please check your Octoparse API key",
      "ScrapingBee API": "Error: 401 Unauthorized - Invalid API key provided",
      "Bright Data":
        "Connection Error: Failed to connect to proxy - Check your proxy configuration",
      ParseHub: "Error: API rate limit exceeded - Please try again later",
      Cheerio:
        "TypeError: Cannot read property 'find' of undefined - Invalid HTML structure",
      Colly:
        "Error: package github.com/gocolly/colly/v2: cannot find package - Run go get -u github.com/gocolly/colly/v2",
    };

    return (
      errors[toolName as keyof typeof errors] ||
      "Unknown error occurred during test execution"
    );
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "running":
        return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "running":
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  // Filter results based on active tab
  const filteredResults =
    activeTab === "all"
      ? results
      : activeTab === "passed"
        ? results.filter((r) => r.status === "success")
        : activeTab === "failed"
          ? results.filter((r) => r.status === "error")
          : results.filter((r) => r.category === activeTab);

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Scraper Tool Test Runner</h3>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() =>
                runTests(
                  activeTab !== "passed" && activeTab !== "failed"
                    ? activeTab
                    : "all",
                )
              }
              disabled={isRunning}
            >
              {isRunning ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run Tests
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setResults([]);
                setSelectedTest(null);
                setProgress(0);
              }}
              disabled={isRunning}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {isRunning && (
          <div className="mt-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Running tests... {progress}% complete
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r">
          <Tabs
            defaultValue="all"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <div className="border-b px-4">
              <TabsList className="bg-transparent h-10">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
                >
                  All Tests
                </TabsTrigger>
                <TabsTrigger
                  value="passed"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
                >
                  Passed
                </TabsTrigger>
                <TabsTrigger
                  value="failed"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
                >
                  Failed
                </TabsTrigger>
                <TabsTrigger
                  value="Framework"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
                >
                  Frameworks
                </TabsTrigger>
                <TabsTrigger
                  value="Parser"
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10"
                >
                  Parsers
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[calc(100vh-220px)] p-4">
              <div className="space-y-2">
                {filteredResults.length > 0 ? (
                  filteredResults.map((result) => (
                    <Card
                      key={result.id}
                      className={`cursor-pointer ${selectedTest?.id === result.id ? "ring-2 ring-primary" : ""}`}
                      onClick={() => setSelectedTest(result)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.status)}
                            <div>
                              <h4 className="font-medium">{result.toolName}</h4>
                              <p className="text-xs text-muted-foreground">
                                {result.category}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(result.status)}
                            {result.duration && (
                              <span className="text-xs text-muted-foreground">
                                {result.duration}ms
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mb-2 opacity-50" />
                    <p>No test results to display</p>
                    <p className="text-sm">Run tests to see results here</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        <div className="w-1/2 p-4">
          {selectedTest ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  {selectedTest.toolName}
                  {getStatusBadge(selectedTest.status)}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTest.category} • Test ID: {selectedTest.id}
                </p>
                {selectedTest.timestamp && (
                  <p className="text-xs text-muted-foreground">
                    Run at: {selectedTest.timestamp.toLocaleString()}
                  </p>
                )}
              </div>

              {selectedTest.status === "error" && selectedTest.errorDetails && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Error Details
                  </h4>
                  <pre className="text-xs font-mono bg-red-100 p-2 rounded overflow-x-auto">
                    {selectedTest.errorDetails}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium mb-2">Test Logs</h4>
                <div className="bg-muted rounded-md p-2 font-mono text-xs">
                  <ScrollArea className="h-64">
                    {selectedTest.logs?.map((log, i) => (
                      <div key={i} className="mb-1">
                        {log}
                      </div>
                    )) || (
                      <div className="text-muted-foreground">
                        No logs available
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Recommended Fix</h4>
                {selectedTest.status === "error" ? (
                  <div className="bg-muted rounded-md p-3">
                    <p className="text-sm mb-2">
                      {selectedTest.toolName === "Scrapy Framework" &&
                        "Install Scrapy using pip and ensure Python environment is properly configured."}
                      {selectedTest.toolName === "Playwright" &&
                        "Run 'npx playwright install' to download required browser binaries."}
                      {selectedTest.toolName === "Puppeteer" &&
                        "Install missing Chromium dependencies or use puppeteer-core with existing Chrome."}
                      {selectedTest.toolName === "Selenium WebDriver" &&
                        "Update ChromeDriver to match your Chrome version or use WebDriverManager."}
                      {selectedTest.toolName === "BeautifulSoup" &&
                        "Install BeautifulSoup using 'pip install beautifulsoup4' and verify Python environment."}
                      {selectedTest.toolName === "Apify Platform" &&
                        "Set APIFY_TOKEN environment variable with a valid Apify API token."}
                      {selectedTest.toolName === "Octoparse" &&
                        "Verify Octoparse API credentials and ensure they have proper permissions."}
                      {selectedTest.toolName === "ScrapingBee API" &&
                        "Check your ScrapingBee API key and ensure it's valid and has sufficient credits."}
                      {selectedTest.toolName === "Bright Data" &&
                        "Verify proxy configuration including username, password, and proxy address."}
                      {selectedTest.toolName === "ParseHub" &&
                        "Check API usage limits or contact ParseHub support to increase your rate limit."}
                      {selectedTest.toolName === "Cheerio" &&
                        "Verify the HTML structure being parsed and ensure it contains the expected elements."}
                      {selectedTest.toolName === "Colly" &&
                        "Install Colly using 'go get -u github.com/gocolly/colly/v2' and check Go environment."}
                    </p>
                    <div className="bg-muted-foreground/10 p-2 rounded">
                      <Code className="h-4 w-4 inline-block mr-2" />
                      <span className="text-xs font-mono">
                        {selectedTest.toolName === "Scrapy Framework" &&
                          "pip install scrapy"}
                        {selectedTest.toolName === "Playwright" &&
                          "npm install playwright && npx playwright install"}
                        {selectedTest.toolName === "Puppeteer" &&
                          "npm install puppeteer"}
                        {selectedTest.toolName === "Selenium WebDriver" &&
                          "npm install selenium-webdriver chromedriver"}
                        {selectedTest.toolName === "BeautifulSoup" &&
                          "pip install beautifulsoup4 lxml"}
                        {selectedTest.toolName === "Apify Platform" &&
                          "export APIFY_TOKEN=your_token_here"}
                        {selectedTest.toolName === "Octoparse" &&
                          "Check API key in Secrets Manager"}
                        {selectedTest.toolName === "ScrapingBee API" &&
                          "Check API key in Secrets Manager"}
                        {selectedTest.toolName === "Bright Data" &&
                          "Check proxy configuration in Secrets Manager"}
                        {selectedTest.toolName === "ParseHub" &&
                          "Contact ParseHub support to increase rate limit"}
                        {selectedTest.toolName === "Cheerio" &&
                          "npm install cheerio"}
                        {selectedTest.toolName === "Colly" &&
                          "go get -u github.com/gocolly/colly/v2"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-md p-3">
                    <p className="text-sm text-green-800">
                      No fixes needed. All tests passed successfully.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Terminal className="h-12 w-12 mb-2 opacity-50" />
              <p>Select a test to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRunner;
