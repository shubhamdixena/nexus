"use client"

import { useState } from "react"
import { Bookmark, BookmarkCheck, Filter, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

export function KnowledgeBase() {
  const [showFilters, setShowFilters] = useState(false)
  const [savedSops, setSavedSops] = useState<number[]>([])

  const toggleSaved = (id: number) => {
    if (savedSops.includes(id)) {
      setSavedSops(savedSops.filter((sopId) => sopId !== id))
    } else {
      setSavedSops([...savedSops, id])
    }
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">
            Browse successful Statement of Purpose examples with annotations and ratings
          </p>
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
          <Input type="search" placeholder="Search SOPs..." className="pl-8" />
        </div>
      </div>

      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4 md:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <label htmlFor="program-type">Program Type</label>
                <Select>
                  <SelectTrigger id="program-type">
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Program Type</SelectLabel>
                      <SelectItem value="mba">MBA</SelectItem>
                      <SelectItem value="ms">MS</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="undergrad">Undergraduate</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="field-of-study">Field of Study</label>
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
                <label htmlFor="university-tier">University Tier</label>
                <Select>
                  <SelectTrigger id="university-tier">
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>University Tier</SelectLabel>
                      <SelectItem value="tier1">Tier 1 (Top 20)</SelectItem>
                      <SelectItem value="tier2">Tier 2 (21-50)</SelectItem>
                      <SelectItem value="tier3">Tier 3 (51-100)</SelectItem>
                      <SelectItem value="tier4">Tier 4 (101+)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="rating">Rating</label>
                <Select>
                  <SelectTrigger id="rating">
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Rating</SelectLabel>
                      <SelectItem value="any">Any</SelectItem>
                      <SelectItem value="5star">5 Stars</SelectItem>
                      <SelectItem value="4star">4+ Stars</SelectItem>
                      <SelectItem value="3star">3+ Stars</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
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
          <TabsTrigger value="all">All SOPs</TabsTrigger>
          <TabsTrigger value="saved">Saved</TabsTrigger>
          <TabsTrigger value="top">Top Rated</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sops.map((sop) => (
              <SopCard
                key={sop.id}
                sop={sop}
                isSaved={savedSops.includes(sop.id)}
                onToggleSave={() => toggleSaved(sop.id)}
              />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="saved" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sops
              .filter((sop) => savedSops.includes(sop.id))
              .map((sop) => (
                <SopCard key={sop.id} sop={sop} isSaved={true} onToggleSave={() => toggleSaved(sop.id)} />
              ))}
          </div>
        </TabsContent>
        <TabsContent value="top" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sops
              .filter((sop) => sop.rating >= 4.5)
              .map((sop) => (
                <SopCard
                  key={sop.id}
                  sop={sop}
                  isSaved={savedSops.includes(sop.id)}
                  onToggleSave={() => toggleSaved(sop.id)}
                />
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function SopCard({ sop, isSaved, onToggleSave }: { sop: Sop; isSaved: boolean; onToggleSave: () => void }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-1">
        <div className="flex items-center justify-between px-3 py-2">
          <Badge variant="outline" className="bg-background">
            {sop.program}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onToggleSave} className="h-8 w-8">
            {isSaved ? <BookmarkCheck className="h-4 w-4 text-primary" /> : <Bookmark className="h-4 w-4" />}
            <span className="sr-only">{isSaved ? "Remove from saved" : "Save SOP"}</span>
          </Button>
        </div>
      </div>

      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1 text-lg">{sop.university}</CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="bg-secondary/20">
            {sop.field}
          </Badge>
          <Badge variant="outline">{sop.country}</Badge>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between border-t pt-3 bg-muted/20">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" variant="default" className="w-full">
              View Statement of Purpose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>
                {sop.program} at {sop.university}
              </DialogTitle>
              <DialogDescription>{sop.field}</DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-6 p-1">
                <div className="rounded-lg border p-4">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <h3>Statement of Purpose</h3>
                    {sop.content && sop.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Key Elements</h3>
                  <div className="mt-2 space-y-2">
                    {sop.keyElements &&
                      sop.keyElements.map((element, index) => (
                        <div key={index} className="rounded-md border bg-muted/50 p-3">
                          <h4 className="font-medium">{element.title}</h4>
                          <p className="mt-1 text-sm text-muted-foreground">{element.description}</p>
                        </div>
                      ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium">Your Notes</h3>
                  <div className="mt-2">
                    <Textarea placeholder="Add your private notes here..." className="min-h-[100px]" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={onToggleSave}>
                    {isSaved ? <BookmarkCheck className="mr-2 h-4 w-4" /> : <Bookmark className="mr-2 h-4 w-4" />}
                    {isSaved ? "Saved" : "Save SOP"}
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  )
}

interface Sop {
  id: number
  program: string
  university: string
  author: string
  year: string
  rating: number
  excerpt: string
  country: string
  field: string
  likes: number
  views: number
  content: string[]
  keyElements: {
    title: string
    description: string
  }[]
}

const sops: Sop[] = [
  {
    id: 1,
    program: "MBA",
    university: "Harvard Business School",
    author: "John Smith",
    year: "2023",
    rating: 5,
    excerpt:
      "My journey into business began when I started a small e-commerce venture during my undergraduate studies. This experience taught me the importance of strategic thinking and effective leadership, which I hope to further develop through Harvard's case-based learning approach...",
    country: "United States",
    field: "Business",
    likes: 245,
    views: 1203,
    content: [
      "My journey into business began when I started a small e-commerce venture during my undergraduate studies. This experience taught me the importance of strategic thinking and effective leadership, which I hope to further develop through Harvard's case-based learning approach.",
      "Throughout my five years at XYZ Corporation, I've led cross-functional teams to implement digital transformation initiatives that increased operational efficiency by 35%. These experiences have shown me the impact of data-driven decision making and the need for leaders who can navigate technological disruption.",
      "Harvard Business School's focus on global business perspectives aligns perfectly with my career goal of leading international expansion for technology companies. The diverse student body and emphasis on collaborative learning will provide invaluable insights into different markets and business cultures.",
      "My volunteer work with Junior Achievement, where I mentor young entrepreneurs from underserved communities, has reinforced my belief in business as a force for positive social change. I'm particularly excited about HBS's Social Enterprise Initiative and the opportunity to explore how business principles can address pressing societal challenges.",
      "After completing my MBA, I plan to return to the technology sector in a strategic role focused on international market development. Long-term, I aspire to lead a global technology company that prioritizes innovation, sustainability, and social responsibility.",
      "Harvard's unparalleled network, rigorous curriculum, and emphasis on leadership development make it the ideal program for my goals. I am confident that an MBA from HBS will provide me with the knowledge, skills, and connections needed to make a meaningful impact in the business world and beyond.",
    ],
    keyElements: [
      {
        title: "Personal Journey",
        description:
          "The author effectively connects their entrepreneurial beginnings to their interest in Harvard's program, creating a compelling narrative arc.",
      },
      {
        title: "Professional Achievements",
        description:
          "Specific accomplishments with quantifiable results demonstrate the applicant's leadership abilities and potential.",
      },
      {
        title: "Program Fit",
        description:
          "Clear connections between Harvard's specific offerings and the applicant's goals show thorough research and genuine interest.",
      },
      {
        title: "Future Vision",
        description:
          "The SOP articulates both short-term and long-term goals, showing a strategic approach to career planning.",
      },
    ],
  },
  {
    id: 2,
    program: "MS Computer Science",
    university: "Stanford University",
    author: "Emily Chen",
    year: "2022",
    rating: 4.5,
    excerpt:
      "As a software engineer with three years of industry experience, I've developed a deep interest in artificial intelligence and its applications in healthcare. Stanford's renowned AI lab and interdisciplinary approach would provide the perfect environment for me to pursue my research interests...",
    country: "United States",
    field: "Computer Science",
    likes: 189,
    views: 876,
    content: [
      "As a software engineer with three years of industry experience, I've developed a deep interest in artificial intelligence and its applications in healthcare. Stanford's renowned AI lab and interdisciplinary approach would provide the perfect environment for me to pursue my research interests.",
      "My undergraduate research at MIT, where I worked on developing machine learning algorithms for medical image analysis, sparked my passion for using technology to improve healthcare outcomes. This project, which resulted in a publication in the Journal of Medical Imaging, convinced me of the transformative potential of AI in medicine.",
      "At Google Health, I've been fortunate to work on developing predictive models for early disease detection. While this experience has been invaluable, I've identified gaps in my theoretical knowledge that I'm eager to address through Stanford's rigorous curriculum, particularly courses like CS231n: Convolutional Neural Networks for Visual Recognition and CS224n: Natural Language Processing with Deep Learning.",
      "I'm particularly drawn to Professor Sarah Johnson's work on reinforcement learning for personalized treatment recommendations. Her approach to combining clinical expertise with advanced AI techniques aligns perfectly with my research interests, and I would be honored to contribute to her lab's groundbreaking work.",
      "After completing my MS degree, I plan to pursue a PhD and eventually lead research initiatives at the intersection of AI and healthcare, either in academia or industry. My ultimate goal is to develop AI systems that augment healthcare providers' capabilities and improve patient outcomes globally.",
      "Stanford's collaborative culture, cutting-edge research facilities, and connections to Silicon Valley make it the ideal place for me to take the next step in my academic and professional journey. I am confident that the knowledge and skills I would gain at Stanford would enable me to make meaningful contributions to the field of AI in healthcare.",
    ],
    keyElements: [
      {
        title: "Technical Background",
        description:
          "The author clearly establishes their technical credentials and experience relevant to the program.",
      },
      {
        title: "Research Experience",
        description: "Specific mention of undergraduate research and publication demonstrates academic potential.",
      },
      {
        title: "Knowledge of Program",
        description:
          "References to specific courses and faculty members show thorough research about Stanford's offerings.",
      },
      {
        title: "Clear Research Focus",
        description:
          "The SOP articulates a specific research interest (AI in healthcare) that aligns with the university's strengths.",
      },
    ],
  },
  {
    id: 3,
    program: "PhD in Economics",
    university: "London School of Economics",
    author: "Michael Johnson",
    year: "2023",
    rating: 4.8,
    excerpt:
      "My research on developing economies during my master's program revealed significant gaps in our understanding of how technology adoption affects income inequality. At LSE, I hope to work with Professor Sarah Williams, whose work on technological diffusion has greatly influenced my research direction...",
    country: "United Kingdom",
    field: "Economics",
    likes: 132,
    views: 654,
    content: [
      "My research on developing economies during my master's program revealed significant gaps in our understanding of how technology adoption affects income inequality. At LSE, I hope to work with Professor Sarah Williams, whose work on technological diffusion has greatly influenced my research direction.",
      "My interest in development economics was sparked during my undergraduate studies at the University of Cape Town, where I witnessed firsthand the complex economic challenges facing South Africa. This experience led me to pursue a master's degree at the University of Amsterdam, where my thesis examined the impact of mobile banking adoption on rural entrepreneurship in Kenya.",
      "Through my work at the World Bank over the past two years, I've had the opportunity to contribute to projects evaluating digital infrastructure investments across Sub-Saharan Africa. These experiences have convinced me of the need for more rigorous empirical research on how technological change affects economic opportunities in developing regions.",
      "My proposed research at LSE would build on this foundation by investigating how different patterns of technology adoption influence income distribution and social mobility. I'm particularly interested in developing econometric models that can better account for the complex interactions between technological change, institutional quality, and human capital development.",
      "LSE's Department of Economics, with its strong tradition of heterodox approaches and emphasis on policy relevance, provides the ideal intellectual environment for this work. I'm especially drawn to the development economics cluster and the International Inequalities Institute, which align perfectly with my research interests.",
      "After completing my PhD, I aspire to continue this line of research as an academic, while maintaining connections to policy institutions where I can help translate research findings into effective development strategies. I believe that LSE, with its global reputation and emphasis on research that addresses pressing societal challenges, is uniquely positioned to help me achieve these goals.",
    ],
    keyElements: [
      {
        title: "Research Proposal",
        description:
          "The author clearly articulates their research interests and how they align with the department's strengths.",
      },
      {
        title: "Academic Trajectory",
        description:
          "The SOP shows a logical progression from undergraduate studies to master's research to the proposed PhD work.",
      },
      {
        title: "Professional Experience",
        description:
          "Work at the World Bank demonstrates practical experience in the field and connections to policy applications.",
      },
      {
        title: "Faculty Alignment",
        description:
          "Specific mention of potential faculty advisor shows research into the department and thoughtful consideration of fit.",
      },
    ],
  },
  {
    id: 4,
    program: "MS Data Science",
    university: "ETH Zurich",
    author: "Sophia Müller",
    year: "2023",
    rating: 4.3,
    excerpt:
      "The intersection of machine learning and computational biology represents a frontier with immense potential for scientific discovery. My background in both computer science and molecular biology has prepared me to contribute to this exciting field, and ETH Zurich's Data Science program offers the interdisciplinary environment I seek...",
    country: "Switzerland",
    field: "Data Science",
    likes: 98,
    views: 542,
    content: [
      "The intersection of machine learning and computational biology represents a frontier with immense potential for scientific discovery. My background in both computer science and molecular biology has prepared me to contribute to this exciting field, and ETH Zurich's Data Science program offers the interdisciplinary environment I seek.",
      "During my undergraduate studies at Technical University of Munich, I developed a strong foundation in algorithms and statistical methods while simultaneously pursuing coursework in molecular biology. This dual focus culminated in my thesis project, where I implemented a deep learning approach to predict protein-protein interactions from sequence data.",
      "My subsequent work at the Max Planck Institute for Biochemistry has further strengthened my technical skills and biological knowledge. As part of the Computational Systems Biology group, I've contributed to developing tools for analyzing single-cell RNA sequencing data, resulting in two co-authored publications in Bioinformatics and Nature Methods.",
      "ETH Zurich's MS in Data Science program, with its strong emphasis on both theoretical foundations and practical applications, would enable me to deepen my expertise in machine learning while continuing to apply these methods to biological problems. I'm particularly excited about courses like 'Advanced Machine Learning' and 'Statistical Methods in Computational Biology.'",
      "I'm especially interested in Professor Martin Weber's work on interpretable machine learning for genomics and would welcome the opportunity to contribute to his research group. The interdisciplinary nature of his lab, which brings together computer scientists, statisticians, and biologists, represents the collaborative environment in which I thrive.",
      "After completing my master's degree, I plan to pursue a PhD and ultimately establish my own research group focused on developing novel computational methods for understanding complex biological systems. ETH Zurich's world-class reputation in both data science and life sciences makes it the ideal place for me to take this crucial next step in my academic journey.",
    ],
    keyElements: [
      {
        title: "Interdisciplinary Background",
        description:
          "The author effectively highlights their dual expertise in computer science and biology, making them well-suited for the program.",
      },
      {
        title: "Research Experience",
        description: "Specific mention of publications demonstrates research productivity and potential.",
      },
      {
        title: "Program Knowledge",
        description: "References to specific courses and faculty show thorough research about ETH Zurich's offerings.",
      },
      {
        title: "Career Vision",
        description: "Clear articulation of long-term goals demonstrates purpose and direction.",
      },
    ],
  },
  {
    id: 5,
    program: "MFA Creative Writing",
    university: "Columbia University",
    author: "David Rodriguez",
    year: "2022",
    rating: 4.7,
    excerpt:
      "Stories have always been my way of making sense of the world. Growing up between cultures—my mother's Puerto Rican heritage and my father's Mexican roots—I learned early on that narratives shape our understanding of identity and belonging. Columbia's MFA program, with its emphasis on diverse voices and literary craft, would provide the ideal environment for me to develop as a writer...",
    country: "United States",
    field: "Creative Writing",
    likes: 156,
    views: 723,
    content: [
      "Stories have always been my way of making sense of the world. Growing up between cultures—my mother's Puerto Rican heritage and my father's Mexican roots—I learned early on that narratives shape our understanding of identity and belonging. Columbia's MFA program, with its emphasis on diverse voices and literary craft, would provide the ideal environment for me to develop as a writer.",
      "My undergraduate studies in Comparative Literature at Brown University deepened my appreciation for storytelling across cultures and traditions. Courses on Latin American magical realism and the Harlem Renaissance particularly influenced my writing, which explores themes of cultural hybridity, migration, and urban life.",
      "Since graduating, I've been fortunate to have short stories published in The Kenyon Review and Ploughshares, and to receive a fellowship at the Bread Loaf Writers' Conference. These experiences have been invaluable, but I now seek the sustained mentorship and community that Columbia's MFA program offers.",
      "I'm particularly drawn to Columbia's faculty, especially Professor Isabel Morales, whose work on narrative structure and cultural memory resonates deeply with my own preoccupations. The opportunity to work with her and other distinguished writers in Columbia's program would push me to refine my craft and expand my literary horizons.",
      "New York City itself, with its rich literary history and vibrant multicultural communities, would provide endless inspiration for my writing. I'm especially interested in exploring how urban spaces shape identity and community—themes I've begun to address in my collection of linked short stories set in Washington Heights.",
      "After completing my MFA, I hope to publish a collection of short stories and a novel while teaching creative writing at the university level. Columbia's track record of preparing writers not only for literary careers but also for teaching positions makes it the perfect program for my goals.",
    ],
  },
  {
    id: 6,
    program: "PhD in Neuroscience",
    university: "University of California, San Francisco",
    author: "Aisha Patel",
    year: "2023",
    rating: 4.9,
    excerpt:
      "The human brain's capacity to adapt and reorganize itself—its neuroplasticity—has fascinated me since I first learned about stroke recovery during my undergraduate research. This interest has guided my academic and research journey, leading me to pursue a PhD in Neuroscience at UCSF, where cutting-edge research on neural circuits and rehabilitation is transforming our understanding of brain function...",
    country: "United States",
    field: "Neuroscience",
    likes: 178,
    views: 892,
    content: [
      "The human brain's capacity to adapt and reorganize itself—its neuroplasticity—has fascinated me since I first learned about stroke recovery during my undergraduate research. This interest has guided my academic and research journey, leading me to pursue a PhD in Neuroscience at UCSF, where cutting-edge research on neural circuits and rehabilitation is transforming our understanding of brain function.",
      "My undergraduate work at Johns Hopkins University, where I majored in Neuroscience with a minor in Computer Science, provided me with a strong foundation in both experimental techniques and computational methods. My honors thesis, which examined the effects of transcranial magnetic stimulation on motor learning, sparked my interest in neuromodulation as a tool for enhancing recovery after brain injury.",
      "After graduating, I joined the Neural Engineering Lab at MIT as a research assistant, where I've spent the past two years developing closed-loop brain-computer interfaces for stroke rehabilitation. This work, which has resulted in two first-author publications in Journal of Neural Engineering and a patent application, has convinced me of the potential for technology to revolutionize neurorehabilitation.",
      "UCSF's Neuroscience PhD program stands out for its interdisciplinary approach and emphasis on translational research. I'm particularly drawn to the work of Professor Michael Chen, whose innovative research on activity-dependent plasticity and neural interface technologies aligns perfectly with my interests. The opportunity to work in his lab would allow me to build on my previous experience while exploring new approaches to promoting neural recovery.",
      "Beyond Professor Chen's lab, UCSF's collaborative environment and connections to the broader Bay Area neurotechnology ecosystem would provide invaluable opportunities for interdisciplinary collaboration. I'm especially excited about the potential to work with engineers, clinicians, and computational neuroscientists to develop and test new interventions for neurological disorders.",
      "My long-term goal is to lead a research program focused on developing novel neuromodulation approaches for promoting recovery after brain injury. UCSF's track record of training scientists who bridge basic and clinical neuroscience makes it the ideal place for me to develop the skills and knowledge needed to pursue this goal.",
    ],
  },
]
