import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Code,
  FileCode,
  Copy,
  Download,
  Terminal,
  Wrench,
  Zap,
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

interface TestFixGeneratorProps {
  testResults: TestResult[];
  onFixApply?: (fix: any) => void;
}

const TestFixGenerator: React.FC<TestFixGeneratorProps> = ({
  testResults = [],
  onFixApply = () => {},
}) => {
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [generatingFix, setGeneratingFix] = useState<boolean>(false);
  const [fixCode, setFixCode] = useState<string>("");
  const [fixDescription, setFixDescription] = useState<string>("");
  const [fixApplied, setFixApplied] = useState<boolean>(false);

  const failedTests = testResults.filter((test) => test.status === "error");

  const generateFix = async (test: TestResult) => {
    setSelectedTool(test.toolName);
    setGeneratingFix(true);
    setFixApplied(false);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate mock fix based on tool type
    const fix = getMockFix(test.toolName);
    setFixCode(fix.code);
    setFixDescription(fix.description);
    setGeneratingFix(false);
  };

  const applyFix = () => {
    // Simulate applying the fix
    setFixApplied(true);
    onFixApply({
      tool: selectedTool,
      code: fixCode,
      description: fixDescription,
    });
  };

  const getMockFix = (toolName: string) => {
    const fixes: Record<string, { code: string; description: string }> = {
      "Scrapy Framework": {
        code: `# Install Scrapy
pip install scrapy

# Create a basic spider
import scrapy

class ExampleSpider(scrapy.Spider):
    name = 'example'
    start_urls = ['https://example.com']
    
    def parse(self, response):
        yield {'title': response.css('h1::text').get()}
`,
        description:
          "Install Scrapy using pip and create a basic spider to verify functionality. Make sure your Python environment is properly configured.",
      },
      Playwright: {
        code: `// Install Playwright and browsers
npm install playwright
npx playwright install

// Basic test script
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  console.log(await page.title());
  await browser.close();
})();
`,
        description:
          "Install Playwright and required browser binaries. Create a basic script to verify browser automation is working correctly.",
      },
      Puppeteer: {
        code: `// Install Puppeteer
npm install puppeteer

// Basic test script
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://example.com');
  console.log(await page.title());
  await browser.close();
})();
`,
        description:
          "Install Puppeteer and create a basic script with appropriate launch arguments to avoid sandbox issues in containerized environments.",
      },
      "Selenium WebDriver": {
        code: `// Install Selenium and ChromeDriver
npm install selenium-webdriver chromedriver

// Basic test script
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function example() {
  let options = new chrome.Options();
  options.addArguments('--headless');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
    
  try {
    await driver.get('https://example.com');
    const title = await driver.getTitle();
    console.log(title);
  } finally {
    await driver.quit();
  }
})();
`,
        description:
          "Install Selenium WebDriver and ChromeDriver with matching versions. Create a basic script with headless mode to verify functionality.",
      },
      BeautifulSoup: {
        code: `# Install BeautifulSoup and parser
pip install beautifulsoup4 lxml

# Basic test script
import requests
from bs4 import BeautifulSoup

response = requests.get('https://example.com')
soup = BeautifulSoup(response.content, 'lxml')
print(soup.title.string)
`,
        description:
          "Install BeautifulSoup and the lxml parser. Create a basic script to verify HTML parsing functionality.",
      },
      "Apify Platform": {
        code: `// Install Apify SDK
npm install apify

// Set environment variable
// export APIFY_TOKEN=your_token_here

// Basic test script
const Apify = require('apify');

Apify.main(async () => {
  console.log('APIFY_TOKEN:', process.env.APIFY_TOKEN);
  
  const requestList = await Apify.openRequestList('start-urls', [
    { url: 'https://example.com' },
  ]);

  const crawler = new Apify.CheerioCrawler({
    requestList,
    handlePageFunction: async ({ request, $ }) => {
      const title = $('title').text();
      console.log("Title: " + title);
      await Apify.pushData({ url: request.url, title });
    },
  });

  await crawler.run();
});
`,
        description:
          "Install Apify SDK and set the APIFY_TOKEN environment variable. Create a basic crawler to verify functionality.",
      },
      Octoparse: {
        code: `// Octoparse API credentials setup
const apiKey = process.env.OCTOPARSE_API_KEY;
const apiSecret = process.env.OCTOPARSE_API_SECRET;

// Basic API request
async function testOctoparseAPI() {
  const response = await fetch('https://openapi.octoparse.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: apiKey,
      client_secret: apiSecret
    })
  });
  
  const data = await response.json();
  console.log('Authentication response:', data);
  return data.access_token;
}

testOctoparseAPI().catch(console.error);
`,
        description:
          "Set up Octoparse API credentials in environment variables and create a basic authentication test to verify API access.",
      },
      "ScrapingBee API": {
        code: `// Install axios for API requests
npm install axios

// Basic test script
const axios = require('axios');

async function testScrapingBeeAPI() {
  const apiKey = process.env.SCRAPINGBEE_API_KEY;
  if (!apiKey) {
    throw new Error('SCRAPINGBEE_API_KEY environment variable not set');
  }
  
  const url = 'https://example.com';
  const encodedUrl = encodeURIComponent(url);
  
  try {
    const response = await axios.get(
      "https://app.scrapingbee.com/api/v1/?api_key=" + apiKey + "&url=" + encodedUrl + "&render_js=false"
    );
    
    console.log('Status Code:', response.status);
    console.log('Response size:', response.data.length);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

testScrapingBeeAPI().catch(console.error);
`,
        description:
          "Set up ScrapingBee API key in environment variables and create a basic request to verify API functionality.",
      },
      "Bright Data": {
        code: `// Install required packages
npm install request-promise

// Basic test script
const request = require('request-promise');

async function testBrightDataProxy() {
  const username = process.env.BRIGHT_DATA_USERNAME;
  const password = process.env.BRIGHT_DATA_PASSWORD;
  const port = 22225;
  const session_id = (1000000 * Math.random()) | 0;
  
  const options = {
    uri: 'https://lumtest.com/myip.json',
    proxy: "http://" + username + "-session-" + session_id + ":" + password + "@zproxy.lum-superproxy.io:" + port,
    json: true
  };
  
  try {
    const response = await request(options);
    console.log('Success:', response);
    return response;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

testBrightDataProxy().catch(console.error);
`,
        description:
          "Set up Bright Data credentials in environment variables and create a basic proxy request to verify connectivity.",
      },
      ParseHub: {
        code: `// Install axios for API requests
npm install axios

// Basic test script
const axios = require('axios');

async function testParseHubAPI() {
  const apiKey = process.env.PARSEHUB_API_KEY;
  if (!apiKey) {
    throw new Error('PARSEHUB_API_KEY environment variable not set');
  }
  
  try {
    // Get list of projects
    const response = await axios.get(
      "https://www.parsehub.com/api/v2/projects?api_key=" + apiKey
    );
    
    console.log('Projects:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    throw error;
  }
}

testParseHubAPI().catch(console.error);
`,
        description:
          "Set up ParseHub API key in environment variables and create a basic request to list projects and verify API access.",
      },
      Cheerio: {
        code: `// Install required packages
npm install cheerio axios

// Basic test script
const cheerio = require('cheerio');
const axios = require('axios');

async function testCheerio() {
  try {
    const response = await axios.get('https://example.com');
    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('title').text();
    console.log('Title:', title);
    
    // Extract all links
    const links = [];
    $('a').each((i, element) => {
      links.push($(element).attr('href'));
    });
    console.log('Links found:', links.length);
    
    return { title, links };
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

testCheerio().catch(console.error);
`,
        description:
          "Install Cheerio and Axios packages. Create a basic script to fetch a webpage and parse its content to verify functionality.",
      },
      Colly: {
        code: `// Go code for Colly
package main

import (
	"fmt"

	"github.com/gocolly/colly/v2"
)

func main() {
	// Initialize collector
	c := colly.NewCollector(
		colly.AllowedDomains("example.com"),
	)

	// Extract title
	c.OnHTML("title", func(e *colly.HTMLElement) {
		fmt.Println("Title:", e.Text)
	})

	// Extract all links
	c.OnHTML("a[href]", func(e *colly.HTMLElement) {
		link := e.Attr("href")
		fmt.Printf("Link found: %s\n", link)
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
	})

	c.Visit("https://example.com")
}

// To run: save as main.go, then:
// go mod init scraper
// go get -u github.com/gocolly/colly/v2
// go run main.go
`,
        description:
          "Create a basic Go script using Colly to crawl a website and extract information. Includes instructions for setting up the Go environment.",
      },
    };

    return (
      fixes[toolName] || {
        code: "// No specific fix available for this tool\n// Please check documentation for proper installation and usage",
        description:
          "No specific fix available for this tool. Please refer to the official documentation.",
      }
    );
  };

  return (
    <div className="h-full bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Test Fix Generator</h3>
          <Badge variant="outline">
            {failedTests.length} Failed Test
            {failedTests.length !== 1 ? "s" : ""}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate and apply fixes for failed scraper tool tests
        </p>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/3 border-r">
          <div className="p-4 border-b">
            <h4 className="text-sm font-medium">Failed Tests</h4>
          </div>
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="p-4 space-y-2">
              {failedTests.length > 0 ? (
                failedTests.map((test) => (
                  <Card
                    key={test.id}
                    className={`cursor-pointer ${selectedTool === test.toolName ? "ring-2 ring-primary" : ""}`}
                    onClick={() => generateFix(test)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-500" />
                          <div>
                            <h4 className="font-medium">{test.toolName}</h4>
                            <p className="text-xs text-muted-foreground">
                              {test.category}
                            </p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Wrench className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mb-2 opacity-50" />
                  <p>No failed tests</p>
                  <p className="text-sm">All tests are passing</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        <div className="w-2/3 p-4">
          {selectedTool ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{selectedTool} Fix</h3>
                {fixApplied && (
                  <Badge className="bg-green-100 text-green-800">
                    Fix Applied
                  </Badge>
                )}
              </div>

              {generatingFix ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Zap className="h-12 w-12 mb-4 animate-pulse text-primary" />
                  <p>Generating fix for {selectedTool}...</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Analyzing error patterns and creating solution
                  </p>
                </div>
              ) : (
                <>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{fixDescription}</AlertDescription>
                  </Alert>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Fix Implementation</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigator.clipboard.writeText(fixCode)}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-3 w-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted rounded-md">
                      <ScrollArea className="h-64">
                        <pre className="p-4 text-sm font-mono">{fixCode}</pre>
                      </ScrollArea>
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedTool("")}
                    >
                      Cancel
                    </Button>
                    <Button onClick={applyFix} disabled={fixApplied}>
                      {fixApplied ? "Fix Applied" : "Apply Fix"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileCode className="h-12 w-12 mb-2 opacity-50" />
              <p>Select a failed test to generate a fix</p>
              <p className="text-sm">
                Fixes will be customized for each tool's specific error
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestFixGenerator;
