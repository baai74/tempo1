import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Shield,
  AlertTriangle,
  CheckCircle,
  Copy,
} from "lucide-react";

interface Secret {
  id: string;
  name: string;
  type:
    | "api_key"
    | "password"
    | "token"
    | "connection_string"
    | "certificate"
    | "other";
  value: string;
  description?: string;
  category: string;
  createdAt: Date;
  lastUsed?: Date;
  expiresAt?: Date;
}

interface SecretsManagerProps {
  onSecretSelect?: (secret: Secret) => void;
  selectedSecrets?: string[];
  requiredSecrets?: { name: string; type: string; description: string }[];
}

const SecretsManager = ({
  onSecretSelect = () => {},
  selectedSecrets = [],
  requiredSecrets = [],
}: SecretsManagerProps) => {
  const [secrets, setSecrets] = useState<Secret[]>([
    {
      id: "secret-1",
      name: "RapidAPI Key",
      type: "api_key",
      value: "••••••••••••••••",
      description: "API key for RapidAPI scraping services",
      category: "Scraping APIs",
      createdAt: new Date("2024-01-15"),
      lastUsed: new Date("2024-01-20"),
    },
    {
      id: "secret-2",
      name: "PostgreSQL Connection",
      type: "connection_string",
      value: "••••••••••••••••",
      description: "Database connection string for PostgreSQL",
      category: "Databases",
      createdAt: new Date("2024-01-10"),
    },
    {
      id: "secret-3",
      name: "ScrapingBee API Key",
      type: "api_key",
      value: "••••••••••••••••",
      description: "API key for ScrapingBee proxy rotation service",
      category: "Scraping APIs",
      createdAt: new Date("2024-02-05"),
      lastUsed: new Date("2024-02-10"),
    },
    {
      id: "secret-4",
      name: "Apify Token",
      type: "token",
      value: "••••••••••••••••",
      description: "Access token for Apify platform",
      category: "Scraping APIs",
      createdAt: new Date("2024-02-15"),
    },
    {
      id: "secret-5",
      name: "Bright Data Credentials",
      type: "password",
      value: "••••••••••••••••",
      description: "Login credentials for Bright Data proxy network",
      category: "Proxy Networks",
      createdAt: new Date("2024-03-01"),
    },
  ]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSecret, setEditingSecret] = useState<Secret | null>(null);
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [newSecret, setNewSecret] = useState<Partial<Secret>>({
    name: "",
    type: "api_key",
    value: "",
    description: "",
    category: "General",
  });

  const secretTypes = [
    { value: "api_key", label: "API Key", icon: "🔑" },
    { value: "password", label: "Password", icon: "🔒" },
    { value: "token", label: "Token", icon: "🎫" },
    { value: "connection_string", label: "Connection String", icon: "🔗" },
    { value: "certificate", label: "Certificate", icon: "📜" },
    { value: "other", label: "Other", icon: "📝" },
  ];

  const categories = [
    "General",
    "Scraping APIs",
    "Databases",
    "Cloud Services",
    "Authentication",
    "Webhooks",
    "Proxy Networks",
    "Browser Automation",
    "Visual Tools",
  ];

  const handleAddSecret = () => {
    if (!newSecret.name || !newSecret.value) return;

    const secret: Secret = {
      id: `secret-${Date.now()}`,
      name: newSecret.name,
      type: newSecret.type as Secret["type"],
      value: newSecret.value,
      description: newSecret.description,
      category: newSecret.category || "General",
      createdAt: new Date(),
    };

    setSecrets([...secrets, secret]);
    setNewSecret({
      name: "",
      type: "api_key",
      value: "",
      description: "",
      category: "General",
    });
    setIsAddDialogOpen(false);
  };

  const handleEditSecret = () => {
    if (!editingSecret) return;

    setSecrets(
      secrets.map((s) => (s.id === editingSecret.id ? editingSecret : s)),
    );
    setEditingSecret(null);
    setIsEditDialogOpen(false);
  };

  const handleDeleteSecret = (id: string) => {
    setSecrets(secrets.filter((s) => s.id !== id));
  };

  const toggleShowValue = (id: string) => {
    setShowValues((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value);
  };

  const getTypeIcon = (type: string) => {
    const typeInfo = secretTypes.find((t) => t.value === type);
    return typeInfo?.icon || "📝";
  };

  const getStatusColor = (secret: Secret) => {
    if (secret.expiresAt && secret.expiresAt < new Date()) {
      return "bg-red-100 text-red-800";
    }
    if (
      secret.lastUsed &&
      secret.lastUsed > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ) {
      return "bg-green-100 text-green-800";
    }
    return "bg-gray-100 text-gray-800";
  };

  const getMissingSecrets = () => {
    return requiredSecrets.filter(
      (required) =>
        !secrets.some(
          (secret) =>
            secret.name.toLowerCase().includes(required.name.toLowerCase()) ||
            secret.type === required.type,
        ),
    );
  };

  const missingSecrets = getMissingSecrets();

  return (
    <div className="h-full bg-background">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Secrets Manager</h3>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Secret
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Secret</DialogTitle>
                <DialogDescription>
                  Store sensitive data securely for use in your workflows
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="secret-name">Name</Label>
                  <Input
                    id="secret-name"
                    value={newSecret.name}
                    onChange={(e) =>
                      setNewSecret({ ...newSecret, name: e.target.value })
                    }
                    placeholder="e.g., RapidAPI Key"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-type">Type</Label>
                  <Select
                    value={newSecret.type}
                    onValueChange={(value) =>
                      setNewSecret({
                        ...newSecret,
                        type: value as Secret["type"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {secretTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.icon} {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-category">Category</Label>
                  <Select
                    value={newSecret.category}
                    onValueChange={(value) =>
                      setNewSecret({ ...newSecret, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-value">Value</Label>
                  <Textarea
                    id="secret-value"
                    value={newSecret.value}
                    onChange={(e) =>
                      setNewSecret({ ...newSecret, value: e.target.value })
                    }
                    placeholder="Enter the secret value"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secret-description">
                    Description (Optional)
                  </Label>
                  <Input
                    id="secret-description"
                    value={newSecret.description}
                    onChange={(e) =>
                      setNewSecret({
                        ...newSecret,
                        description: e.target.value,
                      })
                    }
                    placeholder="Brief description of this secret"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddSecret}>Add Secret</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage API keys, passwords, and other sensitive data
        </p>
      </div>

      {/* Missing Secrets Alert */}
      {missingSecrets.length > 0 && (
        <div className="p-4 border-b bg-yellow-50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Missing Required Secrets
              </h4>
              <p className="text-sm text-yellow-700 mb-2">
                Your workflow requires the following secrets:
              </p>
              <div className="space-y-1">
                {missingSecrets.map((secret, index) => (
                  <div key={index} className="text-sm text-yellow-700">
                    • <strong>{secret.name}</strong> ({secret.type}) -{" "}
                    {secret.description}
                  </div>
                ))}
              </div>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => setIsAddDialogOpen(true)}
              >
                Add Missing Secrets
              </Button>
            </div>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {secrets.map((secret) => (
            <Card key={secret.id} className="relative">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(secret.type)}</span>
                    <div>
                      <h4 className="font-medium">{secret.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {secret.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs">
                      {secret.category}
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor(secret)}`}>
                      {secret.lastUsed ? "Active" : "Unused"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 font-mono text-sm bg-muted p-2 rounded">
                    {showValues[secret.id] ? secret.value : "••••••••••••••••"}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleShowValue(secret.id)}
                  >
                    {showValues[secret.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(secret.value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Created: {secret.createdAt.toLocaleDateString()}</span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingSecret(secret);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteSecret(secret.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Secret</DialogTitle>
            <DialogDescription>Update the secret information</DialogDescription>
          </DialogHeader>
          {editingSecret && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-secret-name">Name</Label>
                <Input
                  id="edit-secret-name"
                  value={editingSecret.name}
                  onChange={(e) =>
                    setEditingSecret({ ...editingSecret, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-secret-value">Value</Label>
                <Textarea
                  id="edit-secret-value"
                  value={editingSecret.value}
                  onChange={(e) =>
                    setEditingSecret({
                      ...editingSecret,
                      value: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-secret-description">Description</Label>
                <Input
                  id="edit-secret-description"
                  value={editingSecret.description || ""}
                  onChange={(e) =>
                    setEditingSecret({
                      ...editingSecret,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEditSecret}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecretsManager;
