"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { format } from "date-fns"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Search,
  MoreHorizontal,
  CalendarIcon,
  Users,
  UserPlus,
  Mail,
  Send,
  Download,
  Eye,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  MessageSquare,
} from "lucide-react"
import {
  AdvancedUserRealtimeService,
  UserRealtimeService,
  UserActivityLog,
  UserSegment,
  Message,
  User
} from '@/lib/realtime-services'

export const AdminAdvancedUserManagement = React.memo(() => {
  // State with proper types
  const [userActivityLogs, setUserActivityLogs] = useState<UserActivityLog[]>([])
  const [userSegments, setUserSegments] = useState<UserSegment[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false)
  const [isComposeMessageOpen, setIsComposeMessageOpen] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [messageTitle, setMessageTitle] = useState("")
  const [messageContent, setMessageContent] = useState("")
  const [selectedUser, setSelectedUser] = useState<string | null>(null)

  // Load all data on component mount
  useEffect(() => {
    const loadAllData = async () => {
      try {
        // Load activity logs from API
        const activityLogsResponse = await AdvancedUserRealtimeService.getUserActivityLogs()
        setUserActivityLogs(activityLogsResponse || [])
        
        // Load user segments from API
        const segmentsResponse = await AdvancedUserRealtimeService.getUserSegments()
        setUserSegments(segmentsResponse || [])
        
        // Load messages from API
        const messagesResponse = await AdvancedUserRealtimeService.getMessages()
        setMessages(messagesResponse || [])
        
        // Load users from API
        const usersResponse = await UserRealtimeService.getUsers()
        setUsers(usersResponse || [])
      } catch (error) {
        console.error('Error loading advanced user management data:', error)
        // Set empty arrays as fallback
        setUserActivityLogs([])
        setUserSegments([])
        setMessages([])
        setUsers([])
      }
    }

    loadAllData()
  }, [])

  // Format date for display
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // Filter activity logs based on search query and selected date
  const filteredActivityLogs = userActivityLogs.filter((log) => {
    const matchesSearch =
      log.user_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesDate = selectedDate ? new Date(log.timestamp).toDateString() === selectedDate.toDateString() : true

    return matchesSearch && matchesDate
  })

  // Filter user segments based on search query
  const filteredUserSegments = userSegments.filter((segment) =>
    segment.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Filter messages based on search query
  const filteredMessages = messages.filter((message) => message.subject?.toLowerCase().includes(searchQuery.toLowerCase()))

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle creating a new segment
  const handleCreateSegment = () => {
    // TODO: Replace with API call to create segment
    setIsCreateSegmentOpen(false)
    // Add success notification
  }

  // Handle sending a message
  const handleSendMessage = () => {
    // TODO: Replace with API call to send message
    const recipientType = selectedUser ? "user" : "segment"
    const recipientName = selectedUser
      ? users.find((user) => user.id === selectedUser)?.name
      : selectedSegment || "All Users"

    const recipientCount = selectedUser
      ? 1
      : selectedSegment
        ? userSegments.find((segment) => segment.name === selectedSegment)?.user_count || 0
        : 0

    const newMessage: Message = {
      id: `${messages.length + 1}`,
      user_id: selectedUser || "system",
      subject: messageTitle,
      message: messageContent,
      status: "sent",
      sent_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setMessages([newMessage, ...messages])
    setIsComposeMessageOpen(false)
    setMessageTitle("")
    setMessageContent("")
    setSelectedSegment(null)
    setSelectedUser(null)
    // Add success notification
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Advanced User Management</CardTitle>
          <CardDescription>Track user activity, create segments, and send targeted communications</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="activity" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="activity">User Activity Logs</TabsTrigger>
              <TabsTrigger value="segments">User Segments</TabsTrigger>
              <TabsTrigger value="messaging">Messaging System</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
            </TabsList>

            {/* Activity Logs Tab */}
            <TabsContent value="activity" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search activity logs..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Filter by date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                  {selectedDate && (
                    <Button variant="ghost" size="sm" onClick={() => setSelectedDate(undefined)}>
                      Clear
                    </Button>
                  )}
                </div>
                <Button variant="outline" className="ml-auto w-full sm:w-auto">
                  <Download className="mr-2 h-4 w-4" />
                  Export Logs
                </Button>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead className="hidden md:table-cell">Details</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead className="hidden lg:table-cell">IP Address</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivityLogs.length > 0 ? (
                      filteredActivityLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.user_name}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                log.action === "Login" || log.action === "Logout"
                                  ? "outline"
                                  : log.action === "Update"
                                    ? "default"
                                    : "secondary"
                              }
                            >
                              {log.action}
                            </Badge>
                          </TableCell>
                          <TableCell>{log.resource}</TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate">{log.details}</TableCell>
                          <TableCell>{formatDate(log.timestamp)}</TableCell>
                          <TableCell className="hidden lg:table-cell">{log.ip_address}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Users className="h-4 w-4" /> View User Profile
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No activity logs found. User activity will appear here once tracked.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* User Segments Tab */}
            <TabsContent value="segments" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search segments..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isCreateSegmentOpen} onOpenChange={setIsCreateSegmentOpen}>
                  <DialogTrigger asChild>
                    <Button className="ml-auto w-full sm:w-auto">
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Segment
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                    <DialogHeader>
                      <DialogTitle>Create User Segment</DialogTitle>
                      <DialogDescription>Define a new user segment based on specific criteria.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="segment-name">Segment Name</Label>
                        <Input id="segment-name" placeholder="e.g., Active MBA Applicants" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="segment-description">Description</Label>
                        <Textarea id="segment-description" placeholder="Describe the purpose of this segment" />
                      </div>
                      <div className="grid gap-2">
                        <Label>Segment Criteria</Label>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Select defaultValue="interest">
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select criteria" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="interest">Interest</SelectItem>
                                <SelectItem value="activity">Activity</SelectItem>
                                <SelectItem value="location">Location</SelectItem>
                                <SelectItem value="registration">Registration Date</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select defaultValue="equals">
                              <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Condition" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="equals">Equals</SelectItem>
                                <SelectItem value="contains">Contains</SelectItem>
                                <SelectItem value="greater_than">Greater than</SelectItem>
                                <SelectItem value="less_than">Less than</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input placeholder="Value" className="flex-1" />
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Remove criterion</span>
                            </Button>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="mt-2 w-full sm:w-auto">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Criterion
                        </Button>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateSegmentOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateSegment}>Create Segment</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Segment Name</TableHead>
                      <TableHead className="hidden md:table-cell">Description</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead className="hidden lg:table-cell">Created</TableHead>
                      <TableHead className="hidden md:table-cell">Last Updated</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUserSegments.length > 0 ? (
                      filteredUserSegments.map((segment) => (
                        <TableRow key={segment.id}>
                          <TableCell className="font-medium">{segment.name}</TableCell>
                          <TableCell className="hidden md:table-cell max-w-[200px] truncate">
                            {segment.description}
                          </TableCell>
                          <TableCell>{segment.user_count}</TableCell>
                          <TableCell className="hidden lg:table-cell">{formatDate(segment.created_at)}</TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(segment.updated_at)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" /> View Users
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" /> Edit Segment
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" /> Send Message
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                  <Trash2 className="h-4 w-4" /> Delete Segment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No segments found. Create your first user segment to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Messaging System Tab */}
            <TabsContent value="messaging" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search messages..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Dialog open={isComposeMessageOpen} onOpenChange={setIsComposeMessageOpen}>
                  <DialogTrigger asChild>
                    <Button className="ml-auto w-full sm:w-auto">
                      <Mail className="mr-2 h-4 w-4" />
                      Compose Message
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                      <DialogTitle>Compose Message</DialogTitle>
                      <DialogDescription>Create a message to send to a specific user segment.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="message-title">Message Title</Label>
                        <Input
                          id="message-title"
                          placeholder="Enter message title"
                          value={messageTitle}
                          onChange={(e) => setMessageTitle(e.target.value)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message-recipient">Recipient</Label>
                        {selectedUser ? (
                          <div className="flex items-center justify-between border rounded-md p-2">
                            <div>
                              <div className="font-medium">
                                {users.find((user) => user.id === selectedUser)?.name}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {users.find((user) => user.id === selectedUser)?.email}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>
                              Change
                            </Button>
                          </div>
                        ) : (
                          <Select value={selectedSegment || ""} onValueChange={(value) => setSelectedSegment(value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a user segment" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              {userSegments.map((segment) => (
                                <SelectItem key={segment.id} value={segment.name}>
                                  {segment.name} ({segment.user_count} users)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message-content">Message Content</Label>
                        <Textarea
                          id="message-content"
                          placeholder="Write your message here..."
                          className="min-h-[200px]"
                          value={messageContent}
                          onChange={(e) => setMessageContent(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsComposeMessageOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSendMessage}>Send Message</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Message Title</TableHead>
                      <TableHead>Segment</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Sent Date</TableHead>
                      <TableHead className="hidden lg:table-cell">Performance</TableHead>
                      <TableHead className="w-[80px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMessages.length > 0 ? (
                      filteredMessages.map((message) => (
                        <TableRow key={message.id}>
                          <TableCell className="font-medium">{message.subject}</TableCell>
                          <TableCell>All Users</TableCell>
                          <TableCell>—</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                message.status === "sent"
                                  ? "default"
                                  : message.status === "delivered"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {message.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(message.sent_at)}</TableCell>
                          <TableCell className="hidden lg:table-cell">—</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" /> View Message
                                </DropdownMenuItem>
                                {message.status !== "sent" && (
                                  <Button variant="outline" size="sm">
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Resend
                                  </Button>
                                )}
                                {message.status === "sent" && (
                                  <DropdownMenuItem className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" /> View Analytics
                                  </DropdownMenuItem>
                                )}
                                {message.status !== "Sent" && (
                                  <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="flex items-center gap-2">
                                      <Send className="h-4 w-4" /> Send Now
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="flex items-center gap-2 text-red-600">
                                      <Trash2 className="h-4 w-4" /> Delete Message
                                    </DropdownMenuItem>
                                  </>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center">
                          No messages found. Create your first message to get started.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* User Management Tab */}
            <TabsContent value="users" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-8 w-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Last Active</TableHead>
                      <TableHead className="w-[100px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.role}</TableCell>
                          <TableCell>
                            <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(user.last_active)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Eye className="h-4 w-4" /> View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="flex items-center gap-2">
                                  <Edit className="h-4 w-4" /> Edit User
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => {
                                    setSelectedUser(user.id)
                                    setIsComposeMessageOpen(true)
                                  }}
                                >
                                  <Mail className="h-4 w-4" /> Send Message
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No users found. Users will appear here once they register.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
})

AdminAdvancedUserManagement.displayName = "AdminAdvancedUserManagement"
