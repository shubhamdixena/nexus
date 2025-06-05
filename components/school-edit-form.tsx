"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save } from "lucide-react"

interface SchoolEditFormProps {
  school: any
  onSave: (updatedSchool: any) => void
  onCancel: () => void
}

export function SchoolEditForm({ school, onSave, onCancel }: SchoolEditFormProps) {
  const [formData, setFormData] = useState(school)
  const [activeTab, setActiveTab] = useState("basic")

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    })
  }

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Schools List
          </Button>
        </div>
        <Button type="submit">
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit School Profile</CardTitle>
          <CardDescription>Update information for {formData.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="details">School Details</TabsTrigger>
              <TabsTrigger value="academic">Academic Info</TabsTrigger>
              <TabsTrigger value="contact">Contact & Location</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">School Name</Label>
                  <Input id="name" name="name" value={formData.name || ""} onChange={handleChange} required />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="type">School Type</Label>
                  <Select
                    name="type"
                    value={formData.type || "Business School"}
                    onValueChange={(value) => handleSelectChange("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business School">Business School</SelectItem>
                      <SelectItem value="University">University</SelectItem>
                      <SelectItem value="College">College</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description || ""}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ranking">Ranking</Label>
                  <Input
                    id="ranking"
                    name="ranking"
                    type="number"
                    min="1"
                    value={formData.ranking || ""}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    value={formData.status || "active"}
                    onValueChange={(value) => handleSelectChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            {/* School Details Tab */}
            <TabsContent value="details" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="website">Website URL</Label>
                  <Input id="website" name="website" value={formData.website || ""} onChange={handleChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="foundedYear">Founded Year</Label>
                  <Input
                    id="foundedYear"
                    name="foundedYear"
                    type="number"
                    value={formData.foundedYear || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="accreditation">Accreditation</Label>
                  <Input
                    id="accreditation"
                    name="accreditation"
                    value={formData.accreditation || ""}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="motto">School Motto</Label>
                  <Input id="motto" name="motto" value={formData.motto || ""} onChange={handleChange} />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input id="logoUrl" name="logoUrl" value={formData.logoUrl || ""} onChange={handleChange} />
                </div>
              </div>
            </TabsContent>

            {/* Academic Info Tab */}
            <TabsContent value="academic" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="facultySize">Faculty Size</Label>
                    <Input
                      id="facultySize"
                      name="facultySize"
                      type="number"
                      value={formData.facultySize || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="studentPopulation">Student Population</Label>
                    <Input
                      id="studentPopulation"
                      name="studentPopulation"
                      type="number"
                      value={formData.studentPopulation || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="acceptanceRate">Acceptance Rate (%)</Label>
                    <Input
                      id="acceptanceRate"
                      name="acceptanceRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.acceptanceRate || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="graduationRate">Graduation Rate (%)</Label>
                    <Input
                      id="graduationRate"
                      name="graduationRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formData.graduationRate || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="researchFocus">Research Focus Areas</Label>
                  <Textarea
                    id="researchFocus"
                    name="researchFocus"
                    value={formData.researchFocus || ""}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="notableAlumni">Notable Alumni</Label>
                  <Textarea
                    id="notableAlumni"
                    name="notableAlumni"
                    value={formData.notableAlumni || ""}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Contact & Location Tab */}
            <TabsContent value="contact" className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="location">City/Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="campusSize">Campus Size</Label>
                    <Input
                      id="campusSize"
                      name="campusSize"
                      value={formData.campusSize || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email</Label>
                    <Input
                      id="contactEmail"
                      name="contactEmail"
                      type="email"
                      value={formData.contactEmail || ""}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input
                      id="contactPhone"
                      name="contactPhone"
                      value={formData.contactPhone || ""}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="socialMedia">Social Media Links</Label>
                  <Textarea
                    id="socialMedia"
                    name="socialMedia"
                    value={formData.socialMedia || ""}
                    onChange={handleChange}
                    rows={3}
                    placeholder="LinkedIn, Twitter, Facebook, etc. (one per line)"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </Card>
    </form>
  )
}
