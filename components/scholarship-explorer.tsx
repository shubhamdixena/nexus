"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck, Calendar, Filter, Globe, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { ReportDataButton } from "@/components/report-data-button"

export function ScholarshipExplorer() {
  const [showFilters, setShowFilters] = useState(false)
  const [amountRange, setAmountRange] = useState([0, 100000])

  // Use bookmark service instead of local state
  const {
    bookmarkedItems: savedScholarships,
    isBookmarked,
    toggleBookmark,
    loading: bookmarkLoading,
    error: bookmarkError
  } = useBookmarks('scholarship')

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scholarship Explorer</h1>
          <p className="text-muted-foreground mt-2">Find scholarships that match your profile and preferences</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
            {showFilters ? "Hide Filters" : "Show Filters"}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" placeholder="Search scholarships..." className="pl-8" />
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="degree-level">Degree Level</Label>
                <Select>
                  <SelectTrigger id="degree-level">
                    <SelectValue placeholder="Select degree level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Degree Level</SelectLabel>
                      <SelectItem value="bachelors">Bachelors</SelectItem>
                      <SelectItem value="masters">Masters</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="postdoc">Post-Doctoral</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="field-of-study">Field of Study</Label>
                <Select>
                  <SelectTrigger id="field-of-study">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Field of Study</SelectLabel>
                      <SelectItem value="business">Business & Management</SelectItem>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="computer-science">Computer Science</SelectItem>
                      <SelectItem value="medicine">Medicine & Health</SelectItem>
                      <SelectItem value="arts">Arts & Humanities</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Country</SelectLabel>
                      <SelectItem value="usa">United States</SelectItem>
                      <SelectItem value="uk">United Kingdom</SelectItem>
                      <SelectItem value="canada">Canada</SelectItem>
                      <SelectItem value="australia">Australia</SelectItem>
                      <SelectItem value="germany">Germany</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Select>
                  <SelectTrigger id="deadline">
                    <SelectValue placeholder="Select deadline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Deadline</SelectLabel>
                      <SelectItem value="any">Any time</SelectItem>
                      <SelectItem value="1month">Within 1 month</SelectItem>
                      <SelectItem value="3months">Within 3 months</SelectItem>
                      <SelectItem value="6months">Within 6 months</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Label>Amount Range (USD)</Label>
              <Slider
                defaultValue={[0, 100000]}
                max={100000}
                step={1000}
                value={amountRange}
                onValueChange={setAmountRange}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm">${amountRange[0].toLocaleString()}</span>
                <span className="text-sm">${amountRange[1].toLocaleString()}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="outline">Reset</Button>
              <Button>Apply Filters</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="all" className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Scholarships</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Deadlines</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((scholarship) => (
              <ScholarshipCard
                key={scholarship.id}
                scholarship={scholarship}
                isSaved={savedScholarships.includes(scholarship.id.toString())}
                onToggleSave={() => toggleBookmark(scholarship.id.toString())}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scholarships
              .filter((scholarship) => savedScholarships.includes(scholarship.id.toString()))
              .map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  isSaved={true}
                  onToggleSave={() => toggleBookmark(scholarship.id.toString())}
                />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="upcoming" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scholarships
              .filter((scholarship) => {
                const deadlineDate = new Date(scholarship.deadline)
                const currentDate = new Date()
                const diffTime = deadlineDate.getTime() - currentDate.getTime()
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                return diffDays <= 30 && diffDays > 0
              })
              .map((scholarship) => (
                <ScholarshipCard
                  key={scholarship.id}
                  scholarship={scholarship}
                  isSaved={savedScholarships.includes(scholarship.id.toString())}
                  onToggleSave={() => toggleBookmark(scholarship.id.toString())}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ScholarshipCard({
  scholarship,
  isSaved,
  onToggleSave,
}: {
  scholarship: Scholarship
  isSaved: boolean
  onToggleSave: () => void
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="line-clamp-1">{scholarship.title}</CardTitle>
            <CardDescription className="mt-1">
              {scholarship.organization} • {scholarship.country}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onToggleSave}>
            {isSaved ? <BookmarkCheck className="h-5 w-5 text-primary" /> : <Bookmark className="h-5 w-5" />}
            <span className="sr-only">{isSaved ? "Remove from saved" : "Save scholarship"}</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">{scholarship.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge variant="outline">{scholarship.degree}</Badge>
          <Badge variant="outline">${scholarship.amount.toLocaleString()}</Badge>
          <Badge variant="outline">{scholarship.field}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between border-t pt-3">
        <div className="flex items-center text-sm">
          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{scholarship.deadline}</span>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">View Details</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{scholarship.title}</DialogTitle>
              <DialogDescription>
                {scholarship.organization} • {scholarship.country}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4 p-1">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-sm text-muted-foreground">{scholarship.description}</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="font-medium">Details</h3>
                    <ul className="mt-2 space-y-2 text-sm">
                      <li className="flex items-start">
                        <span className="font-medium mr-2">Amount:</span>
                        <span className="text-muted-foreground">${scholarship.amount.toLocaleString()}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">Degree Level:</span>
                        <span className="text-muted-foreground">{scholarship.degree}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">Field of Study:</span>
                        <span className="text-muted-foreground">{scholarship.field}</span>
                      </li>
                      <li className="flex items-start">
                        <span className="font-medium mr-2">Deadline:</span>
                        <span className="text-muted-foreground">{scholarship.deadline}</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium">Eligibility Requirements</h3>
                    <ul className="mt-2 space-y-1 text-sm">
                      {scholarship.eligibility.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span className="text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium">Application Process</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{scholarship.applicationProcess}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button className="flex-1">
                    <Globe className="mr-2 h-4 w-4" />
                    Visit Official Website
                  </Button>
                  <Button variant="outline" onClick={onToggleSave}>
                    {isSaved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                    {isSaved ? "Saved" : "Save Scholarship"}
                  </Button>
                  <ReportDataButton 
                    dataType="scholarship"
                    dataId={scholarship.id.toString()}
                    dataTable="scholarships"
                    currentData={scholarship}
                    variant="outline"
                    size="sm"
                  />
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

interface Scholarship {
  id: number
  title: string
  organization: string
  country: string
  description: string
  amount: number
  deadline: string
  degree: string
  field: string
  eligibility: string[]
  applicationProcess: string
}

const scholarships: Scholarship[] = [
  {
    id: 1,
    title: "Global Leaders Scholarship",
    organization: "International Education Foundation",
    country: "United States",
    description:
      "Full scholarship for outstanding students pursuing graduate studies in STEM fields. This scholarship aims to support future leaders who will make significant contributions to technological innovation and scientific advancement.",
    amount: 50000,
    deadline: "March 15, 2024",
    degree: "Masters",
    field: "STEM",
    eligibility: [
      "Minimum GPA of 3.5 on a 4.0 scale",
      "Demonstrated leadership experience",
      "Strong research background",
      "Two letters of recommendation",
      "Statement of purpose",
    ],
    applicationProcess:
      "Applications must be submitted online through the International Education Foundation portal. Required documents include academic transcripts, CV/resume, research proposal, and letters of recommendation.",
  },
  {
    id: 2,
    title: "Future Innovators Grant",
    organization: "Tech Innovation Council",
    country: "Canada",
    description:
      "Scholarship for students with innovative ideas in technology and computer science. This grant supports creative thinkers who are developing novel solutions to real-world problems through technology.",
    amount: 25000,
    deadline: "April 30, 2024",
    degree: "Bachelors",
    field: "Computer Science",
    eligibility: [
      "Enrolled in an accredited computer science program",
      "Demonstrated interest in innovation and entrepreneurship",
      "Portfolio of projects or prototypes",
      "One letter of recommendation",
    ],
    applicationProcess:
      "Submit your application through the Tech Innovation Council website. Include your project portfolio, academic transcripts, and a 500-word essay describing your innovative idea.",
  },
  {
    id: 3,
    title: "Women in Business Fellowship",
    organization: "Global Business Association",
    country: "United Kingdom",
    description:
      "Supporting women pursuing MBA and business-related graduate programs. This fellowship aims to increase female representation in business leadership and provides networking opportunities with industry leaders.",
    amount: 35000,
    deadline: "May 20, 2024",
    degree: "MBA",
    field: "Business",
    eligibility: [
      "Identify as female",
      "Minimum 2 years of professional work experience",
      "Accepted to an accredited MBA program",
      "Demonstrated leadership potential",
      "Personal statement",
    ],
    applicationProcess:
      "Applications are accepted through the Global Business Association portal. Required materials include resume, academic transcripts, acceptance letter from MBA program, and two essays on leadership and career goals.",
  },
  {
    id: 4,
    title: "Sustainable Development Scholarship",
    organization: "Environmental Research Institute",
    country: "Australia",
    description:
      "Scholarship for students pursuing studies in environmental science, sustainable development, or related fields. This program supports future environmental leaders committed to addressing climate change and sustainability challenges.",
    amount: 30000,
    deadline: "June 15, 2024",
    degree: "PhD",
    field: "Environmental Science",
    eligibility: [
      "Research proposal focused on sustainability",
      "Master's degree in a related field",
      "Strong academic record",
      "Commitment to environmental advocacy",
    ],
    applicationProcess:
      "Submit your application package including research proposal, CV, academic transcripts, and two letters of recommendation through the Environmental Research Institute website.",
  },
  {
    id: 5,
    title: "Digital Arts Excellence Award",
    organization: "Creative Media Foundation",
    country: "France",
    description:
      "Scholarship for talented students in digital arts, animation, game design, and related creative fields. This award recognizes artistic excellence and innovation in digital media.",
    amount: 20000,
    deadline: "July 1, 2024",
    degree: "Bachelors",
    field: "Digital Arts",
    eligibility: [
      "Portfolio demonstrating artistic ability",
      "Enrolled in an accredited digital arts program",
      "Letter of recommendation from art instructor",
      "Artist statement",
    ],
    applicationProcess:
      "Apply online through the Creative Media Foundation portal. Submit your digital portfolio, academic information, and a 300-word artist statement explaining your creative vision.",
  },
  {
    id: 6,
    title: "Healthcare Leaders Scholarship",
    organization: "International Medical Association",
    country: "United States",
    description:
      "Scholarship for students pursuing advanced degrees in healthcare administration, public health, or medical research. This program aims to develop the next generation of healthcare leaders.",
    amount: 40000,
    deadline: "February 28, 2024",
    degree: "Masters",
    field: "Healthcare",
    eligibility: [
      "Bachelor's degree in a related field",
      "Minimum GPA of 3.3",
      "Demonstrated interest in healthcare leadership",
      "Two letters of recommendation",
      "Personal statement",
    ],
    applicationProcess:
      "Complete the online application on the International Medical Association website. Include your academic transcripts, resume, personal statement, and letters of recommendation.",
  },
]
