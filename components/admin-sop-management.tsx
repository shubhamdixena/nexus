"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Eye, Edit, Trash2, Plus, Search, Filter, Download, Upload, ChevronLeft, ChevronRight, FileText, User, Calendar, MapPin } from "lucide-react"
import { SOPRealtimeService } from "@/lib/realtime-services"

interface SOP {
  id: string
  title: string
  university: string
  program: string
  author: string
  field: string
  country: string
  content: string
  word_count: number
  version: number
  status: "active" | "inactive" | "archived"
  sop_status: "draft" | "final" | "submitted"
  created_at: string
  updated_at: string
  user_id?: string
  university_id?: string
  universities?: { name: string; location: string }
  users?: { name: string; email: string }
}

interface FilterState {
  university: string
  program: string
  field: string
  country: string
  status: string
  sop_status: string
}

export function AdminSopManagement() {
  const [sops, setSOPs] = useState<SOP[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSOPs, setSelectedSOPs] = useState<string[]>([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingSOP, setEditingSOP] = useState<SOP | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const { toast } = useToast()

  const [filters, setFilters] = useState<FilterState>({
    university: "",
    program: "",
    field: "",
    country: "",
    status: "",
    sop_status: "",
  })

  const [newSOP, setNewSOP] = useState({
    title: "",
    university: "",
    program: "",
    author: "",
    field: "",
    country: "",
    content: "",
    status: "active" as const,
    sop_status: "draft" as const,
  })

  // Load SOPs
  const loadSOPs = async (page = 1) => {
    try {
      setLoading(true)
      const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, value]) => value !== ""))
      
      const response = await SOPRealtimeService.getSOPs({
        page,
        limit: 10,
        search: searchTerm,
        filters: activeFilters,
        sortBy: "created_at",
        sortOrder: "desc",
      })

      setSOPs(response.data)
      setTotalPages(response.pagination.totalPages)
      setTotalCount(response.pagination.total)
      setCurrentPage(page)
    } catch (error) {
      console.error("Error loading SOPs:", error)
      toast({
        title: "Error",
        description: "Failed to load SOPs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = SOPRealtimeService.subscribeToSOPs((updatedSOPs) => {
      loadSOPs(currentPage)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [currentPage])

  useEffect(() => {
    loadSOPs()
  }, [searchTerm, filters])

  const handleCreateSOP = async () => {
    try {
      await SOPRealtimeService.createSOP(newSOP)
      setShowCreateDialog(false)
      setNewSOP({
        title: "",
        university: "",
        program: "",
        author: "",
        field: "",
        country: "",
        content: "",
        status: "active",
        sop_status: "draft",
      })
      toast({
        title: "Success",
        description: "SOP created successfully",
      })
    } catch (error) {
      console.error("Error creating SOP:", error)
      toast({
        title: "Error",
        description: "Failed to create SOP. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditSOP = async () => {
    if (!editingSOP) return
    
    try {
      await SOPRealtimeService.updateSOP(editingSOP.id, editingSOP)
      setShowEditDialog(false)
      setEditingSOP(null)
      toast({
        title: "Success",
        description: "SOP updated successfully",
      })
    } catch (error) {
      console.error("Error updating SOP:", error)
      toast({
        title: "Error",
        description: "Failed to update SOP. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSOP = async (id: string) => {
    if (!confirm("Are you sure you want to delete this SOP?")) return
    
    try {
      await SOPRealtimeService.deleteSOP(id)
      toast({
        title: "Success",
        description: "SOP deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting SOP:", error)
      toast({
        title: "Error",
        description: "Failed to delete SOP. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedSOPs.length === 0) return
    
    try {
      await SOPRealtimeService.bulkUpdateSOPStatus(selectedSOPs, status)
      setSelectedSOPs([])
      toast({
        title: "Success",
        description: `Updated ${selectedSOPs.length} SOPs successfully`,
      })
    } catch (error) {
      console.error("Error updating SOPs:", error)
      toast({
        title: "Error",
        description: "Failed to update SOPs. Please try again.",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "default",
      inactive: "secondary",
      archived: "outline",
    } as const
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  const getSOPStatusBadge = (status: string) => {
    const variants = {
      draft: "secondary",
      final: "default",
      submitted: "outline",
    } as const
    return <Badge variant={variants[status as keyof typeof variants] || "secondary"}>{status}</Badge>
  }

  const resetFilters = () => {
    setFilters({
      university: "",
      program: "",
      field: "",
      country: "",
      status: "",
      sop_status: "",
    })
  }

  const filteredSOPs = sops.filter((sop) =>
    sop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sop.university.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sop.program.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sop.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sop.field.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sop.country.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    total: totalCount,
    active: sops.filter((s) => s.status === "active").length,
    draft: sops.filter((s) => s.sop_status === "draft").length,
    final: sops.filter((s) => s.sop_status === "final").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">SOP Management</h2>
          <p className="text-muted-foreground">Manage statements of purpose and application essays</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add SOP
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SOPs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Badge variant="default" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
            <Badge variant="secondary" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final</CardTitle>
            <Badge variant="outline" className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.final}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search SOPs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              {selectedSOPs.length > 0 && (
                <Select onValueChange={handleBulkStatusUpdate}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Bulk Actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Set Active</SelectItem>
                    <SelectItem value="inactive">Set Inactive</SelectItem>
                    <SelectItem value="archived">Archive</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Filters</CardTitle>
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="filter-university">University</Label>
                    <Input
                      id="filter-university"
                      value={filters.university}
                      onChange={(e) => setFilters((prev) => ({ ...prev, university: e.target.value }))}
                      placeholder="Filter by university"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-program">Program</Label>
                    <Input
                      id="filter-program"
                      value={filters.program}
                      onChange={(e) => setFilters((prev) => ({ ...prev, program: e.target.value }))}
                      placeholder="Filter by program"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-field">Field</Label>
                    <Input
                      id="filter-field"
                      value={filters.field}
                      onChange={(e) => setFilters((prev) => ({ ...prev, field: e.target.value }))}
                      placeholder="Filter by field"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-country">Country</Label>
                    <Input
                      id="filter-country"
                      value={filters.country}
                      onChange={(e) => setFilters((prev) => ({ ...prev, country: e.target.value }))}
                      placeholder="Filter by country"
                    />
                  </div>
                  <div>
                    <Label htmlFor="filter-status">Status</Label>
                    <Select value={filters.status || "all"} onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === "all" ? "" : value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="filter-sop-status">SOP Status</Label>
                    <Select value={filters.sop_status} onValueChange={(value) => setFilters((prev) => ({ ...prev, sop_status: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="All SOP statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                        <SelectItem value="submitted">Submitted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* SOPs Table */}
          <Card>
            <CardHeader>
              <CardTitle>SOPs ({totalCount})</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">Loading...</div>
              ) : filteredSOPs.length === 0 ? (
                <div className="text-center py-4">No SOPs found</div>
              ) : (
                <div className="space-y-4">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 font-medium text-sm border-b pb-2">
                    <div className="col-span-1">
                      <Checkbox
                        checked={selectedSOPs.length === filteredSOPs.length}
                        onCheckedChange={(checked) => {
                          setSelectedSOPs(checked ? filteredSOPs.map((s) => s.id) : [])
                        }}
                      />
                    </div>
                    <div className="col-span-3">Title</div>
                    <div className="col-span-2">University</div>
                    <div className="col-span-2">Program</div>
                    <div className="col-span-1">Status</div>
                    <div className="col-span-1">SOP Status</div>
                    <div className="col-span-1">Words</div>
                    <div className="col-span-1">Actions</div>
                  </div>

                  {/* Table Rows */}
                  {filteredSOPs.map((sop) => (
                    <div key={sop.id} className="grid grid-cols-12 gap-4 items-center py-2 border-b">
                      <div className="col-span-1">
                        <Checkbox
                          checked={selectedSOPs.includes(sop.id)}
                          onCheckedChange={(checked) => {
                            setSelectedSOPs((prev) => 
                              checked 
                                ? [...prev, sop.id]
                                : prev.filter((id) => id !== sop.id)
                            )
                          }}
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="font-medium">{sop.title}</div>
                        <div className="text-sm text-muted-foreground">{sop.author}</div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {sop.university}
                        </div>
                        <div className="text-sm text-muted-foreground">{sop.country}</div>
                      </div>
                      <div className="col-span-2">
                        <div>{sop.program}</div>
                        <div className="text-sm text-muted-foreground">{sop.field}</div>
                      </div>
                      <div className="col-span-1">
                        {getStatusBadge(sop.status)}
                      </div>
                      <div className="col-span-1">
                        {getSOPStatusBadge(sop.sop_status)}
                      </div>
                      <div className="col-span-1">
                        <div className="text-sm">{sop.word_count}</div>
                        <div className="text-xs text-muted-foreground">v{sop.version}</div>
                      </div>
                      <div className="col-span-1">
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingSOP(sop)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSOP(sop.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalCount)} of {totalCount} results
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadSOPs(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadSOPs(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>SOP Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create SOP Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New SOP</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newSOP.title}
                  onChange={(e) => setNewSOP((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="SOP Title"
                />
              </div>
              <div>
                <Label htmlFor="author">Author</Label>
                <Input
                  id="author"
                  value={newSOP.author}
                  onChange={(e) => setNewSOP((prev) => ({ ...prev, author: e.target.value }))}
                  placeholder="Author Name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="university">University</Label>
                <Input
                  id="university"
                  value={newSOP.university}
                  onChange={(e) => setNewSOP((prev) => ({ ...prev, university: e.target.value }))}
                  placeholder="University Name"
                />
              </div>
              <div>
                <Label htmlFor="program">Program</Label>
                <Input
                  id="program"
                  value={newSOP.program}
                  onChange={(e) => setNewSOP((prev) => ({ ...prev, program: e.target.value }))}
                  placeholder="Program Name"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="field">Field</Label>
                <Input
                  id="field"
                  value={newSOP.field}
                  onChange={(e) => setNewSOP((prev) => ({ ...prev, field: e.target.value }))}
                  placeholder="Field of Study"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={newSOP.country}
                  onChange={(e) => setNewSOP((prev) => ({ ...prev, country: e.target.value }))}
                  placeholder="Country"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={newSOP.status} onValueChange={(value: any) => setNewSOP((prev) => ({ ...prev, status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="sop_status">SOP Status</Label>
                <Select value={newSOP.sop_status} onValueChange={(value: any) => setNewSOP((prev) => ({ ...prev, sop_status: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={newSOP.content}
                onChange={(e) => setNewSOP((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="SOP Content..."
                className="min-h-[200px]"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSOP}>Create SOP</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit SOP Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit SOP</DialogTitle>
          </DialogHeader>
          {editingSOP && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={editingSOP.title}
                    onChange={(e) => setEditingSOP((prev) => prev ? ({ ...prev, title: e.target.value }) : null)}
                    placeholder="SOP Title"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-author">Author</Label>
                  <Input
                    id="edit-author"
                    value={editingSOP.author}
                    onChange={(e) => setEditingSOP((prev) => prev ? ({ ...prev, author: e.target.value }) : null)}
                    placeholder="Author Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-university">University</Label>
                  <Input
                    id="edit-university"
                    value={editingSOP.university}
                    onChange={(e) => setEditingSOP((prev) => prev ? ({ ...prev, university: e.target.value }) : null)}
                    placeholder="University Name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-program">Program</Label>
                  <Input
                    id="edit-program"
                    value={editingSOP.program}
                    onChange={(e) => setEditingSOP((prev) => prev ? ({ ...prev, program: e.target.value }) : null)}
                    placeholder="Program Name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-field">Field</Label>
                  <Input
                    id="edit-field"
                    value={editingSOP.field}
                    onChange={(e) => setEditingSOP((prev) => prev ? ({ ...prev, field: e.target.value }) : null)}
                    placeholder="Field of Study"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-country">Country</Label>
                  <Input
                    id="edit-country"
                    value={editingSOP.country}
                    onChange={(e) => setEditingSOP((prev) => prev ? ({ ...prev, country: e.target.value }) : null)}
                    placeholder="Country"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editingSOP.status} onValueChange={(value: any) => setEditingSOP((prev) => prev ? ({ ...prev, status: value }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-sop-status">SOP Status</Label>
                  <Select value={editingSOP.sop_status} onValueChange={(value: any) => setEditingSOP((prev) => prev ? ({ ...prev, sop_status: value }) : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="edit-content">Content</Label>
                <Textarea
                  id="edit-content"
                  value={editingSOP.content}
                  onChange={(e) => setEditingSOP((prev) => prev ? ({ ...prev, content: e.target.value }) : null)}
                  placeholder="SOP Content..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSOP}>Update SOP</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
