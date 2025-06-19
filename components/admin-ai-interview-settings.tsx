"use client"

import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Key, 
  CreditCard, 
  Database, 
  Shield,
  Bell,
  Globe,
  Save,
  TestTube,
  Volume2,
  Mic,
  Brain,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

const AdminAIInterviewSettings = () => {
  const [sttProvider, setSttProvider] = useState('openai');
  const [ttsProvider, setTtsProvider] = useState('elevenlabs');
  const [llmProvider, setLlmProvider] = useState('openai');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [apiKeys, setApiKeys] = useState({
    openai: '',
    elevenlabs: '',
    google: '',
    azure: '',
    aws: ''
  });

  const [connectionStatus, setConnectionStatus] = useState({
    stt: 'connected',
    tts: 'connected', 
    llm: 'connected'
  });

  const handleApiKeyChange = (provider: string, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
  };

  const testConnection = async (service: 'stt' | 'tts' | 'llm') => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setConnectionStatus(prev => ({ ...prev, [service]: 'connected' }));
      toast({
        title: "Connection Successful",
        description: `${service.toUpperCase()} service is working properly.`,
      });
    } catch (error) {
      setConnectionStatus(prev => ({ ...prev, [service]: 'error' }));
      toast({
        title: "Connection Failed",
        description: `Failed to connect to ${service.toUpperCase()} service.`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfiguration = async () => {
    setIsLoading(true);
    try {
      // Simulate saving configuration
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Settings Saved",
        description: "AI provider configuration has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save configuration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig = {
      connected: { icon: CheckCircle, variant: "default" as const, text: "Connected" },
      error: { icon: XCircle, variant: "destructive" as const, text: "Error" },
      pending: { icon: AlertTriangle, variant: "secondary" as const, text: "Pending" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">AI Interview Settings</h1>
          <p className="text-muted-foreground mt-2">Configure AI providers, speech services, and interview parameters</p>
        </div>

        <Tabs defaultValue="ai-providers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ai-providers">AI Providers</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          {/* AI Providers Tab */}
          <TabsContent value="ai-providers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Speech-to-Text (STT) Configuration
                </CardTitle>
                <CardDescription>
                  Configure speech recognition service for interview transcription
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stt-provider">STT Provider</Label>
                    <Select value={sttProvider} onValueChange={setSttProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI Whisper</SelectItem>
                        <SelectItem value="google">Google Speech-to-Text</SelectItem>
                        <SelectItem value="azure">Azure Speech Services</SelectItem>
                        <SelectItem value="aws">AWS Transcribe</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stt-status">Status</Label>
                    <StatusBadge status={connectionStatus.stt} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stt-api-key">API Key</Label>
                  <Input 
                    id="stt-api-key"
                    type="password" 
                    placeholder="Enter STT API key..."
                    value={apiKeys[sttProvider as keyof typeof apiKeys]}
                    onChange={(e) => handleApiKeyChange(sttProvider, e.target.value)}
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => testConnection('stt')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Testing...' : 'Test Connection'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Text-to-Speech (TTS) Configuration
                </CardTitle>
                <CardDescription>
                  Configure voice synthesis for AI interviewer responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tts-provider">TTS Provider</Label>
                    <Select value={ttsProvider} onValueChange={setTtsProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                        <SelectItem value="openai">OpenAI TTS</SelectItem>
                        <SelectItem value="google">Google Text-to-Speech</SelectItem>
                        <SelectItem value="azure">Azure Speech Services</SelectItem>
                        <SelectItem value="aws">AWS Polly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tts-status">Status</Label>
                    <StatusBadge status={connectionStatus.tts} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tts-api-key">API Key</Label>
                  <Input 
                    id="tts-api-key"
                    type="password" 
                    placeholder="Enter TTS API key..."
                    value={apiKeys[ttsProvider as keyof typeof apiKeys]}
                    onChange={(e) => handleApiKeyChange(ttsProvider, e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="voice-model">Voice Model</Label>
                  <Select defaultValue="rachel">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rachel">Rachel (Professional)</SelectItem>
                      <SelectItem value="adam">Adam (Corporate)</SelectItem>
                      <SelectItem value="sarah">Sarah (Friendly)</SelectItem>
                      <SelectItem value="james">James (Authoritative)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => testConnection('tts')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Testing...' : 'Test Voice'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  Large Language Model (LLM) Configuration
                </CardTitle>
                <CardDescription>
                  Configure AI model for generating interview questions and responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="llm-provider">LLM Provider</Label>
                    <Select value={llmProvider} onValueChange={setLlmProvider}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI GPT-4</SelectItem>
                        <SelectItem value="anthropic">Anthropic Claude</SelectItem>
                        <SelectItem value="google">Google Gemini</SelectItem>
                        <SelectItem value="azure">Azure OpenAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="llm-status">Status</Label>
                    <StatusBadge status={connectionStatus.llm} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="llm-api-key">API Key</Label>
                  <Input 
                    id="llm-api-key"
                    type="password" 
                    placeholder="Enter LLM API key..."
                    value={apiKeys[llmProvider as keyof typeof apiKeys]}
                    onChange={(e) => handleApiKeyChange(llmProvider, e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="model-version">Model Version</Label>
                    <Select defaultValue="gpt-4-turbo">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="gpt-4">GPT-4</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="temperature">Temperature</Label>
                    <Input 
                      id="temperature"
                      type="number" 
                      placeholder="0.7"
                      min="0"
                      max="2"
                      step="0.1"
                      defaultValue="0.7"
                    />
                  </div>
                </div>
                <Button 
                  variant="outline"
                  onClick={() => testConnection('llm')}
                  disabled={isLoading}
                >
                  {isLoading ? 'Testing...' : 'Test Model'}
                </Button>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveConfiguration} disabled={isLoading}>
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save AI Configuration'}
              </Button>
            </div>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Gateway Configuration
                </CardTitle>
                <CardDescription>
                  Configure payment processing and subscription management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payment-provider">Payment Provider</Label>
                  <Select defaultValue="stripe">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="square">Square</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="publishable-key">Publishable Key</Label>
                    <Input 
                      id="publishable-key"
                      type="password" 
                      placeholder="pk_..."
                      defaultValue="pk_test_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="secret-key">Secret Key</Label>
                    <Input 
                      id="secret-key"
                      type="password" 
                      placeholder="sk_..."
                      defaultValue="sk_test_..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-endpoint">Webhook Endpoint</Label>
                  <Input 
                    id="webhook-endpoint"
                    placeholder="https://yourdomain.com/webhooks/stripe"
                    defaultValue="https://api.aiinterview.com/webhooks/stripe"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="test-mode" defaultChecked />
                  <Label htmlFor="test-mode">Test Mode</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Subscription Plans</CardTitle>
                <CardDescription>
                  Manage pricing tiers and plan features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { name: 'Basic', price: '$29', features: ['5 Interviews', 'Basic Feedback', 'Email Support'] },
                    { name: 'Premium', price: '$99', features: ['25 Interviews', 'Advanced AI Feedback', 'Priority Support'] },
                    { name: 'Enterprise', price: '$299', features: ['Unlimited Interviews', 'Custom AI Training', 'Dedicated Support'] }
                  ].map((plan, index) => (
                    <Card key={index} className="border-2">
                      <CardHeader>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="text-2xl font-bold">{plan.price}<span className="text-sm font-normal">/month</span></div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="text-sm text-muted-foreground">• {feature}</li>
                          ))}
                        </ul>
                        <Button variant="outline" className="w-full mt-4">
                          Edit Plan
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure authentication and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="two-factor">Two-Factor Authentication</Label>
                      <p className="text-sm text-muted-foreground">Require 2FA for admin accounts</p>
                    </div>
                    <Switch id="two-factor" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="session-timeout">Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                    </div>
                    <Select defaultValue="24">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="168">1 week</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-encryption">Data Encryption</Label>
                      <p className="text-sm text-muted-foreground">Encrypt sensitive user data</p>
                    </div>
                    <Switch id="data-encryption" defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Configure system notifications and alerts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send system alerts via email</p>
                    </div>
                    <Switch id="email-notifications" defaultChecked />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-alerts">SMS Alerts</Label>
                      <p className="text-sm text-muted-foreground">Critical system alerts via SMS</p>
                    </div>
                    <Switch id="sms-alerts" />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="slack-integration">Slack Integration</Label>
                      <p className="text-sm text-muted-foreground">Send notifications to Slack</p>
                    </div>
                    <Switch id="slack-integration" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Basic system configuration and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input 
                      id="company-name"
                      defaultValue="AI Interview Platform"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input 
                      id="support-email"
                      type="email"
                      defaultValue="support@aiinterview.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Default Timezone</Label>
                  <Select defaultValue="utc">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC</SelectItem>
                      <SelectItem value="est">Eastern Time</SelectItem>
                      <SelectItem value="pst">Pacific Time</SelectItem>
                      <SelectItem value="gmt">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-interviews">Max Interviews per User</Label>
                  <Input 
                    id="max-interviews"
                    type="number"
                    defaultValue="50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interview-duration">Default Interview Duration (minutes)</Label>
                  <Input 
                    id="interview-duration"
                    type="number"
                    defaultValue="45"
                    min="15"
                    max="120"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminAIInterviewSettings; 