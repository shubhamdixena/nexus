"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Users, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Activity,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { InterviewSession } from '@/types/ai-interview'

interface DashboardStats {
  totalSessions: number
  activeSessions: number
  completedSessions: number
  failedSessions: number
  avgDuration: number
  avgScore: number
  totalUsers: number
  sessionsToday: number
}

interface SchoolStats {
  school_id: string
  school_name: string
  session_count: number
  avg_score: number
  completion_rate: number
}

export default function AdminInterviewDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [sessions, setSessions] = useState<InterviewSession[]>([])
  const [schoolStats, setSchoolStats] = useState<SchoolStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<'24h' | '7d' | '30d'>('7d')

  useEffect(() => {
    loadDashboardData()
  }, [selectedTimeRange])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // In a real implementation, you would have dedicated admin API endpoints
      // For now, we'll simulate the data structure
      
      // Mock data - replace with actual API calls
      const mockStats: DashboardStats = {
        totalSessions: 156,
        activeSessions: 12,
        completedSessions: 128,
        failedSessions: 16,
        avgDuration: 1850, // seconds
        avgScore: 75,
        totalUsers: 89,
        sessionsToday: 23
      }

      const mockSessions: InterviewSession[] = [
        {
          id: 'sess_001',
          user_id: 'user_001',
          school_id: 'school_001',
          status: 'completed',
          started_at: new Date(Date.now() - 3600000).toISOString(),
          completed_at: new Date(Date.now() - 1800000).toISOString(),
          duration_seconds: 1800,
          total_turns: 15,
          completion_percentage: 100,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date(Date.now() - 1800000).toISOString()
        },
        // Add more mock sessions...
      ]

      const mockSchoolStats: SchoolStats[] = [
        { school_id: 'harvard', school_name: 'Harvard Business School', session_count: 45, avg_score: 78, completion_rate: 89 },
        { school_id: 'wharton', school_name: 'Wharton School', session_count: 38, avg_score: 76, completion_rate: 92 },
        { school_id: 'stanford', school_name: 'Stanford GSB', session_count: 31, avg_score: 80, completion_rate: 85 },
        { school_id: 'kellogg', school_name: 'Kellogg School', session_count: 28, avg_score: 74, completion_rate: 88 },
        { school_id: 'booth', school_name: 'Chicago Booth', session_count: 14, avg_score: 77, completion_rate: 86 }
      ]

      setStats(mockStats)
      setSessions(mockSessions)
      setSchoolStats(mockSchoolStats)

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'in_progress': return <Activity className="h-4 w-4" />
      case 'failed': return <XCircle className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const exportData = () => {
    // Implement data export functionality
    console.log('Exporting dashboard data...')
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  const chartData = schoolStats.map(school => ({
    name: school.school_name.split(' ')[0], // Shortened name for chart
    sessions: school.session_count,
    score: school.avg_score
  }))

  const pieData = [
    { name: 'Completed', value: stats?.completedSessions || 0, color: '#10b981' },
    { name: 'Active', value: stats?.activeSessions || 0, color: '#3b82f6' },
    { name: 'Failed', value: stats?.failedSessions || 0, color: '#ef4444' }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Interview Dashboard</h1>
          <p className="text-muted-foreground">Monitor and analyze interview session performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={loadDashboardData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2">
        {(['24h', '7d', '30d'] as const).map((range) => (
          <Button
            key={range}
            variant={selectedTimeRange === range ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedTimeRange(range)}
          >
            {range === '24h' ? 'Last 24 Hours' : 
             range === '7d' ? 'Last 7 Days' : 
             'Last 30 Days'}
          </Button>
        ))}
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.sessionsToday} today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeSessions}</div>
              <p className="text-xs text-muted-foreground">
                Currently in progress
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(stats.avgDuration)}</div>
              <p className="text-xs text-muted-foreground">
                Per completed session
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgScore}/100</div>
              <p className="text-xs text-muted-foreground">
                Overall performance
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
          <TabsTrigger value="schools">School Analytics</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sessions by School Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Sessions by School</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sessions" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Session Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Session Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Interview Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Turns</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono">
                          {session.id.slice(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(session.status)}>
                            {getStatusIcon(session.status)}
                            <span className="ml-1">{session.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {session.started_at ? 
                            new Date(session.started_at).toLocaleString() : 
                            'Not started'
                          }
                        </TableCell>
                        <TableCell>
                          {session.duration_seconds ? 
                            formatDuration(session.duration_seconds) : 
                            '--'
                          }
                        </TableCell>
                        <TableCell>{session.total_turns || '--'}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>School Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>School</TableHead>
                    <TableHead>Sessions</TableHead>
                    <TableHead>Avg Score</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolStats.map((school) => (
                    <TableRow key={school.school_id}>
                      <TableCell className="font-medium">
                        {school.school_name}
                      </TableCell>
                      <TableCell>{school.session_count}</TableCell>
                      <TableCell>
                        <Badge variant={school.avg_score > 75 ? 'default' : 'secondary'}>
                          {school.avg_score}/100
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={school.completion_rate > 85 ? 'default' : 'secondary'}>
                          {school.completion_rate}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
