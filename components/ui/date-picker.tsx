"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerProps {
  value?: string
  onChange?: (date: string | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
}: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  )
  const [month, setMonth] = React.useState<Date>(
    value ? new Date(value) : new Date()
  )

  React.useEffect(() => {
    if (value) {
      const newDate = new Date(value)
      setDate(newDate)
      setMonth(newDate)
    } else {
      setDate(undefined)
      setMonth(new Date())
    }
  }, [value])

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (onChange) {
      // Format date as YYYY-MM-DD for database storage
      onChange(selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined)
    }
  }

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const years = Array.from({ length: new Date().getFullYear() - 1900 + 1 }, (_, i) => 1900 + i)

  const handleMonthChange = (monthIndex: string) => {
    const newMonth = new Date(month)
    newMonth.setMonth(parseInt(monthIndex))
    setMonth(newMonth)
  }

  const handleYearChange = (year: string) => {
    const newMonth = new Date(month)
    newMonth.setFullYear(parseInt(year))
    setMonth(newMonth)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "h-9 w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex items-center justify-between p-2 border-b">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newMonth = new Date(month)
              newMonth.setMonth(month.getMonth() - 1)
              setMonth(newMonth)
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Select value={month.getMonth().toString()} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthName, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {monthName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={month.getFullYear().toString()} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[80px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.reverse().map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newMonth = new Date(month)
              newMonth.setMonth(month.getMonth() + 1)
              setMonth(newMonth)
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          month={month}
          onMonthChange={setMonth}
          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
          initialFocus
          classNames={{
            caption: "hidden", // Hide the default caption since we have our own
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
