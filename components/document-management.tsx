"use client"

import { useState } from "react"
import { File, FileText, FolderPlus, Plus, Search, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function DocumentManagement() {
  const [showUploadDialog, setShowUploadDialog] = useState(false)

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document Management</h1>
          <p className="text-muted-foreground mt-2">Securely store and manage your application documents</p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Upload a new document to your application materials.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="document-name">Document Name</Label>
                  <Input id="document-name" placeholder="Enter document name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="document-type">Document Type</Label>
                  <Select>
                    <SelectTrigger id="document-type">
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="cv">CV/Resume</SelectItem>
                      <SelectItem value="letter">Recommendation Letter</SelectItem>
                      <SelectItem value="certificate">Certificate</SelectItem>
                      <SelectItem value="transcript">Transcript</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="university">Associated University (Optional)</Label>
                  <Select>
                    <SelectTrigger id="university">
                      <SelectValue placeholder="Select university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="harvard">Harvard Business School</SelectItem>
                      <SelectItem value="stanford">Stanford GSB</SelectItem>
                      <SelectItem value="wharton">Wharton School</SelectItem>
                      <SelectItem value="all">All Applications</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Upload File</Label>
                  <div className="flex h-32 cursor-pointer items-center justify-center rounded-md border border-dashed border-muted-foreground/25 p-4 transition-colors hover:border-muted-foreground/50">
                    <div className="flex flex-col items-center gap-2 text-center">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drag and drop your file here, or click to browse</p>
                      <p className="text-xs text-muted-foreground">Supports PDF, DOCX, JPG, PNG (Max 10MB)</p>
                    </div>
                    <Input type="file" className="hidden" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button>Upload Document</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline">
            <FolderPlus className="mr-2 h-4 w-4" />
            New Folder
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search documents..." className="pl-8" />
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="essays">Essays</TabsTrigger>
          <TabsTrigger value="cv">CV/Resume</TabsTrigger>
          <TabsTrigger value="letters">Letters</TabsTrigger>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard key={document.id} document={document} />
            ))}
            <AddDocumentCard onUpload={() => setShowUploadDialog(true)} />
          </div>
        </TabsContent>
        <TabsContent value="essays" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents
              .filter((doc) => doc.type === "essay")
              .map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            <AddDocumentCard onUpload={() => setShowUploadDialog(true)} />
          </div>
        </TabsContent>
        <TabsContent value="cv" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents
              .filter((doc) => doc.type === "cv")
              .map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            <AddDocumentCard onUpload={() => setShowUploadDialog(true)} />
          </div>
        </TabsContent>
        <TabsContent value="letters" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents
              .filter((doc) => doc.type === "letter")
              .map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            <AddDocumentCard onUpload={() => setShowUploadDialog(true)} />
          </div>
        </TabsContent>
        <TabsContent value="certificates" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents
              .filter((doc) => doc.type === "certificate")
              .map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            <AddDocumentCard onUpload={() => setShowUploadDialog(true)} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function DocumentCard({ document }: { document: Document }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{document.title}</CardTitle>
            <CardDescription>{document.university}</CardDescription>
          </div>
          {document.type === "essay" || document.type === "cv" ? (
            <FileText className="h-5 w-5 text-muted-foreground" />
          ) : (
            <File className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Version {document.version}</span>
            <span className="text-muted-foreground">Modified {document.modified}</span>
          </div>
          {document.completion < 100 ? (
            <>
              <Progress value={document.completion} className="h-2" />
              <div className="flex justify-between text-xs">
                <span>Completion</span>
                <span>{document.completion}%</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 pt-2">
              {document.tags.map((tag, index) => (
                <Badge key={index} variant={tag === "Official" ? "default" : "outline"}>
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {document.completion < 100 ? "History" : "Download"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{document.title}</DialogTitle>
              <DialogDescription>{document.university}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 p-1">
                {document.completion < 100 ? (
                  <>
                    <div>
                      <h3 className="font-medium">Version History</h3>
                      <div className="mt-2 space-y-3">
                        {[...Array(document.version)].map((_, i) => (
                          <div key={i} className="flex items-center justify-between rounded-md border p-3">
                            <div>
                              <p className="font-medium">Version {document.version - i}</p>
                              <p className="text-sm text-muted-foreground">
                                Modified {i === 0 ? document.modified : `${i + 1} weeks ago`}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                              <Button variant="outline" size="sm">
                                Restore
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="font-medium">Document Checklist</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="intro" className="h-4 w-4" checked />
                          <Label htmlFor="intro" className="text-sm">
                            Introduction
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="background" className="h-4 w-4" checked />
                          <Label htmlFor="background" className="text-sm">
                            Background & Experience
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="goals" className="h-4 w-4" />
                          <Label htmlFor="goals" className="text-sm">
                            Career Goals
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="fit" className="h-4 w-4" />
                          <Label htmlFor="fit" className="text-sm">
                            Program Fit
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="conclusion" className="h-4 w-4" />
                          <Label htmlFor="conclusion" className="text-sm">
                            Conclusion
                          </Label>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8">
                    <File className="h-16 w-16 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-medium">{document.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {document.fileType} • {document.fileSize}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button>Download</Button>
                      <Button variant="outline">View</Button>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <Button size="sm">{document.completion < 100 ? "Edit" : "View"}</Button>
      </CardFooter>
    </Card>
  )
}

function AddDocumentCard({ onUpload }: { onUpload: () => void }) {
  return (
    <Card className="border-dashed">
      <CardHeader className="flex h-[140px] flex-col items-center justify-center space-y-0">
        <Plus className="mb-4 h-8 w-8 text-muted-foreground" />
        <CardTitle className="text-xl font-medium">Add New Document</CardTitle>
      </CardHeader>
      <CardFooter className="flex justify-center pb-6">
        <Button onClick={onUpload}>Upload Document</Button>
      </CardFooter>
    </Card>
  )
}

interface Document {
  id: number
  title: string
  university: string
  type: "essay" | "cv" | "letter" | "certificate"
  version: number
  modified: string
  completion: number
  tags: string[]
  fileType?: string
  fileSize?: string
}

const documents: Document[] = [
  {
    id: 1,
    title: "Statement of Purpose",
    university: "Harvard MBA Application",
    type: "essay",
    version: 3,
    modified: "2 days ago",
    completion: 90,
    tags: [],
  },
  {
    id: 2,
    title: "Resume",
    university: "All Applications",
    type: "cv",
    version: 5,
    modified: "1 week ago",
    completion: 100,
    tags: ["Verified"],
  },
  {
    id: 3,
    title: "Recommendation Letter",
    university: "From: Prof. Smith",
    type: "letter",
    version: 1,
    modified: "3 weeks ago",
    completion: 100,
    tags: ["Official"],
    fileType: "PDF Document",
    fileSize: "245 KB",
  },
  {
    id: 4,
    title: "Recommendation Letter",
    university: "From: Manager Johnson",
    type: "letter",
    version: 2,
    modified: "2 weeks ago",
    completion: 100,
    tags: ["Official"],
    fileType: "PDF Document",
    fileSize: "312 KB",
  },
  {
    id: 5,
    title: "GMAT Score Report",
    university: "Official Document",
    type: "certificate",
    version: 1,
    modified: "1 month ago",
    completion: 100,
    tags: ["Official", "Verified"],
    fileType: "PDF Document",
    fileSize: "156 KB",
  },
  {
    id: 6,
    title: "Transcript",
    university: "Undergraduate Studies",
    type: "certificate",
    version: 1,
    modified: "2 months ago",
    completion: 100,
    tags: ["Official", "Verified"],
    fileType: "PDF Document",
    fileSize: "1.2 MB",
  },
]
