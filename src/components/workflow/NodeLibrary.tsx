import React, { useState } from "react";
import { Search, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NodeCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  nodes: NodeType[];
}

interface NodeType {
  id: string;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

interface NodeLibraryProps {
  onNodeDragStart?: (node: NodeType, event: React.DragEvent) => void;
  onNodeSelect?: (nodeId: string) => void;
}

const NodeLibrary = ({
  onNodeDragStart = () => {},
  onNodeSelect = () => {},
}: NodeLibraryProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const nodeCategories: NodeCategory[] = [
    {
      id: "scraper-providers",
      name: "Scraper Providers",
      icon: <div className="w-4 h-4 rounded-full bg-orange-500"></div>,
      nodes: [
        {
          id: "rapidapi-scraper",
          name: "RapidAPI Scraper",
          description: "Connect to RapidAPI scraping services",
        },
        {
          id: "amzchart-scraper",
          name: "AmzChart Scraper",
          description: "Amazon data scraping via AmzChart",
        },
        {
          id: "asindata-scraper",
          name: "AsinData Scraper",
          description: "Product data scraping via AsinData",
        },
        {
          id: "scrapebot-scraper",
          name: "ScrapeBot Scraper",
          description: "Web scraping via ScrapeBot API",
        },
        {
          id: "custom-scraper",
          name: "Custom Scraper",
          description: "Configure custom scraping endpoint",
        },
      ],
    },
    {
      id: "premium-scrapers",
      name: "Premium Scraping Tools",
      icon: (
        <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-red-500"></div>
      ),
      nodes: [
        {
          id: "scrapy-framework",
          name: "Scrapy Framework",
          description: "Python-based web crawling framework",
        },
        {
          id: "playwright-scraper",
          name: "Playwright",
          description: "Modern browser automation for SPA scraping",
        },
        {
          id: "puppeteer-scraper",
          name: "Puppeteer",
          description: "Chrome DevTools Protocol automation",
        },
        {
          id: "selenium-scraper",
          name: "Selenium WebDriver",
          description: "Cross-browser automation framework",
        },
        {
          id: "beautifulsoup-scraper",
          name: "BeautifulSoup",
          description: "Python HTML/XML parsing library",
        },
        {
          id: "apify-scraper",
          name: "Apify Platform",
          description: "Cloud-based web scraping platform",
        },
        {
          id: "octoparse-scraper",
          name: "Octoparse",
          description: "No-code visual web scraping tool",
        },
        {
          id: "scrapingbee-scraper",
          name: "ScrapingBee API",
          description: "Web scraping API with proxy rotation",
        },
        {
          id: "brightdata-scraper",
          name: "Bright Data",
          description: "Enterprise proxy network & scraping",
        },
        {
          id: "parsehub-scraper",
          name: "ParseHub",
          description: "Visual point-and-click web scraper",
        },
        {
          id: "colly-scraper",
          name: "Colly",
          description: "Go-based web scraping framework",
        },
        {
          id: "cheerio-scraper",
          name: "Cheerio",
          description: "Fast, flexible & lean jQuery implementation",
        },
      ],
    },
    {
      id: "data-processing",
      name: "Data Processing",
      icon: <div className="w-4 h-4 rounded-full bg-cyan-500"></div>,
      nodes: [
        {
          id: "json-parser",
          name: "JSON Parser",
          description: "Parse and extract JSON data",
        },
        {
          id: "field-extractor",
          name: "Field Extractor",
          description: "Extract specific fields from data",
        },
        {
          id: "data-filter",
          name: "Data Filter",
          description: "Filter data based on conditions",
        },
        {
          id: "data-transformer",
          name: "Data Transformer",
          description: "Transform data structure and format",
        },
        {
          id: "data-validator",
          name: "Data Validator",
          description: "Validate data against schema",
        },
        {
          id: "data-aggregator",
          name: "Data Aggregator",
          description: "Aggregate and summarize data",
        },
      ],
    },
    {
      id: "database-providers",
      name: "Database Providers",
      icon: <div className="w-4 h-4 rounded-full bg-indigo-500"></div>,
      nodes: [
        {
          id: "mysql-db",
          name: "MySQL Database",
          description: "Store data in MySQL database",
        },
        {
          id: "postgresql-db",
          name: "PostgreSQL Database",
          description: "Store data in PostgreSQL database",
        },
        {
          id: "mongodb-db",
          name: "MongoDB Database",
          description: "Store data in MongoDB collection",
        },
        {
          id: "firebase-db",
          name: "Firebase Database",
          description: "Store data in Firebase Firestore",
        },
        {
          id: "supabase-db",
          name: "Supabase Database",
          description: "Store data in Supabase PostgreSQL",
        },
        {
          id: "airtable-db",
          name: "Airtable Database",
          description: "Store data in Airtable base",
        },
        {
          id: "google-sheets",
          name: "Google Sheets",
          description: "Store data in Google Sheets",
        },
      ],
    },
    {
      id: "ai-model",
      name: "AI Model API",
      icon: <div className="w-4 h-4 rounded-full bg-purple-500"></div>,
      nodes: [
        {
          id: "gpt-4",
          name: "GPT-4",
          description: "OpenAI GPT-4 language model",
        },
        {
          id: "gpt-3.5",
          name: "GPT-3.5",
          description: "OpenAI GPT-3.5 language model",
        },
        {
          id: "claude",
          name: "Claude",
          description: "Anthropic Claude language model",
        },
        {
          id: "stable-diffusion",
          name: "Stable Diffusion",
          description: "Image generation model",
        },
      ],
    },
    {
      id: "nodejs",
      name: "Node.js",
      icon: <div className="w-4 h-4 rounded-full bg-green-500"></div>,
      nodes: [
        {
          id: "js-function",
          name: "JavaScript Function",
          description: "Execute custom JavaScript code",
        },
        {
          id: "file-operations",
          name: "File Operations",
          description: "Read/write files",
        },
        {
          id: "data-transform",
          name: "Data Transform",
          description: "Transform data structure",
        },
      ],
    },
    {
      id: "api-request",
      name: "Custom API Request",
      icon: <div className="w-4 h-4 rounded-full bg-blue-500"></div>,
      nodes: [
        {
          id: "http-request",
          name: "HTTP Request",
          description: "Make HTTP requests",
        },
        { id: "graphql", name: "GraphQL", description: "Make GraphQL queries" },
        {
          id: "webhook",
          name: "Webhook",
          description: "Create webhook endpoints",
        },
      ],
    },
    {
      id: "workflow-assistant",
      name: "Workflow Builder Assistant",
      icon: <div className="w-4 h-4 rounded-full bg-yellow-500"></div>,
      nodes: [
        {
          id: "workflow-suggestion",
          name: "Workflow Suggestion",
          description: "Get AI suggestions for your workflow",
        },
        {
          id: "workflow-debug",
          name: "Workflow Debug",
          description: "Debug your workflow",
        },
        {
          id: "workflow-optimize",
          name: "Workflow Optimize",
          description: "Optimize your workflow",
        },
      ],
    },
  ];

  const handleDragStart = (node: NodeType, event: React.DragEvent) => {
    event.dataTransfer.setData("application/json", JSON.stringify(node));
    event.dataTransfer.effectAllowed = "copy";
    onNodeDragStart(node, event);
  };

  const filteredCategories = nodeCategories
    .map((category) => {
      const filteredNodes = category.nodes.filter(
        (node) =>
          node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          node.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      return { ...category, nodes: filteredNodes };
    })
    .filter((category) => category.nodes.length > 0);

  return (
    <div className="h-full w-[280px] border-r bg-background flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-2">Node Library</h2>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <Accordion
          type="multiple"
          defaultValue={nodeCategories.map((c) => c.id)}
          className="space-y-2"
        >
          {filteredCategories.map((category) => (
            <AccordionItem
              key={category.id}
              value={category.id}
              className="border rounded-md"
            >
              <AccordionTrigger className="px-4 py-2 hover:no-underline hover:bg-muted">
                <div className="flex items-center gap-2">
                  {category.icon}
                  <span>{category.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 py-1">
                <div className="space-y-1">
                  {category.nodes.map((node) => (
                    <Card
                      key={node.id}
                      draggable
                      onDragStart={(e) => handleDragStart(node, e)}
                      className="cursor-grab hover:bg-accent transition-colors"
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{node.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {node.description}
                          </div>
                        </div>
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ScrollArea>
    </div>
  );
};

export default NodeLibrary;
