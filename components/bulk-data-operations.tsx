"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BulkDataOperationsProps {
  entityType: string
  onImport: (data: any[]) => void
  exportData: any[]
  importTemplate?: any[]
}

export function BulkDataOperations({ entityType, onImport, exportData, importTemplate = [] }: BulkDataOperationsProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [exportFormat, setExportFormat] = useState("csv")
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<string | null>(null)
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [parsedData, setParsedData] = useState<any[] | null>(null)

  // Handle file selection for import
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImportFile(e.target.files[0])
      setImportError(null)
    }
  }

  // Parse CSV data
  const parseCSV = (text: string) => {
    const lines = text.split("\n")
    const headers = lines[0].split(",").map((header) => header.trim())

    const result = []
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(",").map((value) => value.trim())
      const entry: Record<string, string> = {}

      headers.forEach((header, index) => {
        entry[header] = values[index] || ""
      })

      result.push(entry)
    }

    return result
  }

  // Parse JSON data
  const parseJSON = (text: string) => {
    try {
      return JSON.parse(text)
    } catch (error) {
      throw new Error("Invalid JSON format")
    }
  }

  // Handle import file submission
  const handleImportSubmit = async () => {
    if (!importFile) {
      setImportError("Please select a file to import")
      return
    }

    try {
      const text = await importFile.text()
      let data

      if (importFile.name.endsWith(".csv")) {
        data = parseCSV(text)
      } else if (importFile.name.endsWith(".json")) {
        data = parseJSON(text)
      } else {
        throw new Error("Unsupported file format. Please use CSV or JSON.")
      }

      // Store parsed data and open confirmation dialog
      setParsedData(data)
      setIsConfirmDialogOpen(true)
      setIsImportDialogOpen(false)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : "Failed to parse file")
    }
  }

  // Confirm import after preview
  const confirmImport = () => {
    if (parsedData) {
      onImport(parsedData)
      setIsConfirmDialogOpen(false)
      setImportSuccess(`Successfully imported ${parsedData.length} ${entityType}`)
      setParsedData(null)
    }
  }

  // Handle export
  const handleExport = () => {
    let dataStr, fileName

    if (exportFormat === "csv") {
      // Convert to CSV
      if (exportData.length === 0) {
        setIsExportDialogOpen(false)
        return
      }

      const headers = Object.keys(exportData[0]).join(",")
      const rows = exportData.map((item) =>
        Object.values(item)
          .map((value) => (typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value))
          .join(","),
      )

      dataStr = [headers, ...rows].join("\n")
      fileName = `${entityType.toLowerCase()}_export_${new Date().toISOString().split("T")[0]}.csv`
    } else {
      // Convert to JSON
      dataStr = JSON.stringify(exportData, null, 2)
      fileName = `${entityType.toLowerCase()}_export_${new Date().toISOString().split("T")[0]}.json`
    }

    const blob = new Blob([dataStr], { type: exportFormat === "csv" ? "text/csv" : "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.setAttribute("href", url)
    a.setAttribute("download", fileName)
    a.click()

    URL.revokeObjectURL(url)
    setIsExportDialogOpen(false)
  }

  // Download import template
  const downloadTemplate = () => {
    let dataStr, fileName

    if (exportFormat === "csv") {
      // Create CSV template
      if (importTemplate.length === 0) {
        // If no template provided, create headers-only template
        const headers =
          entityType === "Schools"
            ? "name,type,location,country,ranking,status"
            : "title,organization,country,amount,deadline,degree,field,status"

        dataStr = headers
      } else {
        const headers = Object.keys(importTemplate[0]).join(",")
        const rows = importTemplate.map((item) =>
          Object.values(item)
            .map((value) => (typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value))
            .join(","),
        )

        dataStr = [headers, ...rows].join("\n")
      }

      fileName = `${entityType.toLowerCase()}_template.csv`
    } else {
      // Create JSON template
      if (importTemplate.length === 0) {
        // If no template provided, create an empty object template
        const template =
          entityType === "Schools"
            ? { name: "", type: "", location: "", country: "", ranking: "", status: "" }
            : { title: "", organization: "", country: "", amount: "", deadline: "", degree: "", field: "", status: "" }

        dataStr = JSON.stringify([template], null, 2)
      } else {
        dataStr = JSON.stringify(importTemplate, null, 2)
      }

      fileName = `${entityType.toLowerCase()}_template.json`
    }

    const blob = new Blob([dataStr], { type: exportFormat === "csv" ? "text/csv" : "application/json" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.setAttribute("href", url)
    a.setAttribute("download", fileName)
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => setIsImportDialogOpen(true)} className="flex items-center gap-2">
        <Upload className="h-4 w-4" />
        Import {entityType}
      </Button>

      <Button variant="outline" onClick={() => setIsExportDialogOpen(true)} className="flex items-center gap-2">
        <Download className="h-4 w-4" />
        Export {entityType}
      </Button>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import {entityType}</DialogTitle>
            <DialogDescription>Upload a CSV or JSON file to import {entityType.toLowerCase()}.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="importFile">File</Label>
              <Input id="importFile" type="file" accept=".csv,.json" onChange={handleFileChange} />
              <p className="text-sm text-muted-foreground">Supported formats: CSV, JSON</p>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={downloadTemplate}>
                Download Template
              </Button>
              <p className="text-sm text-muted-foreground">Use our template for proper formatting</p>
            </div>

            {importError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImportSubmit}>Import</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export {entityType}</DialogTitle>
            <DialogDescription>Export all {entityType.toLowerCase()} data to a file.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="exportFormat">Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger id="exportFormat">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>Export</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Import</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to import {parsedData?.length} {entityType.toLowerCase()}. This action may overwrite
              existing data. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="max-h-[200px] overflow-y-auto border rounded-md p-2 my-4">
            <pre className="text-xs">{JSON.stringify(parsedData, null, 2)}</pre>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmImport}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Success Message */}
      {importSuccess && (
        <Alert className="fixed bottom-4 right-4 w-auto max-w-md bg-green-50 border-green-200 text-green-800 dark:bg-green-900/50 dark:border-green-900 dark:text-green-300 animate-in slide-in-from-bottom-5 fade-in-20">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{importSuccess}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
