import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Settings,
  Code,
  Key,
  Globe,
  Zap,
  Database,
  AlertCircle,
  CheckCircle,
  Copy,
  Shield,
  Plus,
} from "lucide-react";
import SecretsManager from "./SecretsManager";

interface ScraperConfig {
  id: string;
  name: string;
  type: string;
  settings: Record<string, any>;
  credentials: Record<string, string>;
  advanced: Record<string, any>;
  secretRefs: Record<string, string>; // References to secrets by ID
}

interface Secret {
  id: string;
  name: string;
  type: string;
  value: string;
  description?: string;
  category: string;
}

interface ScraperConfigPanelProps {
  selectedNode?: string;
  onConfigSave?: (config: ScraperConfig) => void;
  onTestConnection?: (config: ScraperConfig) => Promise<boolean>;
}

const ScraperConfigPanel = ({
  selectedNode = "",
  onConfigSave = () => {},
  onTestConnection = async () => true,
}: ScraperConfigPanelProps) => {
  const [config, setConfig] = useState<ScraperConfig>({
    id: selectedNode,
    name: "Untitled Scraper",
    type: "scrapy-framework",
    settings: {
      url: "",
      selectors: {},
      delay: 1000,
      retries: 3,
      timeout: 30000,
    },
    credentials: {
      apiKey: "",
      username: "",
      password: "",
    },
    advanced: {
      userAgent: "Mozilla/5.0 (compatible; ScraperBot/1.0)",
      headers: {},
      cookies: {},
      proxy: "",
      javascript: false,
      respectRobots: true,
    },
    secretRefs: {},
  });

  const [showSecretsManager, setShowSecretsManager] = useState(false);
  const [requiredSecrets, setRequiredSecrets] = useState([
    {
      name: "API Key",
      type: "api_key",
      description: "API key for scraping service",
    },
    {
      name: "Database Password",
      type: "password",
      description: "Database connection password",
    },
  ]);

  const [testStatus, setTestStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [activeTab, setActiveTab] = useState("basic");

  const scraperTemplates = {
    "scrapy-framework": {
      name: "Scrapy Framework",
      fields: {
        basic: ["url", "selectors", "delay"],
        credentials: ["apiKey"],
        advanced: ["userAgent", "respectRobots", "javascript"],
      },
    },
    "playwright-scraper": {
      name: "Playwright",
      fields: {
        basic: ["url", "selectors", "timeout"],
        credentials: [],
        advanced: ["userAgent", "javascript", "proxy"],
      },
    },
    "puppeteer-scraper": {
      name: "Puppeteer",
      fields: {
        basic: ["url", "selectors", "timeout"],
        credentials: [],
        advanced: ["userAgent", "javascript", "headless"],
      },
    },
    "selenium-scraper": {
      name: "Selenium WebDriver",
      fields: {
        basic: ["url", "selectors", "timeout"],
        credentials: [],
        advanced: ["browser", "headless", "implicitWait"],
      },
    },
    "beautifulsoup-scraper": {
      name: "BeautifulSoup",
      fields: {
        basic: ["url", "selectors"],
        credentials: [],
        advanced: ["parser", "features"],
      },
    },
    "apify-scraper": {
      name: "Apify Platform",
      fields: {
        basic: ["url", "selectors"],
        credentials: ["apiKey"],
        advanced: ["proxy", "javascript"],
      },
    },
    "octoparse-scraper": {
      name: "Octoparse",
      fields: {
        basic: ["url", "selectors"],
        credentials: ["apiKey", "username", "password"],
        advanced: ["extractionMode", "waitForLoad", "exportFormat"],
      },
    },
    "scrapingbee-scraper": {
      name: "ScrapingBee API",
      fields: {
        basic: ["url"],
        credentials: ["apiKey"],
        advanced: ["renderJs", "premium", "countryCode"],
      },
    },
    "brightdata-scraper": {
      name: "Bright Data",
      fields: {
        basic: ["url", "selectors"],
        credentials: ["apiKey", "username", "password"],
        advanced: ["proxyType", "country", "session", "rotationInterval"],
      },
    },
    "parsehub-scraper": {
      name: "ParseHub",
      fields: {
        basic: ["url", "selectors"],
        credentials: ["apiKey"],
        advanced: ["waitLoad", "renderJs", "exportFormat"],
      },
    },
    "cheerio-scraper": {
      name: "Cheerio",
      fields: {
        basic: ["url", "selectors"],
        credentials: [],
        advanced: ["xmlMode", "decodeEntities", "normalizeWhitespace"],
      },
    },
    "colly-scraper": {
      name: "Colly",
      fields: {
        basic: ["url", "selectors", "maxDepth"],
        credentials: [],
        advanced: ["allowedDomains", "userAgent", "maxBodySize"],
      },
    },
  };

  const handleConfigChange = (
    section: keyof ScraperConfig,
    key: string,
    value: any,
  ) => {
    setConfig((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
  };

  const handleTestConnection = async () => {
    setTestStatus("testing");
    try {
      const success = await onTestConnection(config);
      setTestStatus(success ? "success" : "error");
      setTimeout(() => setTestStatus("idle"), 3000);
    } catch (error) {
      setTestStatus("error");
      setTimeout(() => setTestStatus("idle"), 3000);
    }
  };

  const handleSaveConfig = () => {
    onConfigSave(config);
  };

  const generateCode = () => {
    const codeTemplates = {
      "scrapy-framework": `
import scrapy
import os

class ${config.name.replace(/\s+/g, "")}Spider(scrapy.Spider):
    name = '${config.name.toLowerCase().replace(/\s+/g, "_")}'
    start_urls = ['${config.settings.url}']
    
    def __init__(self):
        # Load secrets from environment or secrets manager
        self.api_key = os.getenv('${config.secretRefs.apiKey || "SCRAPER_API_KEY"}', 'SECRET_NOT_SET')
        
    def parse(self, response):
        # Extract data using selectors
        data = {
            'title': response.css('${config.settings.selectors.title || "h1::text"}').get(),
            'description': response.css('${config.settings.selectors.description || "p::text"}').get(),
        }
        yield data
`,
      "playwright-scraper": `
const { chromium } = require('playwright');

(async () => {
  // Load secrets from environment or secrets manager
  const apiKey = process.env.${config.secretRefs.apiKey || "SCRAPER_API_KEY"} || 'SECRET_NOT_SET';
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set authorization header if API key is available
  if (apiKey !== 'SECRET_NOT_SET') {
    await page.setExtraHTTPHeaders({
      'Authorization': \`Bearer \${apiKey}\`
    });
  }
  
  await page.goto('${config.settings.url}');
  
  const data = await page.evaluate(() => {
    return {
      title: document.querySelector('${config.settings.selectors.title || "h1"}')?.textContent,
      description: document.querySelector('${config.settings.selectors.description || "p"}')?.textContent,
    };
  });
  
  console.log(data);
  await browser.close();
})();
`,
      "puppeteer-scraper": `
const puppeteer = require('puppeteer');

(async () => {
  // Load secrets from environment or secrets manager
  const apiKey = process.env.${config.secretRefs.apiKey || "SCRAPER_API_KEY"} || 'SECRET_NOT_SET';
  
  const browser = await puppeteer.launch({
    headless: ${config.advanced.headless || true},
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set user agent
  await page.setUserAgent('${config.advanced.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}');
  
  // Set authorization header if API key is available
  if (apiKey !== 'SECRET_NOT_SET') {
    await page.setExtraHTTPHeaders({
      'Authorization': \`Bearer \${apiKey}\`
    });
  }
  
  await page.goto('${config.settings.url}', {
    waitUntil: 'networkidle2',
    timeout: ${config.settings.timeout || 30000}
  });
  
  const data = await page.evaluate(() => {
    return {
      title: document.querySelector('${config.settings.selectors.title || "h1"}')?.textContent,
      description: document.querySelector('${config.settings.selectors.description || "p"}')?.textContent,
    };
  });
  
  console.log(data);
  await browser.close();
})();
`,
      "selenium-scraper": `
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function example() {
  // Load secrets from environment or secrets manager
  const apiKey = process.env.${config.secretRefs.apiKey || "SCRAPER_API_KEY"} || 'SECRET_NOT_SET';
  
  let options = new chrome.Options();
  if (${config.advanced.headless || false}) {
    options.addArguments('--headless');
  }
  
  options.addArguments('--user-agent=${config.advanced.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}');
  
  const driver = await new Builder()
    .forBrowser('${config.advanced.browser || "chrome"}')
    .setChromeOptions(options)
    .build();
    
  try {
    await driver.get('${config.settings.url}');
    
    // Wait for elements to load
    await driver.wait(until.elementLocated(By.css('${config.settings.selectors.title || "h1"}')), ${config.advanced.implicitWait || 10000});
    
    const title = await driver.findElement(By.css('${config.settings.selectors.title || "h1"}')).getText();
    const description = await driver.findElement(By.css('${config.settings.selectors.description || "p"}')).getText();
    
    console.log({ title, description });
    
  } finally {
    await driver.quit();
  }
})();
`,
      "beautifulsoup-scraper": `
import requests
from bs4 import BeautifulSoup
import os

# Load secrets from environment or secrets manager
api_key = os.getenv('${config.secretRefs.apiKey || "SCRAPER_API_KEY"}', 'SECRET_NOT_SET')

# Set headers
headers = {
    'User-Agent': '${config.advanced.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}'
}

# Add authorization if API key is available
if api_key != 'SECRET_NOT_SET':
    headers['Authorization'] = f'Bearer {api_key}'

# Make the request
response = requests.get('${config.settings.url}', headers=headers)

# Parse the HTML content
soup = BeautifulSoup(response.content, '${config.advanced.parser || "html.parser"}', features='${config.advanced.features || "lxml"}')

# Extract data using selectors
data = {
    'title': soup.select_one('${config.settings.selectors.title || "h1"}').text.strip() if soup.select_one('${config.settings.selectors.title || "h1"}') else None,
    'description': soup.select_one('${config.settings.selectors.description || "p"}').text.strip() if soup.select_one('${config.settings.selectors.description || "p"}') else None,
}

print(data)
`,
      "apify-scraper": `
const Apify = require('apify');

Apify.main(async () => {
    // Load secrets from environment or secrets manager
    const apiKey = process.env.${config.secretRefs.apiKey || "APIFY_API_KEY"} || 'SECRET_NOT_SET';
    
    // Initialize the Apify SDK
    const requestList = await Apify.openRequestList('start-urls', [
        { url: '${config.settings.url}' },
    ]);

    const crawler = new Apify.CheerioCrawler({
        requestList,
        maxRequestRetries: ${config.settings.retries || 3},
        handlePageFunction: async ({ request, $ }) => {
            console.log(\`Processing ${request.url}...\`);
            
            // Extract data using selectors
            const data = {
                title: $('${config.settings.selectors.title || "h1"}').text().trim(),
                description: $('${config.settings.selectors.description || "p"}').text().trim(),
            };
            
            // Save the data to the default dataset
            await Apify.pushData(data);
        },
        handleFailedRequestFunction: async ({ request }) => {
            console.log(\`Request ${request.url} failed too many times\`);
        },
    });

    await crawler.run();
    
    console.log('Crawler finished.');
});
`,
      "scrapingbee-scraper": `
const axios = require('axios');
const cheerio = require('cheerio');

// Load secrets from environment or secrets manager
const apiKey = process.env.${config.secretRefs.apiKey || "SCRAPINGBEE_API_KEY"} || 'SECRET_NOT_SET';

if (apiKey === 'SECRET_NOT_SET') {
  console.error('API key not found. Please set the environment variable.');
  process.exit(1);
}

const url = '${config.settings.url}';
const scrapingBeeUrl = \`https://app.scrapingbee.com/api/v1/?api_key=\${apiKey}&url=\${encodeURIComponent(url)}&render_js=${config.advanced.renderJs || true}&premium_proxy=${config.advanced.premium || false}&country_code=${config.advanced.countryCode || "us"}\`;

async function scrape() {
  try {
    const response = await axios.get(scrapingBeeUrl);
    const $ = cheerio.load(response.data);
    
    const data = {
      title: $('${config.settings.selectors.title || "h1"}').text().trim(),
      description: $('${config.settings.selectors.description || "p"}').text().trim(),
    };
    
    console.log(data);
  } catch (error) {
    console.error('Error scraping the website:', error.message);
  }
}

scrape();
`,
      "cheerio-scraper": `
const axios = require('axios');
const cheerio = require('cheerio');

// Load secrets from environment or secrets manager
const apiKey = process.env.${config.secretRefs.apiKey || "SCRAPER_API_KEY"} || 'SECRET_NOT_SET';

async function scrape() {
  try {
    // Set headers
    const headers = {
      'User-Agent': '${config.advanced.userAgent || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"}'
    };
    
    // Add authorization if API key is available
    if (apiKey !== 'SECRET_NOT_SET') {
      headers['Authorization'] = \`Bearer \${apiKey}\`;
    }
    
    const response = await axios.get('${config.settings.url}', { headers });
    
    // Load HTML with Cheerio
    const $ = cheerio.load(response.data, {
      xmlMode: ${config.advanced.xmlMode || false},
      decodeEntities: ${config.advanced.decodeEntities || true},
      normalizeWhitespace: ${config.advanced.normalizeWhitespace || false}
    });
    
    // Extract data using selectors
    const data = {
      title: $('${config.settings.selectors.title || "h1"}').text().trim(),
      description: $('${config.settings.selectors.description || "p"}').text().trim(),
    };
    
    console.log(data);
  } catch (error) {
    console.error('Error scraping the website:', error.message);
  }
}

scrape();
`,
      "colly-scraper": `
package main

import (
	"fmt"
	"os"

	"github.com/gocolly/colly/v2"
)

func main() {
	// Load secrets from environment or secrets manager
	apiKey := os.Getenv("${config.secretRefs.apiKey || "SCRAPER_API_KEY"}")

	// Initialize collector
	c := colly.NewCollector(
		colly.AllowedDomains("${config.advanced.allowedDomains || config.settings.url.replace(/^https?:\/\//, "").split("/")[0]}"),
		colly.MaxDepth(${config.settings.maxDepth || 1}),
		colly.UserAgent("${config.advanced.userAgent || "Colly Scraper"}"),
	)

	// Set up callbacks
	c.OnHTML("${config.settings.selectors.title || "h1"}", func(e *colly.HTMLElement) {
		fmt.Println("Title:", e.Text)
	})

	c.OnHTML("${config.settings.selectors.description || "p"}", func(e *colly.HTMLElement) {
		fmt.Println("Description:", e.Text)
	})

	c.OnRequest(func(r *colly.Request) {
		fmt.Println("Visiting", r.URL)
		if apiKey != "" {
			r.Headers.Set("Authorization", "Bearer "+apiKey)
		}
	})

	c.OnError(func(_ *colly.Response, err error) {
		fmt.Println("Error:", err)
	})

	// Start scraping
	c.Visit("${config.settings.url}")
}
`,
    };

    return (
      codeTemplates[config.type as keyof typeof codeTemplates] ||
      "// Code template not available\n// Please configure secrets in the Secrets Manager"
    );
  };

  if (!selectedNode) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Select a scraper node to configure</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background border-l">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Scraper Configuration</h3>
          <Badge variant="outline">{config.type}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure your scraper settings and credentials
        </p>
      </div>

      <div className="p-4 h-[calc(100%-80px)] overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="secrets">Secrets</TabsTrigger>
            <TabsTrigger value="auth">Auth</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Scraper Name</Label>
              <Input
                id="name"
                value={config.name}
                onChange={(e) =>
                  handleConfigChange("name" as any, "", e.target.value)
                }
                placeholder="Enter scraper name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">Target URL</Label>
              <Input
                id="url"
                value={config.settings.url}
                onChange={(e) =>
                  handleConfigChange("settings", "url", e.target.value)
                }
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="selectors">CSS Selectors (JSON)</Label>
              <Textarea
                id="selectors"
                value={JSON.stringify(config.settings.selectors, null, 2)}
                onChange={(e) => {
                  try {
                    const selectors = JSON.parse(e.target.value);
                    handleConfigChange("settings", "selectors", selectors);
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{\n  "title": "h1",\n  "description": ".description"\n}'
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delay">Delay (ms)</Label>
                <Input
                  id="delay"
                  type="number"
                  value={config.settings.delay}
                  onChange={(e) =>
                    handleConfigChange(
                      "settings",
                      "delay",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retries">Max Retries</Label>
                <Input
                  id="retries"
                  type="number"
                  value={config.settings.retries}
                  onChange={(e) =>
                    handleConfigChange(
                      "settings",
                      "retries",
                      parseInt(e.target.value),
                    )
                  }
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="secrets" className="space-y-4 mt-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Manage sensitive data like API keys and passwords securely.
                Never store secrets directly in your code.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Required Secrets</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSecretsManager(!showSecretsManager)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {showSecretsManager ? "Hide" : "Manage"} Secrets
                </Button>
              </div>

              {requiredSecrets.map((secret, index) => (
                <div key={index} className="p-3 border rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{secret.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {secret.type}
                      </Badge>
                    </div>
                    <Badge
                      variant={
                        config.secretRefs[
                          secret.name.toLowerCase().replace(/\s+/g, "")
                        ]
                          ? "default"
                          : "destructive"
                      }
                    >
                      {config.secretRefs[
                        secret.name.toLowerCase().replace(/\s+/g, "")
                      ]
                        ? "Configured"
                        : "Missing"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {secret.description}
                  </p>
                  {!config.secretRefs[
                    secret.name.toLowerCase().replace(/\s+/g, "")
                  ] && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowSecretsManager(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Secrets Manager
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {showSecretsManager && (
              <div className="border rounded-md">
                <SecretsManager
                  requiredSecrets={requiredSecrets}
                  onSecretSelect={(secret) => {
                    const key = secret.name.toLowerCase().replace(/\s+/g, "");
                    setConfig((prev) => ({
                      ...prev,
                      secretRefs: {
                        ...prev.secretRefs,
                        [key]: secret.id,
                      },
                    }));
                  }}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="auth" className="space-y-4 mt-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                For security, use the Secrets Manager instead of entering
                credentials directly here.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>API Key Reference</Label>
              <div className="flex items-center gap-2">
                <Input
                  value={
                    config.secretRefs.apiKey
                      ? `Secret: ${config.secretRefs.apiKey}`
                      : "No secret configured"
                  }
                  disabled
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowSecretsManager(true)}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username Reference</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={
                      config.secretRefs.username
                        ? `Secret: ${config.secretRefs.username}`
                        : "No secret configured"
                    }
                    disabled
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password Reference</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={
                      config.secretRefs.password
                        ? `Secret: ${config.secretRefs.password}`
                        : "No secret configured"
                    }
                    disabled
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={handleTestConnection}
              disabled={testStatus === "testing" || !config.secretRefs.apiKey}
              className="w-full"
              variant={
                testStatus === "success"
                  ? "default"
                  : testStatus === "error"
                    ? "destructive"
                    : "outline"
              }
            >
              {testStatus === "testing" && (
                <Zap className="h-4 w-4 mr-2 animate-spin" />
              )}
              {testStatus === "success" && (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              {testStatus === "error" && (
                <AlertCircle className="h-4 w-4 mr-2" />
              )}
              {testStatus === "idle" && <Key className="h-4 w-4 mr-2" />}

              {testStatus === "testing"
                ? "Testing..."
                : testStatus === "success"
                  ? "Connection Successful"
                  : testStatus === "error"
                    ? "Connection Failed"
                    : config.secretRefs.apiKey
                      ? "Test Connection"
                      : "Configure Secrets First"}
            </Button>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="userAgent">User Agent</Label>
              <Input
                id="userAgent"
                value={config.advanced.userAgent}
                onChange={(e) =>
                  handleConfigChange("advanced", "userAgent", e.target.value)
                }
                placeholder="Mozilla/5.0..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="proxy">Proxy Server</Label>
              <Input
                id="proxy"
                value={config.advanced.proxy}
                onChange={(e) =>
                  handleConfigChange("advanced", "proxy", e.target.value)
                }
                placeholder="http://proxy:port"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="javascript"
                checked={config.advanced.javascript}
                onCheckedChange={(checked) =>
                  handleConfigChange("advanced", "javascript", checked)
                }
              />
              <Label htmlFor="javascript">Enable JavaScript</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="respectRobots"
                checked={config.advanced.respectRobots}
                onCheckedChange={(checked) =>
                  handleConfigChange("advanced", "respectRobots", checked)
                }
              />
              <Label htmlFor="respectRobots">Respect robots.txt</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="headers">Custom Headers (JSON)</Label>
              <Textarea
                id="headers"
                value={JSON.stringify(config.advanced.headers, null, 2)}
                onChange={(e) => {
                  try {
                    const headers = JSON.parse(e.target.value);
                    handleConfigChange("advanced", "headers", headers);
                  } catch (error) {
                    // Invalid JSON, ignore
                  }
                }}
                placeholder='{\n  "Accept": "application/json",\n  "Authorization": "Bearer token"\n}'
                rows={3}
              />
            </div>
          </TabsContent>

          <TabsContent value="code" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Generated Code</Label>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(generateCode())}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-auto max-h-64">
                  <code>{generateCode()}</code>
                </pre>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Configuration Export</Label>
              <div className="bg-muted p-4 rounded-md">
                <pre className="text-sm overflow-auto max-h-32">
                  <code>
                    {JSON.stringify(
                      {
                        ...config,
                        credentials: "*** SECRETS MANAGED SEPARATELY ***",
                        secretRefs: config.secretRefs,
                      },
                      null,
                      2,
                    )}
                  </code>
                </pre>
              </div>
              <p className="text-xs text-muted-foreground">
                Note: Actual secret values are stored securely and not exported.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 mt-6 pt-4 border-t">
          <Button onClick={handleSaveConfig} className="flex-1">
            <Database className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
          <Button variant="outline" onClick={() => setConfig({ ...config })}>
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScraperConfigPanel;
