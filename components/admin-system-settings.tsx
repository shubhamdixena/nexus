"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { SystemSettingsRealtimeService, type SystemSettings } from "@/lib/realtime-services"
import { Eye, EyeOff, Settings, Plus, Edit2, Trash2, Save, X } from "lucide-react"
import { useConfirmation } from "@/components/ui/confirmation-dialog"
import { useEnhancedNotifications } from "@/components/enhanced-notifications"

interface EditingState {
  [key: string]: boolean
}

interface TempValues {
  [key: string]: string
}

export function AdminSystemSettings() {
  const [settingsByCategory, setSettingsByCategory] = useState<Record<string, SystemSettings[]>>({})
  const [loading, setLoading] = useState(true)
  const [editingStates, setEditingStates] = useState<EditingState>({})
  const [tempValues, setTempValues] = useState<TempValues>({})
  const [showValues, setShowValues] = useState<Record<string, boolean>>({})
  const [newSettingOpen, setNewSettingOpen] = useState(false)
  const [newSetting, setNewSetting] = useState({
    key: '',
    value: '',
    category: 'general' as SystemSettings['category'],
    description: '',
    is_public: false
  })
  const { toast } = useToast()
  const { confirm, dialog } = useConfirmation()
  const { success, error } = useEnhancedNotifications()

  // Load settings by category
  const loadSettings = async () => {
    try {
      setLoading(true)
      const settings = await SystemSettingsRealtimeService.getSettingsByCategory()
      setSettingsByCategory(settings)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast({
        title: 'Error',
        description: 'Failed to load system settings',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()

    // Subscribe to real-time updates
    const subscription = SystemSettingsRealtimeService.subscribeToSystemSettings((settings) => {
      // Group settings by category
      const grouped: Record<string, SystemSettings[]> = {}
      settings.forEach(setting => {
        if (!grouped[setting.category]) {
          grouped[setting.category] = []
        }
        grouped[setting.category].push(setting)
      })
      setSettingsByCategory(grouped)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleEdit = (settingId: string, currentValue: string) => {
    setEditingStates(prev => ({ ...prev, [settingId]: true }))
    setTempValues(prev => ({ ...prev, [settingId]: currentValue }))
  }

  const handleSave = async (setting: SystemSettings) => {
    try {
      const newValue = tempValues[setting.id]
      await SystemSettingsRealtimeService.updateSystemSetting(setting.id, {
        value: newValue
      })
      
      setEditingStates(prev => ({ ...prev, [setting.id]: false }))
      setTempValues(prev => {
        const newTemp = { ...prev }
        delete newTemp[setting.id]
        return newTemp
      })
      
      toast({
        title: 'Success',
        description: 'Setting updated successfully'
      })
    } catch (error) {
      console.error('Error updating setting:', error)
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive'
      })
    }
  }

  const handleCancel = (settingId: string) => {
    setEditingStates(prev => ({ ...prev, [settingId]: false }))
    setTempValues(prev => {
      const newTemp = { ...prev }
      delete newTemp[settingId]
      return newTemp
    })
  }

  const handleDelete = async (setting: SystemSettings) => {
    try {
      await confirm({
        title: "Delete Setting",
        description: `Are you sure you want to delete the setting "${setting.key}"? This action cannot be undone.`,
        confirmText: "Delete",
        cancelText: "Cancel",
        variant: "destructive",
        icon: Trash2,
        onConfirm: async () => {
          await SystemSettingsRealtimeService.deleteSystemSetting(setting.id)
          success('Setting deleted', `"${setting.key}" has been successfully removed.`)
        }
      })
    } catch (err) {
      // User cancelled
      console.log('Delete cancelled by user')
    }
  }

  const handleCreateSetting = async () => {
    try {
      if (!newSetting.key || !newSetting.value) {
        error('Validation Error', 'Key and value are required')
        return
      }

      await SystemSettingsRealtimeService.createSystemSetting(newSetting)
      
      setNewSettingOpen(false)
      setNewSetting({
        key: '',
        value: '',
        category: 'general',
        description: '',
        is_public: false
      })
      
      success('Setting created', `"${newSetting.key}" has been successfully added.`)
    } catch (error) {
      console.error('Error creating setting:', error)
      error('Failed to create setting', 'There was a problem creating the setting. Please try again.')
    }
  }

  const toggleValueVisibility = (settingId: string) => {
    setShowValues(prev => ({ ...prev, [settingId]: !prev[settingId] }))
  }

  const maskSensitiveValue = (value: string, category: string) => {
    if (category === 'api' || category === 'security') {
      return '••••••••••••'
    }
    return value
  }

  const categories = [
    { id: 'general', name: 'General Settings', icon: Settings },
    { id: 'api', name: 'API Keys', icon: Settings },
    { id: 'email', name: 'Email Configuration', icon: Settings },
    { id: 'security', name: 'Security Settings', icon: Settings },
    { id: 'features', name: 'Feature Flags', icon: Settings }
  ]

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="h-64 bg-gray-200 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Settings</h2>
          <p className="text-gray-600">Manage application configuration and settings</p>
        </div>
        <Dialog open={newSettingOpen} onOpenChange={setNewSettingOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Setting
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Setting</DialogTitle>
              <DialogDescription>
                Add a new system configuration setting.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="key">Setting Key</Label>
                <Input
                  id="key"
                  value={newSetting.key}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="e.g., stripe_api_key"
                />
              </div>
              <div>
                <Label htmlFor="value">Value</Label>
                <Textarea
                  id="value"
                  value={newSetting.value}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, value: e.target.value }))}
                  placeholder="Setting value"
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={newSetting.category}
                  onValueChange={(value) => setNewSetting(prev => ({ ...prev, category: value as SystemSettings['category'] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="api">API Keys</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="features">Features</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newSetting.description}
                  onChange={(e) => setNewSetting(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this setting"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_public"
                  checked={newSetting.is_public}
                  onCheckedChange={(checked) => setNewSetting(prev => ({ ...prev, is_public: checked }))}
                />
                <Label htmlFor="is_public">Public Setting</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setNewSettingOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSetting}>
                Create Setting
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full">
          {categories.map(category => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(category => (
          <TabsContent key={category.id} value={category.id}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <category.icon className="w-5 h-5" />
                  {category.name}
                </CardTitle>
                <CardDescription>
                  Manage {category.name.toLowerCase()} for your application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingsByCategory[category.id]?.length > 0 ? (
                  settingsByCategory[category.id].map(setting => (
                    <div key={setting.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{setting.key}</h3>
                            <Badge variant={setting.is_public ? "default" : "secondary"}>
                              {setting.is_public ? "Public" : "Private"}
                            </Badge>
                          </div>
                          {setting.description && (
                            <p className="text-sm text-gray-600">{setting.description}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {category.id === "api" || category.id === "security" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleValueVisibility(setting.id)}
                            >
                              {showValues[setting.id] ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                            </Button>
                          ) : null}
                          {editingStates[setting.id] ? (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSave(setting)}
                              >
                                <Save className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(setting.id)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(setting.id, setting.value)}
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(setting)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Value</Label>
                        {editingStates[setting.id] ? (
                          <Textarea
                            value={tempValues[setting.id] || ""}
                            onChange={(e) => setTempValues(prev => ({ 
                              ...prev, 
                              [setting.id]: e.target.value 
                            }))}
                            className="mt-1"
                            rows={3}
                          />
                        ) : (
                          <div className="mt-1 p-2 bg-gray-50 rounded border min-h-[60px]">
                            <code className="text-sm">
                              {showValues[setting.id] || !(category.id === "api" || category.id === "security")
                                ? setting.value
                                : maskSensitiveValue(setting.value, category.id)
                              }
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No settings found for this category
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
      {dialog}
    </div>
  )
}
