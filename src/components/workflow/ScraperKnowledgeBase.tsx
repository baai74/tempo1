import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  ExternalLink,
  Code,
  Settings,
  Zap,
  Globe,
  Bot,
  Database,
} from "lucide-react";

interface ScraperTool {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  pricing: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  documentation: {
    quickStart: string;
    apiReference: string;
    examples: string[];
    configuration: Record<string, any>;
  };
  useCases: string[];
  pros: string[];
  cons: string[];
}

const ScraperKnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const scraperTools: ScraperTool[] = [
    {
      id: "scrapy-framework",
      name: "Scrapy Framework",
      category: "Framework",
      description:
        "Fast, high-level web crawling and scraping framework for Python",
      features: [
        "Asynchronous processing",
        "Built-in data export",
        "Middleware support",
        "Request/Response handling",
        "Auto-throttling",
      ],
      pricing: "Free (Open Source)",
      difficulty: "Advanced",
      documentation: {
        quickStart: "pip install scrapy && scrapy startproject myproject",
        apiReference: "https://docs.scrapy.org/en/latest/",
        examples: [
          "Basic spider creation",
          "Data pipeline setup",
          "Middleware configuration",
        ],
        configuration: {
          robotsTxt: true,
          downloadDelay: 1,
          concurrentRequests: 16,
          userAgent: "Scrapy Bot",
        },
      },
      useCases: [
        "Large-scale web scraping",
        "E-commerce data extraction",
        "News aggregation",
        "Price monitoring",
      ],
      pros: [
        "High performance",
        "Extensive customization",
        "Built-in data handling",
        "Active community",
      ],
      cons: [
        "Steep learning curve",
        "Python knowledge required",
        "Complex setup for beginners",
      ],
    },
    {
      id: "playwright-scraper",
      name: "Playwright",
      category: "Browser Automation",
      description:
        "Modern browser automation library for reliable end-to-end testing and scraping",
      features: [
        "Multi-browser support",
        "Auto-wait functionality",
        "Network interception",
        "Mobile emulation",
        "Screenshot capture",
      ],
      pricing: "Free (Open Source)",
      difficulty: "Intermediate",
      documentation: {
        quickStart: "npm install playwright && npx playwright install",
        apiReference: "https://playwright.dev/docs/intro",
        examples: [
          "Page navigation",
          "Element interaction",
          "Data extraction",
          "Screenshot automation",
        ],
        configuration: {
          headless: true,
          timeout: 30000,
          viewport: { width: 1280, height: 720 },
          userAgent: "Mozilla/5.0...",
        },
      },
      useCases: [
        "SPA scraping",
        "Dynamic content extraction",
        "Form automation",
        "Testing automation",
      ],
      pros: [
        "Handles modern web apps",
        "Fast and reliable",
        "Cross-browser support",
        "Great documentation",
      ],
      cons: [
        "Resource intensive",
        "Requires browser installation",
        "Limited mobile support",
      ],
    },
    {
      id: "puppeteer-scraper",
      name: "Puppeteer",
      category: "Browser Automation",
      description:
        "Node.js library for controlling Chrome/Chromium browsers programmatically",
      features: [
        "Chrome DevTools Protocol",
        "Headless mode",
        "Page screenshots",
        "PDF generation",
        "Performance tracing",
      ],
      pricing: "Free (Open Source)",
      difficulty: "Intermediate",
      documentation: {
        quickStart: "npm install puppeteer",
        apiReference: "https://pptr.dev/",
        examples: [
          "Browser launch",
          "Page navigation",
          "Element selection",
          "Screenshot capture",
        ],
        configuration: {
          headless: true,
          defaultViewport: { width: 1280, height: 800 },
          slowMo: 0,
          userDataDir: "./user_data",
        },
      },
      useCases: [
        "SPA scraping",
        "PDF generation",
        "Performance testing",
        "Automated testing",
      ],
      pros: [
        "Chrome DevTools integration",
        "Active development",
        "Good documentation",
        "Large community",
      ],
      cons: [
        "Chrome/Chromium only",
        "Memory intensive",
        "Less stable than some alternatives",
      ],
    },
    {
      id: "selenium-scraper",
      name: "Selenium WebDriver",
      category: "Browser Automation",
      description:
        "Cross-browser automation framework for browser-based regression automation",
      features: [
        "Multi-browser support",
        "Language bindings",
        "Wait conditions",
        "Page object model",
        "Grid for parallel testing",
      ],
      pricing: "Free (Open Source)",
      difficulty: "Intermediate",
      documentation: {
        quickStart: "npm install selenium-webdriver",
        apiReference: "https://www.selenium.dev/documentation/",
        examples: [
          "Browser initialization",
          "Element location",
          "Action chains",
          "Wait strategies",
        ],
        configuration: {
          implicitWait: 10000,
          pageLoadTimeout: 30000,
          browser: "chrome",
          headless: false,
        },
      },
      useCases: [
        "Cross-browser testing",
        "Legacy website scraping",
        "Form automation",
        "UI testing",
      ],
      pros: [
        "Browser compatibility",
        "Language flexibility",
        "Mature ecosystem",
        "Industry standard",
      ],
      cons: [
        "Slower than alternatives",
        "Flaky tests",
        "Complex setup",
        "WebDriver dependency",
      ],
    },
    {
      id: "beautifulsoup-scraper",
      name: "BeautifulSoup",
      category: "Parser",
      description:
        "Python library for parsing HTML and XML documents with simple methods for navigating, searching, and modifying",
      features: [
        "HTML/XML parsing",
        "CSS selector support",
        "Tree navigation",
        "Content extraction",
        "Document modification",
      ],
      pricing: "Free (Open Source)",
      difficulty: "Beginner",
      documentation: {
        quickStart: "pip install beautifulsoup4",
        apiReference: "https://www.crummy.com/software/BeautifulSoup/bs4/doc/",
        examples: [
          "HTML parsing",
          "Element selection",
          "Data extraction",
          "Document traversal",
        ],
        configuration: {
          parser: "html.parser",
          features: "lxml",
          parseOnly: null,
          fromEncoding: null,
        },
      },
      useCases: [
        "Static website scraping",
        "Content extraction",
        "Data cleaning",
        "HTML manipulation",
      ],
      pros: [
        "Easy to learn",
        "Excellent documentation",
        "Forgiving parser",
        "Python integration",
      ],
      cons: [
        "No JavaScript execution",
        "Slower for large documents",
        "Limited to parsing only",
      ],
    },
    {
      id: "apify-scraper",
      name: "Apify Platform",
      category: "Cloud Platform",
      description:
        "Full-stack web scraping and automation platform with cloud infrastructure",
      features: [
        "Pre-built scrapers",
        "Cloud infrastructure",
        "Data storage",
        "Scheduling",
        "Proxy management",
      ],
      pricing: "Freemium ($49-$499/month)",
      difficulty: "Beginner",
      documentation: {
        quickStart: "Create account -> Choose scraper -> Configure -> Run",
        apiReference: "https://docs.apify.com/",
        examples: [
          "Store scraper setup",
          "Social media extraction",
          "Real estate data",
          "Job listings scraping",
        ],
        configuration: {
          maxConcurrency: 10,
          memoryMbytes: 1024,
          timeoutSecs: 3600,
          proxyGroups: ["RESIDENTIAL"],
        },
      },
      useCases: [
        "E-commerce monitoring",
        "Lead generation",
        "Market research",
        "Content aggregation",
      ],
      pros: [
        "No infrastructure setup",
        "Ready-made scrapers",
        "Scalable",
        "Good support",
      ],
      cons: ["Subscription cost", "Limited customization", "Vendor lock-in"],
    },
    {
      id: "octoparse-scraper",
      name: "Octoparse",
      category: "Visual Tool",
      description:
        "No-code visual web scraping tool with point-and-click interface",
      features: [
        "Visual workflow builder",
        "Cloud extraction",
        "Scheduled tasks",
        "Data export options",
        "API access",
      ],
      pricing: "Freemium ($75-$249/month)",
      difficulty: "Beginner",
      documentation: {
        quickStart: "Download app -> Create task -> Configure -> Run",
        apiReference: "https://www.octoparse.com/tutorial",
        examples: [
          "E-commerce scraping",
          "Table extraction",
          "Pagination handling",
          "Login automation",
        ],
        configuration: {
          extractionMode: "Standard",
          waitForLoad: 5000,
          exportFormat: "CSV",
          proxyEnabled: false,
        },
      },
      useCases: [
        "Business intelligence",
        "Competitive analysis",
        "Price monitoring",
        "Content aggregation",
      ],
      pros: [
        "No coding required",
        "Visual interface",
        "Cloud execution",
        "Export flexibility",
      ],
      cons: [
        "Limited for complex sites",
        "Subscription cost",
        "Windows desktop app",
      ],
    },
    {
      id: "scrapingbee-scraper",
      name: "ScrapingBee API",
      category: "API Service",
      description:
        "Web scraping API with proxy rotation, JavaScript rendering and anti-bot bypass",
      features: [
        "Proxy rotation",
        "JavaScript rendering",
        "Anti-bot bypass",
        "Geolocation targeting",
        "Custom headers",
      ],
      pricing: "Subscription ($49-$499/month)",
      difficulty: "Beginner",
      documentation: {
        quickStart: "Sign up -> Get API key -> Make API request",
        apiReference: "https://www.scrapingbee.com/documentation/",
        examples: [
          "Basic API request",
          "JavaScript rendering",
          "Custom headers",
          "Proxy selection",
        ],
        configuration: {
          apiKey: "YOUR_API_KEY",
          renderJs: true,
          premium: false,
          countryCode: "us",
        },
      },
      useCases: [
        "E-commerce data",
        "SPA scraping",
        "Price monitoring",
        "Content extraction",
      ],
      pros: [
        "No proxy management",
        "Simple integration",
        "Anti-bot handling",
        "JavaScript support",
      ],
      cons: [
        "API request limits",
        "Subscription cost",
        "Less control",
        "Dependency on service",
      ],
    },
    {
      id: "brightdata-scraper",
      name: "Bright Data",
      category: "Proxy Network",
      description:
        "Enterprise-grade web data platform with advanced proxy infrastructure",
      features: [
        "Residential proxies",
        "Data collector",
        "Web unlocker",
        "SERP API",
        "E-commerce API",
      ],
      pricing: "Enterprise ($500+/month)",
      difficulty: "Advanced",
      documentation: {
        quickStart: "Contact sales -> Setup account -> Configure -> Deploy",
        apiReference: "https://brightdata.com/documentation",
        examples: [
          "Proxy integration",
          "Web scraper setup",
          "Data collector configuration",
          "SERP extraction",
        ],
        configuration: {
          proxyType: "Residential",
          country: "all",
          session: "sticky",
          rotationInterval: 10,
        },
      },
      useCases: [
        "Large-scale data collection",
        "Competitive intelligence",
        "Market research",
        "Brand protection",
      ],
      pros: [
        "Enterprise reliability",
        "Global proxy network",
        "Advanced features",
        "Dedicated support",
      ],
      cons: [
        "High cost",
        "Complex setup",
        "Enterprise focus",
        "Steep learning curve",
      ],
    },
    {
      id: "parsehub-scraper",
      name: "ParseHub",
      category: "Visual Tool",
      description:
        "Visual point-and-click web scraper with advanced selection capabilities",
      features: [
        "Visual selection",
        "Multi-page navigation",
        "JavaScript rendering",
        "Conditional logic",
        "Scheduled runs",
      ],
      pricing: "Freemium ($149-$499/month)",
      difficulty: "Beginner",
      documentation: {
        quickStart: "Download app -> Create project -> Select data -> Run",
        apiReference: "https://www.parsehub.com/docs/ref",
        examples: [
          "Basic selection",
          "Pagination handling",
          "Conditional extraction",
          "Template creation",
        ],
        configuration: {
          waitLoad: 5000,
          renderJs: true,
          exportFormat: "JSON",
          scheduling: "weekly",
        },
      },
      useCases: [
        "E-commerce data",
        "Real estate listings",
        "News aggregation",
        "Research data collection",
      ],
      pros: [
        "No coding required",
        "Powerful selection tools",
        "Handles complex sites",
        "Good for non-technical users",
      ],
      cons: [
        "Desktop application required",
        "Limited API functionality",
        "Subscription cost",
        "Performance limitations",
      ],
    },
    {
      id: "cheerio-scraper",
      name: "Cheerio",
      category: "Parser",
      description:
        "Fast, flexible and lean implementation of jQuery for server-side HTML parsing",
      features: [
        "jQuery-like syntax",
        "Fast parsing",
        "Low memory usage",
        "CSS selector support",
        "DOM manipulation",
      ],
      pricing: "Free (Open Source)",
      difficulty: "Beginner",
      documentation: {
        quickStart: "npm install cheerio",
        apiReference: "https://cheerio.js.org/",
        examples: [
          "HTML parsing",
          "Element selection",
          "Data extraction",
          "DOM traversal",
        ],
        configuration: {
          xmlMode: false,
          decodeEntities: true,
          normalizeWhitespace: false,
          withDomLvl1: true,
        },
      },
      useCases: [
        "Static website scraping",
        "RSS feed parsing",
        "Content extraction",
        "Data transformation",
      ],
      pros: [
        "Lightweight",
        "Fast performance",
        "jQuery familiarity",
        "Low resource usage",
      ],
      cons: [
        "No JavaScript execution",
        "Static content only",
        "Limited to parsing",
      ],
    },
    {
      id: "colly-scraper",
      name: "Colly",
      category: "Framework",
      description:
        "Elegant scraping framework for Go with speed and extensibility",
      features: [
        "Concurrent scraping",
        "Cookie handling",
        "Proxy switching",
        "Rate limiting",
        "Cache management",
      ],
      pricing: "Free (Open Source)",
      difficulty: "Intermediate",
      documentation: {
        quickStart: "go get -u github.com/gocolly/colly/v2",
        apiReference: "http://go-colly.org/docs/",
        examples: [
          "Basic collector",
          "Parallel scraping",
          "Form submission",
          "Proxy rotation",
        ],
        configuration: {
          maxDepth: 2,
          allowedDomains: ["example.com"],
          userAgent: "Colly Scraper",
          maxBodySize: 10 * 1024 * 1024,
        },
      },
      useCases: [
        "High-performance scraping",
        "Distributed systems",
        "API development",
        "Data pipelines",
      ],
      pros: [
        "High performance",
        "Low memory footprint",
        "Concurrent design",
        "Go language benefits",
      ],
      cons: [
        "Go knowledge required",
        "Less mature ecosystem",
        "Fewer examples than Python",
      ],
    },
  ];

  const categories = [
    "all",
    "Framework",
    "Browser Automation",
    "Cloud Platform",
    "API Service",
    "Parser",
    "Visual Tool",
    "Proxy Network",
  ];

  const filteredTools = scraperTools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800";
      case "Advanced":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="w-full h-full bg-background p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Scraper Knowledge Base</h1>
        <p className="text-muted-foreground">
          Comprehensive documentation and configuration guide for scraping tools
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search scraping tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category === "all" ? "All Categories" : category}
            </option>
          ))}
        </select>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <Card key={tool.id} className="h-fit">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <Badge variant="outline" className="mt-1">
                    {tool.category}
                  </Badge>
                </div>
                <Badge className={getDifficultyColor(tool.difficulty)}>
                  {tool.difficulty}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {tool.description}
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="config">Config</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="docs">Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Key Features</h4>
                    <div className="flex flex-wrap gap-1">
                      {tool.features.slice(0, 3).map((feature) => (
                        <Badge
                          key={feature}
                          variant="secondary"
                          className="text-xs"
                        >
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Pricing</h4>
                    <p className="text-sm text-muted-foreground">
                      {tool.pricing}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Best For</h4>
                    <ul className="text-sm text-muted-foreground">
                      {tool.useCases.slice(0, 2).map((useCase) => (
                        <li key={useCase}>• {useCase}</li>
                      ))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="config" className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Quick Start</h4>
                    <code className="text-xs bg-muted p-2 rounded block">
                      {tool.documentation.quickStart}
                    </code>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Configuration</h4>
                    <div className="text-xs space-y-1">
                      {Object.entries(tool.documentation.configuration).map(
                        ([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-muted-foreground">
                              {key}:
                            </span>
                            <span>{String(value)}</span>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="examples" className="space-y-3">
                  <div>
                    <h4 className="font-medium mb-2">Code Examples</h4>
                    <div className="space-y-2">
                      {tool.documentation.examples.map((example) => (
                        <div key={example} className="flex items-center gap-2">
                          <Code className="h-3 w-3" />
                          <span className="text-xs">{example}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Pros & Cons</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-green-600 font-medium">
                          Pros:
                        </span>
                        <ul className="text-muted-foreground">
                          {tool.pros.slice(0, 2).map((pro) => (
                            <li key={pro}>+ {pro}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">Cons:</span>
                        <ul className="text-muted-foreground">
                          {tool.cons.slice(0, 2).map((con) => (
                            <li key={con}>- {con}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="docs" className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    asChild
                  >
                    <a
                      href={tool.documentation.apiReference}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-2" />
                      Official Documentation
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <Settings className="h-3 w-3 mr-2" />
                    Configure in Workflow
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ScraperKnowledgeBase;
