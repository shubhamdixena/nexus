"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

export function UniversityFilters() {
  const [tuitionRange, setTuitionRange] = useState([0, 100000])

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Country</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="usa-uni" />
              <Label htmlFor="usa-uni">United States</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="uk-uni" />
              <Label htmlFor="uk-uni">United Kingdom</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="canada-uni" />
              <Label htmlFor="canada-uni">Canada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="australia-uni" />
              <Label htmlFor="australia-uni">Australia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="germany-uni" />
              <Label htmlFor="germany-uni">Germany</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Ranking</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <RadioGroup defaultValue="any">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="rank-any" />
                <Label htmlFor="rank-any">Any</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top10" id="rank-top10" />
                <Label htmlFor="rank-top10">Top 10</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top50" id="rank-top50" />
                <Label htmlFor="rank-top50">Top 50</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="top100" id="rank-top100" />
                <Label htmlFor="rank-top100">Top 100</Label>
              </div>
            </RadioGroup>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Programs</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="mba" />
              <Label htmlFor="mba">MBA</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ms-cs" />
              <Label htmlFor="ms-cs">MS Computer Science</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ms-eng" />
              <Label htmlFor="ms-eng">MS Engineering</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ms-data" />
              <Label htmlFor="ms-data">MS Data Science</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="medicine" />
              <Label htmlFor="medicine">Medicine</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Tuition (Annual)</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-6">
            <Slider
              defaultValue={[0, 100000]}
              max={100000}
              step={5000}
              value={tuitionRange}
              onValueChange={setTuitionRange}
            />
            <div className="flex items-center justify-between">
              <span className="text-sm">${tuitionRange[0].toLocaleString()}</span>
              <span className="text-sm">${tuitionRange[1].toLocaleString()}</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Acceptance Rate</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <RadioGroup defaultValue="any">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="accept-any" />
                <Label htmlFor="accept-any">Any</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="under10" id="accept-under10" />
                <Label htmlFor="accept-under10">Under 10%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="under25" id="accept-under25" />
                <Label htmlFor="accept-under25">Under 25%</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="under50" id="accept-under50" />
                <Label htmlFor="accept-under50">Under 50%</Label>
              </div>
            </RadioGroup>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" size="sm">
            Reset
          </Button>
          <Button size="sm">Apply Filters</Button>
        </div>
      </CardContent>
    </Card>
  )
}
