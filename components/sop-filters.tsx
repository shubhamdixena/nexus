"use client"

import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function SopFilters() {
  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Program Type</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="mba-sop" />
              <Label htmlFor="mba-sop">MBA</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="ms-sop" />
              <Label htmlFor="ms-sop">MS</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="phd-sop" />
              <Label htmlFor="phd-sop">PhD</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="undergrad-sop" />
              <Label htmlFor="undergrad-sop">Undergraduate</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Field of Study</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="business-sop" />
              <Label htmlFor="business-sop">Business & Management</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="engineering-sop" />
              <Label htmlFor="engineering-sop">Engineering</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="cs-sop" />
              <Label htmlFor="cs-sop">Computer Science</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="medicine-sop" />
              <Label htmlFor="medicine-sop">Medicine & Health</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="arts-sop" />
              <Label htmlFor="arts-sop">Arts & Humanities</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">University Tier</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="tier1-sop" />
              <Label htmlFor="tier1-sop">Tier 1 (Top 20)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="tier2-sop" />
              <Label htmlFor="tier2-sop">Tier 2 (21-50)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="tier3-sop" />
              <Label htmlFor="tier3-sop">Tier 3 (51-100)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="tier4-sop" />
              <Label htmlFor="tier4-sop">Tier 4 (101+)</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Country</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox id="usa-sop" />
              <Label htmlFor="usa-sop">United States</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="uk-sop" />
              <Label htmlFor="uk-sop">United Kingdom</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="canada-sop" />
              <Label htmlFor="canada-sop">Canada</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="australia-sop" />
              <Label htmlFor="australia-sop">Australia</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="europe-sop" />
              <Label htmlFor="europe-sop">Europe</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <h3 className="text-sm font-medium">Rating</h3>
            <ChevronDown className="h-4 w-4" />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-3">
            <RadioGroup defaultValue="any">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="any" id="rating-any" />
                <Label htmlFor="rating-any">Any</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="5star" id="rating-5star" />
                <Label htmlFor="rating-5star">5 Stars</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="4star" id="rating-4star" />
                <Label htmlFor="rating-4star">4+ Stars</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3star" id="rating-3star" />
                <Label htmlFor="rating-3star">3+ Stars</Label>
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
